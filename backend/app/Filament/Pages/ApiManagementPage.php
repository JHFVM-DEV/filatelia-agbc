<?php

namespace App\Filament\Pages;

use App\Services\ApiDocumentationService;
use BackedEnum;
use Carbon\Carbon;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Crypt;
use Laravel\Sanctum\PersonalAccessToken;

class ApiManagementPage extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedKey;

    protected static ?string $navigationLabel = 'Gestión de APIs';

    protected static ?string $title = 'Centro de Creación y Gestión de APIs & Integraciones';

    protected static \UnitEnum|string|null $navigationGroup = 'Administración y Seguridad';

    protected static ?int $navigationSort = 3;

    protected string $view = 'filament.pages.api-management-page';

    public $name = '';
    public $selectedAbilities = [];
    public $expiresInDays = '90';
    public $generatedToken = null;
    public $generatedTokenName = null;
    public $showCreateModal = false;
    public $activeTab = 'tokens'; // 'tokens' | 'docs'
    public $search = '';

    // Modal de Detalles de Token Individual
    public $selectedTokenDetails = null;
    public $showDetailsModal = false;

    public static function canAccess(): bool
    {
        return auth()->user()?->hasRole('SUPER_ADMIN') ?? false;
    }

    public function mount(): void
    {
        $this->selectedAbilities = ['catalogo:read', 'pedidos:read'];
    }

    public function selectAllAbilities(): void
    {
        $all = array_column(ApiDocumentationService::getAvailableScopes(), 'key');
        $this->selectedAbilities = $all;
    }

    public function clearAllAbilities(): void
    {
        $this->selectedAbilities = [];
    }

    public function selectMasterScope(): void
    {
        $this->selectedAbilities = ['*'];
    }

    public function createToken(): void
    {
        $this->validate([
            'name' => 'required|string|min:3|max:150',
            'selectedAbilities' => 'required|array|min:1',
            'expiresInDays' => 'nullable|numeric|min:0',
        ], [
            'name.required' => 'El nombre identificador de la API es obligatorio.',
            'selectedAbilities.required' => 'Debe seleccionar al menos un permiso o scope para la clave.',
            'selectedAbilities.min' => 'Debe seleccionar al menos un permiso o scope para la clave.',
        ]);

        $user = auth()->user();
        if (!$user) {
            return;
        }

        $expiresAt = null;
        if ((int) $this->expiresInDays > 0) {
            $expiresAt = Carbon::now()->addDays((int) $this->expiresInDays);
        }

        $abilities = in_array('*', $this->selectedAbilities) ? ['*'] : array_values(array_unique($this->selectedAbilities));

        $tokenResult = $user->createToken(
            $this->name,
            $abilities,
            $expiresAt
        );

        $tokenModel = $tokenResult->accessToken;
        $tokenModel->encrypted_token = Crypt::encryptString($tokenResult->plainTextToken);
        $tokenModel->save();

        $this->generatedToken = $tokenResult->plainTextToken;
        $this->generatedTokenName = $this->name;

        // Reset inputs
        $this->name = '';
        $this->selectedAbilities = ['catalogo:read'];
        $this->expiresInDays = '90';
        $this->showCreateModal = false;

        Notification::make()
            ->title('API Key Generada Exitosamente')
            ->body('La clave se ha generado. Asegúrese de copiarla ahora; por seguridad no se volverá a mostrar.')
            ->success()
            ->send();
    }

    public function dismissGeneratedToken(): void
    {
        $this->generatedToken = null;
        $this->generatedTokenName = null;
    }

    public function viewDetails(int $id): void
    {
        $token = PersonalAccessToken::with('tokenable')->find($id);
        if (!$token) {
            Notification::make()->title('API Key no encontrada')->danger()->send();
            return;
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
                    'description' => 'Permiso institucional',
                    'category' => 'General',
                ];
            }
        }

        $baseUrl = config('app.url', 'http://localhost:8000') . '/api';
        $tokenPlaceholder = $plainToken ?: '<API_TOKEN>';

        $this->selectedTokenDetails = [
            'id' => $token->id,
            'name' => $token->name,
            'token_value' => $plainToken,
            'abilities' => $abilities,
            'detailed_scopes' => $detailedScopes,
            'tokenable_name' => $token->tokenable?->name ?? 'Super Administrador',
            'tokenable_email' => $token->tokenable?->email ?? 'admin@filatelia.bo',
            'created_at' => $token->created_at ? $token->created_at->format('d/m/Y H:i:s') : '-',
            'expires_at' => $token->expires_at ? $token->expires_at->format('d/m/Y H:i:s') : 'Sin expiración (Permanente)',
            'last_used' => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Nunca utilizado',
            'is_expired' => $token->expires_at ? Carbon::now()->gt($token->expires_at) : false,
            'curl_catalog' => "curl -X GET \"{$baseUrl}/products\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer {$tokenPlaceholder}\"",
            'curl_orders' => "curl -X GET \"{$baseUrl}/admin/orders\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer {$tokenPlaceholder}\"",
        ];

        $this->showDetailsModal = true;
    }

    public function closeDetailsModal(): void
    {
        $this->showDetailsModal = false;
        $this->selectedTokenDetails = null;
    }

    public function downloadTokenPostman(int $id)
    {
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

        return response()->streamDownload(function () use ($json) {
            echo $json;
        }, "API_{$safeName}_Postman.json", [
            'Content-Type' => 'application/json',
        ]);
    }

    public function downloadTokenMarkdown(int $id)
    {
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

        return response()->streamDownload(function () use ($md) {
            echo $md;
        }, "API_{$safeName}_Manual.md", [
            'Content-Type' => 'text/markdown; charset=UTF-8',
        ]);
    }

    public function revokeToken(int $id): void
    {
        $token = PersonalAccessToken::find($id);
        if ($token) {
            $tokenName = $token->name;
            $token->delete();

            if ($this->selectedTokenDetails && $this->selectedTokenDetails['id'] === $id) {
                $this->closeDetailsModal();
            }

            Notification::make()
                ->title('API Key Revocada')
                ->body("La clave '{$tokenName}' fue dada de baja permanentemente.")
                ->warning()
                ->send();
        }
    }

    public function downloadPostman()
    {
        $collection = ApiDocumentationService::generatePostmanCollection();
        $json = json_encode($collection, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return response()->streamDownload(function () use ($json) {
            echo $json;
        }, 'Filatelia_Bolivia_API.postman_collection.json', [
            'Content-Type' => 'application/json',
        ]);
    }

    public function downloadOpenApi()
    {
        $spec = ApiDocumentationService::generateOpenApiSpec();
        $json = json_encode($spec, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return response()->streamDownload(function () use ($json) {
            echo $json;
        }, 'filatelia-openapi-spec.json', [
            'Content-Type' => 'application/json',
        ]);
    }

    public function downloadMarkdown()
    {
        $md = ApiDocumentationService::generateMarkdownDoc();

        return response()->streamDownload(function () use ($md) {
            echo $md;
        }, 'FILATELIA_BOLIVIA_API_DOCUMENTACION.md', [
            'Content-Type' => 'text/markdown; charset=UTF-8',
        ]);
    }

    public function downloadWord()
    {
        $htmlWord = ApiDocumentationService::generateWordReport();

        return response()->streamDownload(function () use ($htmlWord) {
            echo $htmlWord;
        }, 'INFORME_TECNICO_API_FILATELIA_BOLIVIA.doc', [
            'Content-Type' => 'application/msword; charset=UTF-8',
        ]);
    }

    public function downloadTokenWord(int $id)
    {
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

        return response()->streamDownload(function () use ($htmlWord) {
            echo $htmlWord;
        }, "INFORME_TECNICO_API_{$safeName}.doc", [
            'Content-Type' => 'application/msword; charset=UTF-8',
        ]);
    }

    public function getViewData(): array

    {
        $tokensQuery = PersonalAccessToken::with('tokenable')
            ->whereNotIn('name', ['auth-token', 'unified-token'])
            ->orderBy('created_at', 'desc');

        if (!empty(trim($this->search))) {
            $tokensQuery->where('name', 'like', '%' . trim($this->search) . '%');
        }

        $allTokens = $tokensQuery->get()->map(function (PersonalAccessToken $t) {
            $isExpired = $t->expires_at ? Carbon::now()->gt($t->expires_at) : false;

            $plainToken = null;
            if (!empty($t->encrypted_token)) {
                try {
                    $plainToken = Crypt::decryptString($t->encrypted_token);
                } catch (\Throwable $e) {
                    $plainToken = null;
                }
            }

            return [
                'id' => $t->id,
                'name' => $t->name,
                'token_value' => $plainToken,
                'tokenable_name' => $t->tokenable?->name ?? 'Super Administrador',
                'abilities' => $t->abilities ?? [],
                'last_used' => $t->last_used_at ? $t->last_used_at->diffForHumans() : 'Nunca',
                'expires_at' => $t->expires_at ? $t->expires_at->format('d/m/Y H:i') : 'Permanente',
                'is_expired' => $isExpired,
                'created_at' => $t->created_at ? $t->created_at->format('d/m/Y H:i') : '-',
            ];
        });

        $activeCount = $allTokens->where('is_expired', false)->count();
        $expiredCount = $allTokens->where('is_expired', true)->count();

        return [
            'tokens' => $allTokens,
            'totalTokens' => $allTokens->count(),
            'activeCount' => $activeCount,
            'expiredCount' => $expiredCount,
            'availableScopes' => ApiDocumentationService::getAvailableScopes(),
            'endpointsGroups' => ApiDocumentationService::getEndpointsDoc(),
        ];
    }
}
