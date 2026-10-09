<?php

namespace App\Providers\Filament;

use App\Filament\Widgets\CustomerSupportStatsWidget;
use App\Filament\Widgets\DepartmentSalesChartWidget;
use App\Filament\Widgets\ExecutiveStatsOverviewWidget;
use App\Filament\Widgets\MonthlyRevenueChartWidget;
use App\Filament\Widgets\PaymentMethodsChartWidget;
use App\Filament\Widgets\PhilatelicStatsWidget;
use App\Filament\Widgets\RegionalStockWidget;
use App\Filament\Widgets\StampCategoryChartWidget;
use App\Filament\Widgets\WarehouseVaultStatsWidget;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationItem;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Support\Icons\Heroicon;
use Filament\View\PanelsRenderHook;
use Filament\Widgets\AccountWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->brandName('Filatelia Oficial — Bóveda & Catálogo')
            ->brandLogo(fn () => asset('images/cropped-LOGOcen.png'))
            ->brandLogoHeight('2.5rem')
            ->favicon(fn () => asset('images/FILATELIA-1.png'))
            ->font('Plus Jakarta Sans')
            ->colors([
                'primary' => Color::hex('#102542'),
            ])
            ->darkMode(false)
            ->databaseNotifications()
            ->navigationItems([
                NavigationItem::make('Ver Tienda Pública')
                    ->url('http://localhost:3000')
                    ->icon(Heroicon::OutlinedArrowTopRightOnSquare)
                    ->openUrlInNewTab()
                    ->group('Enlaces Externos')
                    ->sort(99),
            ])
            ->renderHook(
                PanelsRenderHook::USER_MENU_BEFORE,
                fn (): string => '<a 
                    href="http://localhost:3000" 
                    target="_blank" 
                    style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.875rem; border-radius: 0.75rem; background: #102542; color: #FECC36; font-weight: 700; font-size: 0.75rem; text-decoration: none; margin-right: 0.75rem; transition: all 0.2s; box-shadow: 0 2px 6px rgba(16, 37, 66, 0.15);"
                    onmouseover="this.style.background=\'#2C63AC\'; this.style.color=\'#FFFFFF\';"
                    onmouseout="this.style.background=\'#102542\'; this.style.color=\'#FECC36\';"
                    title="Abrir la vitrina de la tienda web en una nueva pestaña"
                >
                    <svg style="width: 0.875rem; height: 0.875rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Volver a la Tienda Web</span>
                </a>'
            )
            ->renderHook(
                PanelsRenderHook::HEAD_END,
                fn (): string => '<link rel="stylesheet" href="' . asset('css/admin-custom.css') . '?v=2.2">
                <style>
                    /* Estilos Personalizados Filatelia de Alta Gama - Tema Institucional Luminoso */
                    :root {
                        --filatelia-azul: #102542;
                        --filatelia-azul-dark: #102542;
                        --filatelia-oro: #FECC36;
                        --filatelia-marfil: #FAF8F0;
                    }
                    /* Fondo General Claro y Luminoso */
                    body, .fi-body, .fi-main, .fi-layout, .fi-page {
                        background-color: #F8FAFC !important;
                    }
                    /* Barra lateral institucional clara */
                    .fi-sidebar {
                        background-color: #FFFFFF !important;
                        border-right: 1px solid #E2E8F0 !important;
                        box-shadow: 2px 0 8px rgba(16, 37, 66, 0.02) !important;
                    }
                    .fi-sidebar-header {
                        background-color: #FFFFFF !important;
                        border-bottom: 1px solid #E2E8F0 !important;
                    }
                    /* Barra superior institucional limpia */
                    .fi-topbar {
                        background-color: #FFFFFF !important;
                        border-bottom: 1px solid #E2E8F0 !important;
                        box-shadow: 0 1px 4px rgba(16, 37, 66, 0.04) !important;
                    }
                    .fi-topbar nav, .fi-topbar-item {
                        color: #102542 !important;
                    }
                    /* Tarjetas y Contenedores */
                    .fi-section, .fi-ta-ctn, .fi-widget {
                        border-color: #E2E8F0 !important;
                        box-shadow: 0 2px 8px rgba(16, 37, 66, 0.03) !important;
                    }
                    /* Botones primarios en Azul Institucional con Acentos Oro */
                    .fi-btn-primary {
                        background: #102542 !important;
                        color: #FFFFFF !important;
                        font-weight: 700 !important;
                        box-shadow: 0 3px 8px rgba(16, 37, 66, 0.2) !important;
                        border: none !important;
                    }
                    .fi-btn-primary:hover {
                        background: #102542 !important;
                        color: #FECC36 !important;
                    }
                    /* Insignias */
                    .fi-badge {
                        font-weight: 600 !important;
                    }
                    /* Barras de Desplazamiento Personalizadas Claras (Azul y Oro) */
                    :root {
                        --scrollbar-track: #F1F5F9;
                        --scrollbar-thumb: #CBD5E1;
                        --scrollbar-thumb-hover: #102542;
                    }
                    html, body, .fi-sidebar-nav, .fi-main, .fi-ta-content, .fi-modal-content, aside {
                        scrollbar-width: thin;
                        scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
                    }
                    ::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                    ::-webkit-scrollbar-track {
                        background: #F1F5F9;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: #CBD5E1;
                        border-radius: 9999px;
                        border: 2px solid #F1F5F9;
                        transition: background-color 0.2s ease, box-shadow 0.2s ease;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: #102542;
                        box-shadow: 0 0 8px rgba(16, 37, 66, 0.3);
                    }
                    ::-webkit-scrollbar-corner {
                        background: #F1F5F9;
                    }
                </style>'
            )
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->widgets([
                ExecutiveStatsOverviewWidget::class,
                MonthlyRevenueChartWidget::class,
                DepartmentSalesChartWidget::class,
                PaymentMethodsChartWidget::class,
                PhilatelicStatsWidget::class,
                StampCategoryChartWidget::class,
                WarehouseVaultStatsWidget::class,
                RegionalStockWidget::class,
                CustomerSupportStatsWidget::class,
                AccountWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
