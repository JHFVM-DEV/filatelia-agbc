<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ApiDocumentationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Laravel\Sanctum\PersonalAccessToken;

class ApiTokenController extends Controller
{
    /**
     * Valida que el usuario peticionario sea SUPER_ADMIN institucional
     */
    protected function authorizeSuperAdmin(Request $request): ?JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado en la plataforma institucional.',
            ], 401);
        }

        $isSuper = $user->hasRole('SUPER_ADMIN') || $user->email === 'admin@filatelia.bo';
        if (!$isSuper) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado: Este módulo de control de APIs está reservado con exclusividad al Super Administrador.',
            ], 403);
        }

        return null;
    }

    /**
     * Listado de tokens emitidos
     */
    public function index(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $allScopes = collect(ApiDocumentationService::getAvailableScopes())->keyBy('key');

        $tokens = PersonalAccessToken::with('tokenable')
            ->whereNotIn('name', ['auth-token', 'unified-token'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (PersonalAccessToken $token) use ($allScopes) {
                $isExpired = $token->expires_at ? Carbon::now()->gt($token->expires_at) : false;
                
                $plainToken = null;
                if (!empty($token->encrypted_token)) {
                    try {
                        $plainToken = Crypt::decryptString($token->encrypted_token);
                    } catch (\Throwable $e) {
                        $plainToken = null;
                    }
                }

                $abilities = $token->abilities ?? ['*'];
                $detailedScopes = [];
                foreach ($abilities as $ab) {
                    if (isset($allScopes[$ab])) {
                        $detailedScopes[] = $allScopes[$ab];
                    } else {
                        $detailedScopes[] = [
                            'key' => $ab,
                            'label' => $ab,
                            'description' => 'Permiso personalizado del sistema',
                            'category' => 'General',
                        ];
                    }
                }

                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'token_value' => $plainToken,
                    'token_preview' => $plainToken ? substr($plainToken, 0, 10) . '...' . substr($plainToken, -6) : null,
                    'abilities' => $abilities,
                    'detailed_scopes' => $detailedScopes,
                    'tokenable_name' => $token->tokenable?->name ?? 'Super Administrador',
                    'tokenable_email' => $token->tokenable?->email ?? 'admin@filatelia.bo',
                    'last_used_at' => $token->last_used_at?->toIso8601String(),
                    'last_used_human' => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Nunca utilizado',
                    'expires_at' => $token->expires_at?->toIso8601String(),
                    'expires_human' => $token->expires_at ? $token->expires_at->diffForHumans() : 'Sin expiración',
                    'created_at' => $token->created_at?->toIso8601String(),
                    'status' => $isExpired ? 'EXPIRED' : 'ACTIVE',
                    'is_expired' => $isExpired,
                ];
            });

        return response()->json([
            'success' => true,
            'tokens' => $tokens,
            'available_scopes' => ApiDocumentationService::getAvailableScopes(),
            'total_active' => $tokens->where('status', 'ACTIVE')->count(),
            'total_expired' => $tokens->where('status', 'EXPIRED')->count(),
        ]);
    }

    /**
     * Obtiene el detalle completo de una API Key específica
     */
    public function show(Request $request, int|string $id): JsonResponse
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $token = PersonalAccessToken::with('tokenable')->find($id);
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'API Key no encontrada.',
            ], 404);
        }

        $plainToken = null;
        if (!empty($token->encrypted_token)) {
            try {
                $plainToken = Crypt::decryptString($token->encrypted_token);
            } catch (\Throwable $e) {
                $plainToken = null;
            }
        }

        $allScopes = collect(ApiDocumentationService::getAvailableScopes())->keyBy('key');
        $abilities = $token->abilities ?? ['*'];
        $detailedScopes = [];
        foreach ($abilities as $ab) {
            if (isset($allScopes[$ab])) {
                $detailedScopes[] = $allScopes[$ab];
            } else {
                $detailedScopes[] = [
                    'key' => $ab,
                    'label' => $ab,
                    'description' => 'Permiso personalizado del sistema',
                    'category' => 'General',
                ];
            }
        }

        $baseUrl = config('app.url', 'http://localhost:8000') . '/api';
        $tokenPlaceholder = $plainToken ?: '<API_TOKEN>';

        $curlSamples = [
            'catalogo' => "curl -X GET \"{$baseUrl}/products\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer {$tokenPlaceholder}\"",
            'pedidos' => "curl -X GET \"{$baseUrl}/admin/orders\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer {$tokenPlaceholder}\"",
            'inventario' => "curl -X GET \"{$baseUrl}/admin/inventory\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer {$tokenPlaceholder}\"",
            'envios' => "curl -X GET \"{$baseUrl}/admin/shipments\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer {$tokenPlaceholder}\"",
        ];

        return response()->json([
            'success' => true,
            'token' => [
                'id' => $token->id,
                'name' => $token->name,
                'token_value' => $plainToken,
                'abilities' => $abilities,
                'detailed_scopes' => $detailedScopes,
                'tokenable_name' => $token->tokenable?->name ?? 'Super Administrador',
                'tokenable_email' => $token->tokenable?->email ?? 'admin@filatelia.bo',
                'last_used_at' => $token->last_used_at?->toIso8601String(),
                'last_used_human' => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Nunca utilizado',
                'expires_at' => $token->expires_at?->toIso8601String(),
                'expires_human' => $token->expires_at ? $token->expires_at->diffForHumans() : 'Sin expiración',
                'created_at' => $token->created_at?->toIso8601String(),
                'status' => ($token->expires_at && Carbon::now()->gt($token->expires_at)) ? 'EXPIRED' : 'ACTIVE',
                'is_expired' => $token->expires_at ? Carbon::now()->gt($token->expires_at) : false,
                'curl_samples' => $curlSamples,
            ],
        ]);
    }

    /**
     * Emite un nuevo token de acceso (API Key)
     */
    public function store(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'abilities' => 'required|array|min:1',
            'abilities.*' => 'string',
            'expires_in_days' => 'nullable|integer|min:0|max:1825', // Hasta 5 años o 0 para permanente
            'user_id' => 'nullable|exists:users,id',
        ]);

        $owner = null;
        if (!empty($validated['user_id'])) {
            $owner = User::find($validated['user_id']);
        }
        if (!$owner) {
            $owner = $request->user();
        }

        $expiresAt = null;
        if (!empty($validated['expires_in_days']) && $validated['expires_in_days'] > 0) {
            $expiresAt = Carbon::now()->addDays((int) $validated['expires_in_days']);
        }

        $abilities = in_array('*', $validated['abilities']) ? ['*'] : array_values(array_unique($validated['abilities']));

        // Generar el token con Laravel Sanctum
        $newAccessToken = $owner->createToken(
            $validated['name'],
            $abilities,
            $expiresAt
        );

        $tokenModel = $newAccessToken->accessToken;
        
        // Guardar copia cifrada reversible para consulta administrativa del Super Admin
        $tokenModel->encrypted_token = Crypt::encryptString($newAccessToken->plainTextToken);
        $tokenModel->save();

        return response()->json([
            'success' => true,
            'message' => 'API Key institucional generada exitosamente.',
            'plain_text_token' => $newAccessToken->plainTextToken,
            'token' => [
                'id' => $tokenModel->id,
                'name' => $tokenModel->name,
                'abilities' => $tokenModel->abilities,
                'token_value' => $newAccessToken->plainTextToken,
                'expires_at' => $tokenModel->expires_at?->toIso8601String(),
                'created_at' => $tokenModel->created_at?->toIso8601String(),
                'status' => 'ACTIVE',
            ],
        ], 201);
    }

    /**
     * Revoca y elimina permanentemente un token
     */
    public function destroy(Request $request, int|string $id): JsonResponse
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $token = PersonalAccessToken::find($id);
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'La API Key solicitada no existe o ya fue revocada.',
            ], 404);
        }

        $tokenName = $token->name;
        $token->delete();

        return response()->json([
            'success' => true,
            'message' => "La clave '{$tokenName}' ha sido revocada de forma inmediata e irrevocable.",
        ]);
    }

    /**
     * Retorna la documentación técnica estructurada y endpoints
     */
    public function documentation(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        return response()->json([
            'success' => true,
            'available_scopes' => ApiDocumentationService::getAvailableScopes(),
            'endpoints_groups' => ApiDocumentationService::getEndpointsDoc(),
        ]);
    }

    /**
     * Exporta y descarga la Colección Postman v2.1 de una API específica (con su token preconfigurado)
     */
    public function exportTokenPostman(Request $request, int|string $id)
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $token = PersonalAccessToken::findOrFail($id);
        $plainToken = null;
        if (!empty($token->encrypted_token)) {
            try {
                $plainToken = Crypt::decryptString($token->encrypted_token);
            } catch (\Throwable $e) {
                $plainToken = null;
            }
        }

        $collection = ApiDocumentationService::generatePostmanCollection($plainToken, $token->name);
        $json = json_encode($collection, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $token->name);

        return response($json, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => "attachment; filename=\"API_{$safeName}_Postman.json\"",
        ]);
    }

    /**
     * Exporta y descarga el manual Markdown de una API específica (con su token preconfigurado)
     */
    public function exportTokenMarkdown(Request $request, int|string $id)
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $token = PersonalAccessToken::findOrFail($id);
        $plainToken = null;
        if (!empty($token->encrypted_token)) {
            try {
                $plainToken = Crypt::decryptString($token->encrypted_token);
            } catch (\Throwable $e) {
                $plainToken = null;
            }
        }

        $md = ApiDocumentationService::generateMarkdownDoc($plainToken, $token->name);
        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $token->name);

        return response($md, 200, [
            'Content-Type' => 'text/markdown; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"API_{$safeName}_Manual.md\"",
        ]);
    }

    /**
     * Exporta y descarga la Colección Postman genérica
     */
    public function exportPostman(Request $request)
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $collection = ApiDocumentationService::generatePostmanCollection();
        $json = json_encode($collection, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return response($json, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="Filatelia_Bolivia_API.postman_collection.json"',
        ]);
    }

    /**
     * Exporta y descarga la especificación OpenAPI 3.0.3 (Swagger)
     */
    public function exportOpenApi(Request $request)
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $spec = ApiDocumentationService::generateOpenApiSpec();
        $json = json_encode($spec, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return response($json, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="filatelia-openapi-spec.json"',
        ]);
    }

    /**
     * Exporta y descarga el manual técnico genérico en Markdown
     */
    public function exportMarkdown(Request $request)
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $md = ApiDocumentationService::generateMarkdownDoc();

        return response($md, 200, [
            'Content-Type' => 'text/markdown; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="FILATELIA_BOLIVIA_API_DOCUMENTACION.md"',
        ]);
    }

    /**
     * Exporta y descarga el Informe Técnico Oficial en formato Word (.doc)
     */
    public function exportWord(Request $request)
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $htmlWord = ApiDocumentationService::generateWordReport();

        return response($htmlWord, 200, [
            'Content-Type' => 'application/msword; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="INFORME_TECNICO_API_FILATELIA_BOLIVIA.doc"',
        ]);
    }

    /**
     * Exporta y descarga el Informe Técnico en Word de una API individual con su token y scopes
     */
    public function exportTokenWord(Request $request, int|string $id)
    {
        if ($deny = $this->authorizeSuperAdmin($request)) {
            return $deny;
        }

        $token = PersonalAccessToken::findOrFail($id);
        $plainToken = null;
        if (!empty($token->encrypted_token)) {
            try {
                $plainToken = Crypt::decryptString($token->encrypted_token);
            } catch (\Throwable $e) {
                $plainToken = null;
            }
        }

        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $token->name);
        $htmlWord = ApiDocumentationService::generateWordReport($plainToken, $token->name, ['id' => $token->id]);

        return response($htmlWord, 200, [
            'Content-Type' => 'application/msword; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"INFORME_TECNICO_API_{$safeName}.doc\"",
        ]);
    }
}

