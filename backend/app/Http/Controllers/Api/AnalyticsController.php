<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends AdminController
{
    public static function sessionHash(string $uuid): string
    {
        return hash_hmac('sha256', $uuid, (string) config('app.key'));
    }

    public function record(Request $request): \Illuminate\Http\Response
    {
        $data = $request->validate([
            'event_id' => 'required|uuid', 'visitor_id' => 'required_with:session_id|nullable|uuid', 'session_id' => 'required_with:visitor_id|nullable|uuid',
            'event_type' => 'required|in:page_view,category_view,product_view,add_to_cart,checkout_started',
            'path' => ['required', 'string', 'max:255', 'regex:~^/(?!/)[^?#]*$~'],
            'category_slug' => 'required_if:event_type,category_view|nullable|string|max:255|exists:categories,slug',
            'product_slug' => 'required_if:event_type,product_view,add_to_cart|nullable|string|max:255|exists:products,slug',
            'referrer_host' => 'nullable|string|max:255|regex:/^[a-zA-Z0-9.-]+$/',
            'device' => 'required|in:desktop,tablet,mobile,unknown', 'language' => 'nullable|string|max:30',
        ]);
        if (preg_match('~^/(admin|api|auth)(/|$)~', $data['path'])) return response()->noContent()->header('X-Analytics-Status', 'ignored-private');
        if (preg_match('/bot|crawler|spider/i', $request->userAgent() ?? '')) return response()->noContent()->header('X-Analytics-Status', 'ignored-bot');
        $product = isset($data['product_slug']) ? Product::where('slug', $data['product_slug'])->with('category')->first() : null;
        $anonymous = $request->header('Sec-GPC') === '1' || $request->header('DNT') === '1' || empty($data['visitor_id']);
        DB::table('site_events')->insertOrIgnore([
            'event_id' => $data['event_id'], 'visitor_hash' => $anonymous ? null : self::sessionHash($data['visitor_id']),
            'session_hash' => $anonymous ? null : self::sessionHash($data['session_id']), 'event_type' => $data['event_type'], 'path' => $data['path'],
            'category_slug' => $data['category_slug'] ?? $product?->category?->slug,
            'product_slug' => $data['product_slug'] ?? null, 'referrer_host' => $anonymous ? null : ($data['referrer_host'] ?? null),
            'device' => $data['device'], 'language' => $anonymous ? null : ($data['language'] ?? null), 'occurred_at' => now('UTC'),
        ]);
        return response()->noContent()->header('X-Analytics-Status', $anonymous ? 'recorded-anonymous' : 'recorded');
    }

    public function summary(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Reportes')) return $deny;
        $data = $request->validate(['from' => 'nullable|date_format:Y-m-d', 'to' => 'nullable|date_format:Y-m-d|after_or_equal:from']);
        $from = Carbon::parse($data['from'] ?? now('America/La_Paz')->subDays(29)->toDateString(), 'America/La_Paz')->startOfDay();
        $to = Carbon::parse($data['to'] ?? now('America/La_Paz')->toDateString(), 'America/La_Paz')->endOfDay();
        if ($from->gt($to) || $from->diffInDays($to) > 366) {
            throw \Illuminate\Validation\ValidationException::withMessages(['from' => 'Selecciona un período válido de hasta 366 días.']);
        }
        $start = $from->copy()->utc(); $end = $to->copy()->utc();
        $events = DB::table('site_events')->whereBetween('occurred_at', [$start, $end]);
        $views = (clone $events)->where('event_type', 'page_view');
        $sessions = (clone $events)->distinct()->count('session_hash');
        $previousStart = $start->copy()->subDays((int) $from->diffInDays($to) + 1);
        $previousViews = DB::table('site_events')->where('event_type', 'page_view')->whereBetween('occurred_at', [$previousStart, $start->copy()->subSecond()])->count();
        $pageViews = (clone $views)->count();
        $rank = fn ($type, $column) => (clone $events)->where('event_type', $type)->whereNotNull($column)
            ->select($column)->selectRaw('COUNT(*) as views, COUNT(DISTINCT session_hash) as sessions')->groupBy($column)->orderByDesc('views')->orderBy($column)->limit(10)->get();
        $products = $rank('product_view', 'product_slug')->map(function ($row) {
            $piece = Product::where('slug', $row->product_slug)->first();
            return ['slug' => $row->product_slug, 'name' => $piece?->name ?? $row->product_slug, 'code' => $piece?->catalog_code,
                'views' => (int) $row->views, 'sessions' => (int) $row->sessions];
        });
        $categories = $rank('category_view', 'category_slug')->map(fn ($row) => [
            'slug' => $row->category_slug, 'name' => Category::where('slug', $row->category_slug)->value('name') ?? $row->category_slug,
            'views' => (int) $row->views, 'sessions' => (int) $row->sessions,
        ]);
        $dateExpression = match (DB::connection()->getDriverName()) {
            'pgsql' => "DATE(occurred_at - INTERVAL '4 hours')",
            'mysql', 'mariadb' => 'DATE(DATE_SUB(occurred_at, INTERVAL 4 HOUR))',
            default => "date(occurred_at, '-4 hours')",
        };
        $daily = (clone $views)->selectRaw("{$dateExpression} as day, COUNT(*) as views, COUNT(DISTINCT session_hash) as sessions")
            ->groupBy('day')->get()->keyBy('day');
        $timeline = [];
        for ($day = $from->copy(); $day->lte($to); $day->addDay()) {
            $row = $daily->get($day->toDateString());
            $timeline[] = ['date' => $day->toDateString(), 'views' => (int) ($row->views ?? 0), 'sessions' => (int) ($row->sessions ?? 0)];
        }
        $orders = Order::whereBetween('created_at', [$start, $end]);
        $validOrders = (clone $orders)->where('status', '!=', 'CANCELLED');
        $convertingSessions = (clone $validOrders)->whereIn('analytics_session_hash', (clone $events)->select('session_hash'))->distinct()->count('analytics_session_hash');
        $singlePages = (clone $views)->whereNotNull('session_hash')->select('session_hash')->groupBy('session_hash')->havingRaw('COUNT(*) = 1')->get()->count();
        $pageSessions = (clone $views)->distinct()->count('session_hash');
        $sessionDetails = (clone $events)->whereNotNull('session_hash')->select('session_hash')->selectRaw('MIN(occurred_at) as started, MAX(occurred_at) as ended')->groupBy('session_hash')->get();
        $duration = $sessionDetails->avg(fn ($row) => Carbon::parse($row->started, 'UTC')->diffInSeconds(Carbon::parse($row->ended, 'UTC'))) ?? 0;
        $breakdown = fn ($column) => (clone $views)->select($column)->selectRaw('COUNT(*) as views')->groupBy($column)->orderByDesc('views')->limit(10)->get();
        return response()->json(['success' => true, 'data' => [
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString(), 'timezone' => 'America/La_Paz'],
            'tracking_since' => DB::table('site_events')->min('occurred_at'),
            'last_visit' => DB::table('site_events')->where('event_type', 'page_view')->max('occurred_at'),
            'totals' => ['page_views' => DB::table('site_events')->where('event_type', 'page_view')->count(), 'sessions' => DB::table('site_events')->distinct()->count('session_hash')],
            'kpis' => ['page_views' => $pageViews, 'sessions' => $sessions, 'unique_browsers' => (clone $events)->distinct()->count('visitor_hash'),
                'anonymous_page_views' => (clone $views)->whereNull('session_hash')->count(),
                'active_sessions' => DB::table('site_events')->where('occurred_at', '>=', now('UTC')->subMinutes(5))->distinct()->count('session_hash'),
                'views_change_percent' => $previousViews ? round(($pageViews - $previousViews) / $previousViews * 100, 1) : null,
                'pages_per_session' => $pageSessions ? round((clone $views)->whereNotNull('session_hash')->count() / $pageSessions, 2) : 0,
                'single_page_sessions_percent' => $pageSessions ? round($singlePages / $pageSessions * 100, 1) : 0,
                'average_observed_session_seconds' => round($duration),
                'conversion_percent' => $sessions ? round($convertingSessions / $sessions * 100, 2) : 0,
                'orders' => (clone $validOrders)->count(), 'cancelled_orders' => (clone $orders)->where('status', 'CANCELLED')->count(),
                'order_value' => (float) (clone $validOrders)->sum('total_amount'),
                'verified_order_value' => (float) (clone $validOrders)->whereIn('status', ['PAYMENT_VERIFIED', 'VAULT_PREPARATION', 'PACKED_GLASSINE', 'SHIPPED', 'DELIVERED'])->sum('total_amount'),
                'new_customers' => User::whereHas('roles', fn ($q) => $q->where('name', 'CLIENTE'))->whereBetween('created_at', [$start, $end])->count()],
            'funnel' => ['sessions' => $sessions, 'product_sessions' => (clone $events)->where('event_type', 'product_view')->distinct()->count('session_hash'),
                'cart_sessions' => (clone $events)->where('event_type', 'add_to_cart')->distinct()->count('session_hash'),
                'checkout_sessions' => (clone $events)->where('event_type', 'checkout_started')->distinct()->count('session_hash'), 'order_sessions' => $convertingSessions],
            'pages' => $rank('page_view', 'path'), 'categories' => $categories, 'products' => $products, 'timeline' => $timeline,
            'referrers' => $breakdown('referrer_host'), 'devices' => $breakdown('device'), 'languages' => $breakdown('language'),
            'recent_visits' => (clone $views)->orderByDesc('occurred_at')->limit(10)->get(['path', 'device', 'referrer_host', 'occurred_at']),
        ]]);
    }
}
