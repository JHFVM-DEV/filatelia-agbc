<x-filament-panels::page>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        {{-- KPI Cards Ejecutivas --}}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Eventos Auditados</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #102542; margin-top: 0.25rem;">{{ number_format($totalLogs) }} registros</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Trazabilidad 100% inalterable</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Revalorizaciones</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #D97706; margin-top: 0.25rem;">{{ $totalRevaluations }} dictámenes</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Ajustes de cotización de mercado</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Plusvalía en Bóveda</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: {{ $totalVaultGain >= 0 ? '#059669' : '#e11d48' }}; margin-top: 0.25rem;">
                    {{ $totalVaultGain >= 0 ? '+' : '' }}Bs. {{ number_format($totalVaultGain, 2) }}
                </div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Ganancia de capital acumulada</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Ajustes Físicos de Stock</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #2563eb; margin-top: 0.25rem;">{{ $totalStockAdjustments }} entradas/salidas</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Movimientos de gaveta y custodio</div>
            </div>
        </div>

        {{-- Formulario Oficial de Revalorización Filatélica --}}
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: gap;">
                <h3 style="font-size: 1rem; font-weight: 800; color: #102542; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                    <svg style="width: 1.25rem; height: 1.25rem; color: #D97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ejecutar Revalorización Oficial de Cotización
                </h3>
                <span style="font-size: 0.75rem; color: #64748b; background: #f8fafc; padding: 0.25rem 0.75rem; border-radius: 0.5rem; border: 1px solid #e2e8f0;">
                    Exclusivo Peritaje & Super Administrador
                </span>
            </div>

            <form wire:submit.prevent="executeRevaluation" style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; align-items: flex-end;">
                    
                    {{-- Sello a Revalorizar --}}
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #334155; margin-bottom: 0.375rem;">Pieza Filatélica</label>
                        <select wire:model.live="revalProductId" style="width: 100%; font-size: 0.875rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 0.625rem 0.75rem;">
                            <option value="">-- Seleccionar pieza a revalorizar --</option>
                            @foreach($products as $p)
                                <option value="{{ $p->id }}">{{ $p->catalog_code }} — {{ $p->name }} (Actual: Bs. {{ number_format($p->price, 2) }} | Stock: {{ $p->stock }})</option>
                            @endforeach
                        </select>
                    </div>

                    {{-- Nueva Cotización --}}
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #334155; margin-bottom: 0.375rem;">Nueva Cotización (BOB)</label>
                        <input type="number" step="0.50" min="0.50" wire:model="revalNewPrice" placeholder="Ej. 240.00" style="width: 100%; font-size: 0.875rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 0.625rem 0.75rem;" />
                    </div>

                    {{-- Motivo Oficial --}}
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #334155; margin-bottom: 0.375rem;">Fundamento Pericial / Dictamen</label>
                        <select wire:model="revalReason" style="width: 100%; font-size: 0.875rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 0.625rem 0.75rem;">
                            <option value="Actualización según Catálogo Internacional Scott / Yvert 2026">Actualización según Catálogo Scott / Yvert 2026</option>
                            <option value="Demanda alcista en subasta filatélica internacional">Demanda alcista en subasta internacional</option>
                            <option value="Dictamen pericial por escasez crítica en bóveda">Dictamen pericial por escasez crítica en bóveda</option>
                            <option value="Decreto Supremo Conmemorativo y Reivindicación Patrimonial">Decreto Conmemorativo / Reivindicación Patrimonial</option>
                            <option value="Ajuste por condición de conservación excepcional MINT NH">Conservación excepcional MINT NH certificada</option>
                        </select>
                    </div>

                    {{-- Botón Guardar --}}
                    <div>
                        <button type="submit" style="width: 100%; background: #102542; color: #ffffff; font-weight: 800; font-size: 0.875rem; padding: 0.65rem 1.25rem; border-radius: 0.75rem; border: 1px solid #FECC36; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.2);">
                            <svg style="width: 1rem; height: 1rem; color: #FECC36;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Registrar Revalorización
                        </button>
                    </div>
                </div>

                <div>
                    <input type="text" wire:model="revalNotes" placeholder="Notas periciales complementarias (opcional: ej. lote subastado en Zurich, perito firmante Dr. Arze)..." style="width: 100%; font-size: 0.8rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; background: #f8fafc; color: #334155; padding: 0.5rem 0.75rem;" />
                </div>
            </form>
        </div>

        {{-- Selector de Pestañas --}}
        <div style="display: flex; gap: 0.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">
            <button 
                type="button" 
                wire:click="setTab('audit')" 
                style="padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 700; border-radius: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; {{ $activeTab === 'audit' ? 'background: #102542; color: #ffffff;' : 'background: transparent; color: #64748b;' }}"
            >
                <svg style="width: 1rem; height: 1rem; {{ $activeTab === 'audit' ? 'color: #FECC36;' : '' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Bitácora de Auditoría (Audit Trail)
            </button>

            <button 
                type="button" 
                wire:click="setTab('revaluations')" 
                style="padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 700; border-radius: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; {{ $activeTab === 'revaluations' ? 'background: #102542; color: #ffffff;' : 'background: transparent; color: #64748b;' }}"
            >
                <svg style="width: 1rem; height: 1rem; {{ $activeTab === 'revaluations' ? 'color: #FECC36;' : '' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Historial de Revalorizaciones & Plusvalía ({{ $totalRevaluations }})
            </button>
        </div>

        {{-- CONTENIDO PESTAÑA 1: AUDIT TRAIL --}}
        @if($activeTab === 'audit')
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; overflow: hidden; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
                
                {{-- Filtros y Buscador --}}
                <div style="padding: 1rem 1.25rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Filtrar por Acción:</span>
                        <select wire:model.live="actionFilter" style="font-size: 0.8rem; border-radius: 0.5rem; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 0.35rem 0.65rem;">
                            <option value="ALL">Todas las Acciones</option>
                            <option value="PRICE_REVALUATION">Revalorización de Cotización</option>
                            <option value="STOCK_ADJUSTMENT">Ajuste de Stock Físico</option>
                            <option value="ORDER_STATUS_CHANGED">Estado de Pedidos</option>
                            <option value="DISPATCH_PACKED">Empaque en Glassine</option>
                        </select>
                    </div>

                    <div style="position: relative; width: 100%; max-width: 320px;">
                        <input type="text" wire:model.live.debounce.300ms="searchQuery" placeholder="Buscar por sello, usuario o resumen..." style="width: 100%; font-size: 0.8rem; border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.4rem 0.75rem; padding-left: 2rem;" />
                        <svg style="position: absolute; left: 0.6rem; top: 50%; transform: translateY(-50%); width: 0.9rem; height: 0.9rem; color: #94a3b8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {{-- Tabla de Logs --}}
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem;">
                        <thead style="background: #f1f5f9; color: #475569; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;">
                            <tr>
                                <th style="padding: 0.75rem 1rem;">Fecha y Hora</th>
                                <th style="padding: 0.75rem 1rem;">Usuario Responsable</th>
                                <th style="padding: 0.75rem 1rem;">Acción Fiscalizada</th>
                                <th style="padding: 0.75rem 1rem;">Elemento / Sello</th>
                                <th style="padding: 0.75rem 1rem;">Detalle del Cambio</th>
                                <th style="padding: 0.75rem 1rem;">IP / Terminal</th>
                            </tr>
                        </thead>
                        <tbody style="divide-y: 1px solid #e2e8f0; color: #1e293b;">
                            @forelse($logs as $l)
                                <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#fafaf9'" onmouseout="this.style.background='transparent'">
                                    <td style="padding: 0.75rem 1rem; white-space: nowrap; color: #64748b; font-family: monospace;">
                                        {{ $l->created_at->format('d/m/Y H:i:s') }}
                                    </td>
                                    <td style="padding: 0.75rem 1rem; white-space: nowrap;">
                                        <div style="font-weight: 700; color: #102542;">{{ $l->user_name }}</div>
                                        <div style="font-size: 0.7rem; color: #94a3b8;">{{ $l->user_role ?? 'SISTEMA' }}</div>
                                    </td>
                                    <td style="padding: 0.75rem 1rem; white-space: nowrap;">
                                        @if($l->action === 'PRICE_REVALUATION')
                                            <span style="background: #fef3c7; color: #92400e; padding: 0.2rem 0.5rem; border-radius: 0.375rem; font-weight: 700; font-size: 0.7rem; border: 1px solid #fcd34d;">
                                                REVALORIZACIÓN
                                            </span>
                                        @elseif($l->action === 'STOCK_ADJUSTMENT')
                                            <span style="background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.5rem; border-radius: 0.375rem; font-weight: 700; font-size: 0.7rem; border: 1px solid #bae6fd;">
                                                STOCK BÓVEDA
                                            </span>
                                        @elseif($l->action === 'DISPATCH_PACKED')
                                            <span style="background: #f3e8ff; color: #7e22ce; padding: 0.2rem 0.5rem; border-radius: 0.375rem; font-weight: 700; font-size: 0.7rem; border: 1px solid #d8b4fe;">
                                                EMPAQUE GLASSINE
                                            </span>
                                        @elseif($l->action === 'ORDER_STATUS_CHANGED')
                                            <span style="background: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 0.375rem; font-weight: 700; font-size: 0.7rem; border: 1px solid #86efac;">
                                                ESTADO ORDEN
                                            </span>
                                        @else
                                            <span style="background: #f1f5f9; color: #475569; padding: 0.2rem 0.5rem; border-radius: 0.375rem; font-weight: 700; font-size: 0.7rem;">
                                                {{ $l->action }}
                                            </span>
                                        @endif
                                    </td>
                                    <td style="padding: 0.75rem 1rem; font-weight: 600; color: #102542;">
                                        {{ $l->model_name ?? '—' }}
                                    </td>
                                    <td style="padding: 0.75rem 1rem;">
                                        <div style="font-weight: 600; color: #334155;">{{ $l->change_summary }}</div>
                                        @if($l->rationale)
                                            <div style="font-size: 0.75rem; color: #64748b; font-style: italic; margin-top: 0.2rem;">
                                                Motivo: "{{ $l->rationale }}"
                                            </div>
                                        @endif
                                    </td>
                                    <td style="padding: 0.75rem 1rem; white-space: nowrap; color: #94a3b8; font-family: monospace; font-size: 0.75rem;">
                                        {{ $l->ip_address ?? '127.0.0.1' }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" style="padding: 2.5rem; text-align: center; color: #94a3b8;">
                                        No se encontraron registros de auditoría con los criterios especificados.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        @endif

        {{-- CONTENIDO PESTAÑA 2: HISTORIAL DE REVALORIZACIONES Y PLUSVALÍA --}}
        @if($activeTab === 'revaluations')
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; overflow: hidden; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
                <div style="padding: 1rem 1.25rem; background: #fffbeb; border-bottom: 1px solid #fef3c7; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h4 style="font-weight: 800; color: #92400e; margin: 0; font-size: 0.9rem;">Registro Histórico de Revalorización y Plusvalía Patrimonial</h4>
                        <p style="font-size: 0.75rem; color: #b45309; margin: 0.25rem 0 0 0;">
                            Evolución de cotizaciones de catálogo, demanda en subastas y plusvalía neta de la bóveda.
                        </p>
                    </div>
                    <div style="font-size: 1.1rem; font-weight: 900; color: #059669; background: #ffffff; padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid #d1fae5;">
                        Plusvalía Neta: +Bs. {{ number_format($totalVaultGain, 2) }}
                    </div>
                </div>

                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem;">
                        <thead style="background: #f8fafc; color: #475569; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;">
                            <tr>
                                <th style="padding: 0.75rem 1rem;">Fecha</th>
                                <th style="padding: 0.75rem 1rem;">Pieza Filatélica</th>
                                <th style="padding: 0.75rem 1rem;">Cotización Anterior</th>
                                <th style="padding: 0.75rem 1rem;">Nueva Cotización</th>
                                <th style="padding: 0.75rem 1rem;">Variación %</th>
                                <th style="padding: 0.75rem 1rem;">Stock Bóveda</th>
                                <th style="padding: 0.75rem 1rem;">Plusvalía Generada</th>
                                <th style="padding: 0.75rem 1rem;">Fundamento Pericial</th>
                                <th style="padding: 0.75rem 1rem;">Perito / Admin</th>
                            </tr>
                        </thead>
                        <tbody style="color: #1e293b;">
                            @forelse($revaluations as $r)
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 0.75rem 1rem; white-space: nowrap; color: #64748b; font-family: monospace;">
                                        {{ $r->created_at->format('d/m/Y H:i') }}
                                    </td>
                                    <td style="padding: 0.75rem 1rem;">
                                        <div style="font-weight: 700; color: #102542;">{{ $r->product?->name }}</div>
                                        <div style="font-size: 0.7rem; color: #d97706; font-mono font-bold;">{{ $r->product?->catalog_code }}</div>
                                    </td>
                                    <td style="padding: 0.75rem 1rem; white-space: nowrap; color: #64748b; font-family: monospace;">
                                        Bs. {{ number_format($r->previous_price, 2) }}
                                    </td>
                                    <td style="padding: 0.75rem 1rem; white-space: nowrap; font-weight: 800; color: #102542; font-family: monospace;">
                                        Bs. {{ number_format($r->new_price, 2) }}
                                    </td>
                                    <td style="padding: 0.75rem 1rem; white-space: nowrap;">
                                        <span style="font-weight: 800; font-family: monospace; color: {{ $r->percentage_change >= 0 ? '#059669' : '#e11d48' }};">
                                            {{ $r->percentage_change >= 0 ? '+' : '' }}{{ number_format($r->percentage_change, 2) }}%
                                        </span>
                                    </td>
                                    <td style="padding: 0.75rem 1rem; font-weight: 700; color: #334155;">
                                        {{ $r->stock_at_revaluation }} unid.
                                    </td>
                                    <td style="padding: 0.75rem 1rem; white-space: nowrap; font-weight: 800; color: {{ $r->vault_gain >= 0 ? '#059669' : '#e11d48' }};">
                                        {{ $r->vault_gain >= 0 ? '+' : '' }}Bs. {{ number_format($r->vault_gain, 2) }}
                                    </td>
                                    <td style="padding: 0.75rem 1rem; color: #475569;">
                                        <div style="font-weight: 600;">{{ $r->reason }}</div>
                                        @if($r->notes)
                                            <div style="font-size: 0.75rem; color: #64748b; font-style: italic;">"{{ $r->notes }}"</div>
                                        @endif
                                    </td>
                                    <td style="padding: 0.75rem 1rem; white-space: nowrap; color: #102542; font-weight: 700;">
                                        {{ $r->user_name }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="9" style="padding: 2.5rem; text-align: center; color: #94a3b8;">
                                        Aún no se han registrado revalorizaciones oficiales de cotización.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        @endif

    </div>
</x-filament-panels::page>
