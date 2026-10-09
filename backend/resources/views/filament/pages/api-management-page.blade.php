<x-filament-panels::page>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        {{-- Encabezado Institucional --}}
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
            <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: #D97706; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">
                        Dirección General &bull; Seguridad & Acceso Institucional
                    </span>
                    <span style="font-size: 0.7rem; font-weight: 800; background: #FEF3C7; color: #92400E; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #FCD34D;">
                        Exclusivo Super Administrador
                    </span>
                </div>
                <h2 style="font-size: 1.35rem; font-weight: 900; color: #102542; margin-top: 0.35rem;">
                    Centro de Gestión de APIs y Tokens de Integración
                </h2>
                <p style="font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem;">
                    Emisión segura de credenciales (Laravel Sanctum), control granular de permisos y especificaciones OpenAPI / Postman.
                </p>
            </div>
            <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                <button 
                    type="button"
                    wire:click="$toggle('showCreateModal')" 
                    style="padding: 0.625rem 1.25rem; border-radius: 0.75rem; background: #102542; color: #ffffff; font-weight: 800; font-size: 0.8125rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.25);"
                >
                    <svg style="width: 1rem; height: 1rem; color: #FECC36;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {{ $showCreateModal ? 'Ocultar Formulario' : 'Emitir Nueva API Key' }}
                </button>
            </div>
        </div>

        {{-- Alerta de Token Generado (Solo se muestra una vez) --}}
        @if ($generatedToken)
            <div style="background: #ECFDF5; border: 2px solid #10B981; border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 6px 16px rgba(16, 185, 129, 0.15);">
                <div style="display: flex; align-items: flex-start; gap: 1rem;">
                    <div style="background: #10B981; color: #ffffff; padding: 0.6rem; border-radius: 0.75rem;">
                        <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <span style="font-size: 0.75rem; font-weight: 800; color: #047857; text-transform: uppercase;">
                            ¡Nueva API Key Generada Exitosamente!
                        </span>
                        <h3 style="font-size: 1.15rem; font-weight: 900; color: #064E3B; margin-top: 0.15rem;">
                            Clave para: "{{ $generatedTokenName }}"
                        </h3>
                        <p style="font-size: 0.8125rem; color: #065F46; margin-top: 0.35rem; line-height: 1.4;">
                            <strong>Atención de Seguridad:</strong> Por motivos de confidencialidad y cifrado criptográfico, este token <strong>nunca volverá a ser mostrado</strong>. Cópielo y guárdelo en su gestor de credenciales seguro ahora mismo.
                        </p>

                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.85rem; background: #ffffff; border: 1px solid #A7F3D0; border-radius: 0.75rem; padding: 0.5rem 0.75rem;">
                            <code id="sanctum-token-display" style="flex: 1; font-family: monospace; font-size: 0.875rem; color: #065F46; word-break: break-all; font-weight: 700;">
                                {{ $generatedToken }}
                            </code>
                            <button 
                                type="button"
                                onclick="navigator.clipboard.writeText('{{ $generatedToken }}'); alert('¡Token copiado al portapapeles!');"
                                style="padding: 0.5rem 1rem; border-radius: 0.5rem; background: #059669; color: #ffffff; font-weight: 800; font-size: 0.75rem; border: none; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 0.35rem;"
                            >
                                <svg style="width: 0.875rem; height: 0.875rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copiar al Portapapeles
                            </button>
                        </div>

                        <div style="margin-top: 0.85rem; display: flex; justify-content: flex-end;">
                            <button 
                                type="button"
                                wire:click="dismissGeneratedToken"
                                style="padding: 0.4rem 1rem; border-radius: 0.5rem; background: transparent; color: #047857; font-weight: 800; font-size: 0.75rem; border: 1px solid #10B981; cursor: pointer;"
                            >
                                He guardado la clave, cerrar advertencia
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        @endif

        {{-- Formulario para Emitir Nueva Clave (Expandible) --}}
        @if ($showCreateModal)
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 1.25rem; padding: 1.75rem; box-shadow: 0 4px 16px rgba(16, 37, 66, 0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                    <div>
                        <h3 style="font-size: 1.15rem; font-weight: 900; color: #102542;">
                            Formulario de Emisión de API Key Institucional
                        </h3>
                        <p style="font-size: 0.8125rem; color: #64748b; margin-top: 0.15rem;">
                            Configure el nombre del cliente, caducidad y elija los permisos (*scopes*) específicos.
                        </p>
                    </div>
                    <button 
                        type="button"
                        wire:click="$set('showCreateModal', false)"
                        style="background: transparent; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer;"
                    >
                        &times;
                    </button>
                </div>

                <form wire:submit.prevent="createToken">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display: block; font-size: 0.8125rem; font-weight: 800; color: #102542; margin-bottom: 0.4rem;">
                                Nombre de la Aplicación / Cliente *
                            </label>
                            <input 
                                type="text" 
                                wire:model.defer="name" 
                                placeholder="Ej. Servicio Aduanero Postal, App Móvil, Integración Logística"
                                style="width: 100%; border: 1px solid #cbd5e1; border-radius: 0.75rem; padding: 0.65rem 0.85rem; font-size: 0.875rem;"
                                required
                            />
                            @error('name')
                                <span style="font-size: 0.75rem; color: #dc2626; font-weight: 700; margin-top: 0.25rem; display: block;">{{ $message }}</span>
                            @enderror
                        </div>

                        <div>
                            <label style="display: block; font-size: 0.8125rem; font-weight: 800; color: #102542; margin-bottom: 0.4rem;">
                                Período de Vigencia / Expiración
                            </label>
                            <select 
                                wire:model.defer="expiresInDays"
                                style="width: 100%; border: 1px solid #cbd5e1; border-radius: 0.75rem; padding: 0.65rem 0.85rem; font-size: 0.875rem; background: #ffffff;"
                            >
                                <option value="30">30 Días (1 Mes)</option>
                                <option value="60">60 Días (2 Meses)</option>
                                <option value="90">90 Días (3 Meses - Recomendado)</option>
                                <option value="180">180 Días (6 Meses)</option>
                                <option value="365">365 Días (1 Año Institucional)</option>
                                <option value="0">Sin Expiración (Token Permanente)</option>
                            </select>
                        </div>
                    </div>

                    {{-- Selector de Permisos / Scopes --}}
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
                            <div>
                                <label style="font-size: 0.875rem; font-weight: 900; color: #102542;">
                                    Permisos Disponibles (Scopes Seleccionables) *
                                </label>
                                <span style="font-size: 0.75rem; color: #64748b; display: block;">
                                    Seleccione las capacidades exactas que tendrá esta clave de acceso.
                                </span>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button 
                                    type="button" 
                                    wire:click="selectAllAbilities"
                                    style="padding: 0.35rem 0.75rem; border-radius: 0.5rem; background: #E0E7FF; color: #3730A3; font-weight: 800; font-size: 0.72rem; border: none; cursor: pointer;"
                                >
                                    Marcar Todos
                                </button>
                                <button 
                                    type="button" 
                                    wire:click="selectMasterScope"
                                    style="padding: 0.35rem 0.75rem; border-radius: 0.5rem; background: #FEF3C7; color: #92400E; font-weight: 800; font-size: 0.72rem; border: none; cursor: pointer;"
                                >
                                    Acceso Maestro (*)
                                </button>
                                <button 
                                    type="button" 
                                    wire:click="clearAllAbilities"
                                    style="padding: 0.35rem 0.75rem; border-radius: 0.5rem; background: #F1F5F9; color: #475569; font-weight: 800; font-size: 0.72rem; border: none; cursor: pointer;"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 0.75rem; max-height: 380px; overflow-y: auto; padding: 0.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.875rem;">
                            @foreach ($availableScopes as $scope)
                                <label style="display: flex; align-items: flex-start; gap: 0.65rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.625rem; padding: 0.75rem; cursor: pointer; transition: all 0.2s;">
                                    <input 
                                        type="checkbox" 
                                        wire:model.defer="selectedAbilities" 
                                        value="{{ $scope['key'] }}"
                                        style="margin-top: 0.2rem; border-radius: 0.25rem; accent-color: #102542; width: 1.1rem; height: 1.1rem;"
                                    />
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem;">
                                            <span style="font-weight: 800; font-size: 0.8125rem; color: #102542;">{{ $scope['label'] }}</span>
                                            <code style="font-size: 0.7rem; background: #F1F5F9; padding: 0.15rem 0.35rem; border-radius: 0.25rem; color: #475569;">{{ $scope['key'] }}</code>
                                        </div>
                                        <p style="font-size: 0.72rem; color: #64748b; margin-top: 0.2rem; line-height: 1.3;">
                                            {{ $scope['description'] }}
                                        </p>
                                    </div>
                                </label>
                            @endforeach
                        </div>
                        @error('selectedAbilities')
                            <span style="font-size: 0.75rem; color: #dc2626; font-weight: 700; margin-top: 0.35rem; display: block;">{{ $message }}</span>
                        @enderror
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
                        <button 
                            type="button" 
                            wire:click="$set('showCreateModal', false)"
                            style="padding: 0.625rem 1.25rem; border-radius: 0.75rem; background: #F1F5F9; color: #475569; font-weight: 800; font-size: 0.8125rem; border: none; cursor: pointer;"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            style="padding: 0.625rem 1.5rem; border-radius: 0.75rem; background: #059669; color: #ffffff; font-weight: 800; font-size: 0.8125rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);"
                        >
                            <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Confirmar y Generar Token
                        </button>
                    </div>
                </form>
            </div>
        @endif

        {{-- Tarjetas de Estadísticas --}}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Total Emitidas</span>
                <div style="font-size: 1.5rem; font-weight: 900; color: #102542; margin-top: 0.25rem;">{{ $totalTokens }}</div>
                <span style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; display: block;">Historial de credenciales</span>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Claves Activas</span>
                <div style="font-size: 1.5rem; font-weight: 900; color: #059669; margin-top: 0.25rem;">{{ $activeCount }}</div>
                <span style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; display: block;">Habilitadas para consumo</span>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Claves Expiradas</span>
                <div style="font-size: 1.5rem; font-weight: 900; color: #dc2626; margin-top: 0.25rem;">{{ $expiredCount }}</div>
                <span style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; display: block;">Caducadas por tiempo</span>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Formatos de Exportación</span>
                <div style="font-size: 1.5rem; font-weight: 900; color: #D97706; margin-top: 0.25rem;">4 Formatos</div>
                <span style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; display: block;">Word (.doc), Postman, OpenAPI & MD</span>
            </div>
        </div>

        {{-- Navegación por Pestañas --}}
        <div style="display: flex; gap: 0.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">
            <button 
                type="button" 
                wire:click="$set('activeTab', 'tokens')"
                style="padding: 0.5rem 1.25rem; border-radius: 0.75rem; font-weight: 800; font-size: 0.8125rem; border: none; cursor: pointer; transition: all 0.2s; {{ $activeTab === 'tokens' ? 'background: #102542; color: #ffffff;' : 'background: transparent; color: #64748b;' }}"
            >
                Tokens de Acceso Emitidos ({{ $totalTokens }})
            </button>
            <button 
                type="button" 
                wire:click="$set('activeTab', 'docs')"
                style="padding: 0.5rem 1.25rem; border-radius: 0.75rem; font-weight: 800; font-size: 0.8125rem; border: none; cursor: pointer; transition: all 0.2s; {{ $activeTab === 'docs' ? 'background: #102542; color: #ffffff;' : 'background: transparent; color: #64748b;' }}"
            >
                Documentación & Descargas Técnicas
            </button>
        </div>

        {{-- Pestaña 1: Lista de Tokens --}}
        @if ($activeTab === 'tokens')
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem;">
                    <div>
                        <h3 style="font-size: 1rem; font-weight: 800; color: #102542;">
                            Registro Oficial de API Keys
                        </h3>
                        <p style="font-size: 0.75rem; color: #64748b;">
                            Monitoreo de actividad, scopes autorizados y revocación en tiempo real.
                        </p>
                    </div>
                    <div style="width: 260px;">
                        <input 
                            type="text" 
                            wire:model.live.debounce.300ms="search" 
                            placeholder="Buscar por nombre de cliente..."
                            style="width: 100%; border: 1px solid #cbd5e1; border-radius: 0.625rem; padding: 0.45rem 0.75rem; font-size: 0.8125rem;"
                        />
                    </div>
                </div>

                @if ($tokens->isEmpty())
                    <div style="text-align: center; padding: 3rem 1rem; background: #f8fafc; border-radius: 0.875rem; border: 1px dashed #cbd5e1;">
                        <svg style="width: 3rem; height: 3rem; color: #94a3b8; margin: 0 auto 0.75rem auto;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <h4 style="font-size: 1rem; font-weight: 800; color: #102542;">No hay API Keys registradas</h4>
                        <p style="font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem;">
                            Haga clic en "Emitir Nueva API Key" para generar una credencial institucional.
                        </p>
                    </div>
                @else
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                            <thead>
                                <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b; text-transform: uppercase; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em;">
                                    <th style="padding: 0.75rem 1rem;">Aplicación / Nombre</th>
                                    <th style="padding: 0.75rem 1rem;">Estado</th>
                                    <th style="padding: 0.75rem 1rem;">Permisos (Scopes)</th>
                                    <th style="padding: 0.75rem 1rem;">Último Uso</th>
                                    <th style="padding: 0.75rem 1rem;">Expiración</th>
                                    <th style="padding: 0.75rem 1rem; text-align: right;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($tokens as $t)
                                    <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;">
                                        <td style="padding: 0.85rem 1rem;">
                                            <div style="font-weight: 800; color: #102542; font-size: 0.875rem;">
                                                {{ $t['name'] }}
                                            </div>
                                            <span style="font-size: 0.72rem; color: #94a3b8; display: block; margin-top: 0.15rem;">
                                                Emitido por: {{ $t['tokenable_name'] }} &bull; {{ $t['created_at'] }}
                                            </span>
                                        </td>
                                        <td style="padding: 0.85rem 1rem;">
                                            @if ($t['is_expired'])
                                                <span style="background: #FEE2E2; color: #991B1B; font-weight: 800; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 0.375rem;">
                                                    EXPIRADO
                                                </span>
                                            @else
                                                <span style="background: #D1FAE5; color: #065F46; font-weight: 800; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 0.375rem;">
                                                    ACTIVO
                                                </span>
                                            @endif
                                        </td>
                                        <td style="padding: 0.85rem 1rem;">
                                            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; max-width: 320px;">
                                                @foreach ($t['abilities'] as $ab)
                                                    <span style="background: {{ $ab === '*' ? '#FEF3C7' : '#F1F5F9' }}; color: {{ $ab === '*' ? '#92400E' : '#334155' }}; font-weight: 700; font-size: 0.68rem; padding: 0.15rem 0.4rem; border-radius: 0.25rem;">
                                                        {{ $ab }}
                                                    </span>
                                                @endforeach
                                            </div>
                                        </td>
                                        <td style="padding: 0.85rem 1rem; color: #475569; font-weight: 600;">
                                            {{ $t['last_used'] }}
                                        </td>
                                        <td style="padding: 0.85rem 1rem; color: #475569;">
                                            {{ $t['expires_at'] }}
                                        </td>
                                        <td style="padding: 0.85rem 1rem; text-align: right; white-space: nowrap;">
                                            <div style="display: inline-flex; align-items: center; gap: 0.4rem;">
                                                <button 
                                                    type="button" 
                                                    wire:click="viewDetails({{ $t['id'] }})"
                                                    style="padding: 0.4rem 0.75rem; border-radius: 0.5rem; background: #E0E7FF; color: #3730A3; font-weight: 800; font-size: 0.72rem; border: none; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.25rem;"
                                                    title="Ver todos los detalles, token y descargas de esta API"
                                                >
                                                    <svg style="width: 0.8rem; height: 0.8rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Ver Detalles
                                                </button>
                                                <button 
                                                    type="button" 
                                                    wire:click="revokeToken({{ $t['id'] }})"
                                                    wire:confirm="¿Está seguro de revocar permanentemente la clave '{{ $t['name'] }}'? La integración dejará de funcionar inmediatamente."
                                                    style="padding: 0.4rem 0.75rem; border-radius: 0.5rem; background: #FEE2E2; color: #991B1B; font-weight: 800; font-size: 0.72rem; border: none; cursor: pointer; transition: background 0.2s;"
                                                    title="Revocar permanentemente"
                                                >
                                                    Revocar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>

            {{-- Modal de Detalles Completos de la API Seleccionada --}}
            @if ($showDetailsModal && $selectedTokenDetails)
                <div style="position: fixed; inset: 0; z-index: 1000; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1rem; overflow-y: auto;">
                    <div style="background: #ffffff; border-radius: 1.5rem; max-width: 48rem; width: 100%; padding: 1.75rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #cbd5e1; max-height: 90vh; overflow-y: auto;">
                        {{-- Cabecera del Modal --}}
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.25rem;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 0.7rem; font-weight: 800; color: #D97706; text-transform: uppercase;">
                                        Detalles Oficiales de Credencial
                                    </span>
                                    @if ($selectedTokenDetails['is_expired'])
                                        <span style="background: #FEE2E2; color: #991B1B; font-weight: 800; font-size: 0.65rem; padding: 0.15rem 0.45rem; border-radius: 0.25rem;">
                                            EXPIRADA
                                        </span>
                                    @else
                                        <span style="background: #D1FAE5; color: #065F46; font-weight: 800; font-size: 0.65rem; padding: 0.15rem 0.45rem; border-radius: 0.25rem;">
                                            ACTIVA &bull; HABILITADA
                                        </span>
                                    @endif
                                </div>
                                <h3 style="font-size: 1.35rem; font-weight: 900; color: #102542; margin-top: 0.25rem;">
                                    {{ $selectedTokenDetails['name'] }}
                                </h3>
                                <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.15rem;">
                                    Identificador #{{ $selectedTokenDetails['id'] }} &bull; Asignada a {{ $selectedTokenDetails['tokenable_name'] }} ({{ $selectedTokenDetails['tokenable_email'] }})
                                </p>
                            </div>
                            <button 
                                type="button" 
                                wire:click="closeDetailsModal"
                                style="background: #f1f5f9; border: none; border-radius: 0.5rem; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 1.25rem; font-weight: bold; cursor: pointer;"
                            >
                                &times;
                            </button>
                        </div>

                        {{-- Token de Acceso con Visualización y Copia --}}
                        <div style="background: #0F172A; border-radius: 1rem; padding: 1.25rem; margin-bottom: 1.25rem; color: #ffffff;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #94A3B8; letter-spacing: 0.05em;">
                                    Token de Acceso Bearer
                                </span>
                                @if ($selectedTokenDetails['token_value'])
                                    <button 
                                        type="button" 
                                        onclick="navigator.clipboard.writeText('{{ $selectedTokenDetails['token_value'] }}'); alert('¡Token copiado al portapapeles!');"
                                        style="padding: 0.35rem 0.85rem; border-radius: 0.45rem; background: #059669; color: #ffffff; font-weight: 800; font-size: 0.72rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.35rem;"
                                    >
                                        <svg style="width: 0.8rem; height: 0.8rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        Copiar Token
                                    </button>
                                @endif
                            </div>

                            @if ($selectedTokenDetails['token_value'])
                                <div style="background: #1E293B; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem; font-family: monospace; font-size: 0.85rem; color: #38BDF8; word-break: break-all; font-weight: 700;">
                                    {{ $selectedTokenDetails['token_value'] }}
                                </div>
                            @else
                                <div style="background: #1E293B; border: 1px dashed #64748b; border-radius: 0.5rem; padding: 0.75rem; font-size: 0.75rem; color: #94A3B8;">
                                    Token emitido previamente sin registro cifrado. Para obtener la llave en texto plano se sugiere emitir una nueva credencial.
                                </div>
                            @endif

                            <div style="margin-top: 0.65rem; font-size: 0.72rem; color: #94A3B8;">
                                Encabezado HTTP: <code style="color: #FCD34D;">Authorization: Bearer {{ $selectedTokenDetails['token_value'] ?: '<API_TOKEN>' }}</code>
                            </div>
                        </div>

                        {{-- Cuadrícula de Metadatos --}}
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0.75rem;">
                                <span style="font-size: 0.68rem; color: #64748b; font-weight: 700; text-transform: uppercase; display: block;">Fecha de Emisión</span>
                                <div style="font-size: 0.82rem; font-weight: 800; color: #102542; margin-top: 0.2rem;">{{ $selectedTokenDetails['created_at'] }}</div>
                            </div>
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0.75rem;">
                                <span style="font-size: 0.68rem; color: #64748b; font-weight: 700; text-transform: uppercase; display: block;">Vigencia / Expiración</span>
                                <div style="font-size: 0.82rem; font-weight: 800; color: {{ $selectedTokenDetails['is_expired'] ? '#dc2626' : '#059669' }}; margin-top: 0.2rem;">{{ $selectedTokenDetails['expires_at'] }}</div>
                            </div>
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0.75rem;">
                                <span style="font-size: 0.68rem; color: #64748b; font-weight: 700; text-transform: uppercase; display: block;">Último Acceso</span>
                                <div style="font-size: 0.82rem; font-weight: 800; color: #102542; margin-top: 0.2rem;">{{ $selectedTokenDetails['last_used'] }}</div>
                            </div>
                        </div>

                        {{-- Permisos / Scopes Concedidos --}}
                        <div style="margin-bottom: 1.25rem;">
                            <h4 style="font-size: 0.85rem; font-weight: 900; color: #102542; margin-bottom: 0.5rem;">
                                Permisos Autorizados ({{ count($selectedTokenDetails['abilities']) }})
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.5rem; max-height: 200px; overflow-y: auto; padding: 0.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem;">
                                @foreach ($selectedTokenDetails['detailed_scopes'] as $sc)
                                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.6rem;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.25rem;">
                                            <span style="font-weight: 800; font-size: 0.75rem; color: #102542;">{{ $sc['label'] }}</span>
                                            <code style="font-size: 0.65rem; background: #F1F5F9; padding: 0.1rem 0.3rem; border-radius: 0.2rem; color: #475569;">{{ $sc['key'] }}</code>
                                        </div>
                                        <p style="font-size: 0.68rem; color: #64748b; margin-top: 0.15rem; line-height: 1.3;">
                                            {{ $sc['description'] }}
                                        </p>
                                    </div>
                                @endforeach
                            </div>
                        </div>

                        {{-- Botones de Descarga Específica para esta API --}}
                        <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 1rem; padding: 1.25rem; margin-bottom: 1.25rem;">
                            <div style="margin-bottom: 0.75rem;">
                                <h4 style="font-size: 0.9rem; font-weight: 900; color: #92400E;">
                                    Descargar Paquete de Integración para "{{ $selectedTokenDetails['name'] }}"
                                </h4>
                                <p style="font-size: 0.75rem; color: #B45309;">
                                    Genera la documentación con el token y permisos de esta clave específica preconfigurados.
                                </p>
                            </div>
                            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                                <button 
                                    type="button" 
                                    wire:click="downloadTokenWord({{ $selectedTokenDetails['id'] }})"
                                    style="padding: 0.55rem 1rem; border-radius: 0.6rem; background: #102542; color: #ffffff; font-weight: 800; font-size: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.35rem;"
                                >
                                    <svg style="width: 0.85rem; height: 0.85rem; color: #FECC36;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Descargar Informe Técnico Word (.doc)
                                </button>
                                <button 
                                    type="button" 
                                    wire:click="downloadTokenPostman({{ $selectedTokenDetails['id'] }})"
                                    style="padding: 0.55rem 1rem; border-radius: 0.6rem; background: #EA580C; color: #ffffff; font-weight: 800; font-size: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.35rem;"
                                >
                                    <svg style="width: 0.85rem; height: 0.85rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Descargar Postman Personalizado
                                </button>
                                <button 
                                    type="button" 
                                    wire:click="downloadTokenMarkdown({{ $selectedTokenDetails['id'] }})"
                                    style="padding: 0.55rem 1rem; border-radius: 0.6rem; background: #2563EB; color: #ffffff; font-weight: 800; font-size: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.35rem;"
                                >
                                    <svg style="width: 0.85rem; height: 0.85rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Descargar Manual Markdown Personalizado
                                </button>
                            </div>
                        </div>

                        {{-- Pie del Modal --}}
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 1rem;">
                            <button 
                                type="button" 
                                wire:click="revokeToken({{ $selectedTokenDetails['id'] }})"
                                wire:confirm="¿Está seguro de revocar permanentemente esta API Key?"
                                style="padding: 0.5rem 1rem; border-radius: 0.5rem; background: #FEE2E2; color: #991B1B; font-weight: 800; font-size: 0.75rem; border: none; cursor: pointer;"
                            >
                                Revocar Clave Permanentemente
                            </button>
                            <button 
                                type="button" 
                                wire:click="closeDetailsModal"
                                style="padding: 0.5rem 1.25rem; border-radius: 0.5rem; background: #102542; color: #ffffff; font-weight: 800; font-size: 0.75rem; border: none; cursor: pointer;"
                            >
                                Cerrar Ventana
                            </button>
                        </div>
                    </div>
                </div>
            @endif
        @endif


        {{-- Pestaña 2: Documentación & Descargas Técnicas --}}
        @if ($activeTab === 'docs')
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                {{-- Centro de Descarga de Especificaciones --}}
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
                    <div style="margin-bottom: 1.25rem;">
                        <span style="font-size: 0.75rem; font-weight: 800; color: #D97706; text-transform: uppercase;">
                            Exportación Oficial de Especificaciones
                        </span>
                        <h3 style="font-size: 1.15rem; font-weight: 900; color: #102542; margin-top: 0.2rem;">
                            Descargar Documentación para Desarrolladores y Entidades
                        </h3>
                        <p style="font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem;">
                            Descargue las definiciones listas para importar en Postman, Insomnia o herramientas OpenAPI / Swagger.
                        </p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
                        {{-- Postman Card --}}
                        <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <span style="background: #EA580C; color: #ffffff; font-weight: 900; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 0.35rem;">
                                        POSTMAN v2.1
                                    </span>
                                </div>
                                <h4 style="font-weight: 900; color: #9A3412; font-size: 0.95rem;">Colección Postman Oficial</h4>
                                <p style="font-size: 0.75rem; color: #C2410C; margin-top: 0.25rem; line-height: 1.4;">
                                    Colección preconfigurada con variables de entorno, headers Bearer y peticiones listas para ejecutar.
                                </p>
                            </div>
                            <button 
                                type="button" 
                                wire:click="downloadPostman"
                                style="margin-top: 1rem; padding: 0.55rem 1rem; border-radius: 0.625rem; background: #EA580C; color: #ffffff; font-weight: 800; font-size: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem;"
                            >
                                <svg style="width: 0.875rem; height: 0.875rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar Postman (.json)
                            </button>
                        </div>

                        {{-- OpenAPI Card --}}
                        <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <span style="background: #16A34A; color: #ffffff; font-weight: 900; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 0.35rem;">
                                        OPENAPI 3.0
                                    </span>
                                </div>
                                <h4 style="font-weight: 900; color: #166534; font-size: 0.95rem;">Especificación OpenAPI / Swagger</h4>
                                <p style="font-size: 0.75rem; color: #15803D; margin-top: 0.25rem; line-height: 1.4;">
                                    Estándar de la industria para generar clientes en Python, TypeScript, Java o visualizar en Swagger UI.
                                </p>
                            </div>
                            <button 
                                type="button" 
                                wire:click="downloadOpenApi"
                                style="margin-top: 1rem; padding: 0.55rem 1rem; border-radius: 0.625rem; background: #16A34A; color: #ffffff; font-weight: 800; font-size: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem;"
                            >
                                <svg style="width: 0.875rem; height: 0.875rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar OpenAPI (.json)
                            </button>
                        </div>

                        {{-- Markdown Card --}}
                        <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <span style="background: #2563EB; color: #ffffff; font-weight: 900; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 0.35rem;">
                                        MARKDOWN
                                    </span>
                                </div>
                                <h4 style="font-weight: 900; color: #1E40AF; font-size: 0.95rem;">Manual Técnico Completo (.md)</h4>
                                <p style="font-size: 0.75rem; color: #1D4ED8; margin-top: 0.25rem; line-height: 1.4;">
                                    Documento en texto enriquecido con tablas de scopes, códigos de respuesta HTTP y ejemplos cURL.
                                </p>
                            </div>
                            <button 
                                type="button" 
                                wire:click="downloadMarkdown"
                                style="margin-top: 1rem; padding: 0.55rem 1rem; border-radius: 0.625rem; background: #2563EB; color: #ffffff; font-weight: 800; font-size: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem;"
                            >
                                <svg style="width: 0.875rem; height: 0.875rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar Manual (.md)
                            </button>
                        </div>

                        {{-- Word Report Card --}}
                        <div style="background: #f8fafc; border: 2px solid #102542; border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.08);">
                            <div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <span style="background: #102542; color: #ffffff; font-weight: 900; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 0.35rem;">
                                        WORD OFICIAL (.DOC)
                                    </span>
                                </div>
                                <h4 style="font-weight: 900; color: #102542; font-size: 0.95rem;">Informe Técnico Formal</h4>
                                <p style="font-size: 0.75rem; color: #475569; margin-top: 0.25rem; line-height: 1.4;">
                                    Documento formal para Word con carátula institucional, control documental, topología, matriz de scopes, guía de portal y firmas técnicas.
                                </p>
                            </div>
                            <button 
                                type="button" 
                                wire:click="downloadWord"
                                style="margin-top: 1rem; padding: 0.55rem 1rem; border-radius: 0.625rem; background: #102542; color: #ffffff; font-weight: 800; font-size: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem; box-shadow: 0 4px 10px rgba(16, 37, 66, 0.2);"
                            >
                                <svg style="width: 0.875rem; height: 0.875rem; color: #FECC36;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Descargar Informe Word (.doc)
                            </button>
                        </div>
                    </div>
                </div>

                {{-- Guía Interactiva de Endpoints --}}
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
                    <h3 style="font-size: 1.1rem; font-weight: 900; color: #102542; margin-bottom: 1.25rem;">
                        Catálogo de Endpoints REST Oficiales
                    </h3>

                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        @foreach ($endpointsGroups as $group)
                            <div>
                                <h4 style="font-size: 0.95rem; font-weight: 900; color: #2C63AC; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem; margin-bottom: 0.85rem;">
                                    {{ $group['group'] }}
                                </h4>

                                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                    @foreach ($group['endpoints'] as $ep)
                                        <div style="border: 1px solid #e2e8f0; border-radius: 0.875rem; padding: 1rem; background: #f8fafc;">
                                            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                                    @php
                                                        $methodColor = match($ep['method']) {
                                                            'GET' => '#2563EB',
                                                            'POST' => '#059669',
                                                            'PATCH' => '#D97706',
                                                            'DELETE' => '#DC2626',
                                                            default => '#475569',
                                                        };
                                                    @endphp
                                                    <span style="background: {{ $methodColor }}; color: #ffffff; font-weight: 900; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 0.35rem;">
                                                        {{ $ep['method'] }}
                                                    </span>
                                                    <code style="font-size: 0.85rem; font-weight: 800; color: #102542;">
                                                        {{ $ep['path'] }}
                                                    </code>
                                                </div>
                                                <div style="display: flex; gap: 0.25rem;">
                                                    @foreach ($ep['required_scopes'] as $sc)
                                                        <span style="font-size: 0.65rem; background: #E2E8F0; color: #334155; padding: 0.15rem 0.35rem; border-radius: 0.25rem; font-weight: 700;">
                                                            {{ $sc }}
                                                        </span>
                                                    @endforeach
                                                </div>
                                            </div>

                                            <p style="font-size: 0.8rem; color: #475569; margin-top: 0.4rem;">
                                                {{ $ep['description'] }}
                                            </p>

                                            {{-- Bloque cURL --}}
                                            <div style="margin-top: 0.65rem; background: #0F172A; border-radius: 0.625rem; padding: 0.75rem; position: relative;">
                                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                                                    <span style="font-size: 0.65rem; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Ejemplo cURL</span>
                                                    <button 
                                                        type="button" 
                                                        onclick="navigator.clipboard.writeText(`{{ addslashes($ep['curl_sample']) }}`); alert('¡cURL copiado!');"
                                                        style="background: #334155; color: #ffffff; border: none; padding: 0.2rem 0.5rem; border-radius: 0.3rem; font-size: 0.68rem; cursor: pointer;"
                                                    >
                                                        Copiar cURL
                                                    </button>
                                                </div>
                                                <pre style="margin: 0; font-family: monospace; font-size: 0.75rem; color: #38BDF8; white-space: pre-wrap; word-break: break-all;">{{ $ep['curl_sample'] }}</pre>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
