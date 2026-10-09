<x-filament-panels::page>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
            <div>
                <h2 style="font-size: 1.25rem; font-weight: 900; color: #102542; margin: 0;">Auditoría y Registro de Eventos en Tiempo Real</h2>
                <p style="font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem;">Monitoreo de excepciones, consultas e interacción de usuarios en el servidor.</p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #475569; background: #F8FAFC; padding: 0.5rem 0.875rem; border-radius: 0.75rem; border: 1px solid #e2e8f0;">
                    Tamaño: {{ $logFileSize }}
                </span>
                <button 
                    wire:click="clearLogs" 
                    style="padding: 0.5rem 1rem; background: #FFF1F2; color: #9F1239; font-weight: 800; font-size: 0.75rem; border-radius: 0.75rem; border: 1px solid #FECDD3; cursor: pointer; display: flex; align-items: center; gap: 0.375rem; transition: all 0.2s;"
                    onmouseover="this.style.background='#FFE4E6'"
                    onmouseout="this.style.background='#FFF1F2'"
                >
                    <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Limpiar Registro
                </button>
            </div>
        </div>

        {{-- Filtro de Niveles --}}
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            @foreach(['ALL' => 'Todos los Eventos', 'INFO' => 'Informativos', 'WARNING' => 'Advertencias', 'ERROR' => 'Errores'] as $key => $label)
            <button 
                wire:click="$set('logFilter', '{{ $key }}')" 
                style="padding: 0.5rem 1rem; border-radius: 0.75rem; font-size: 0.75rem; font-weight: 800; border: 1px solid {{ $logFilter === $key ? '#102542' : '#e2e8f0' }}; background: {{ $logFilter === $key ? '#102542' : '#ffffff' }}; color: {{ $logFilter === $key ? '#FECC36' : '#475569' }}; cursor: pointer; transition: all 0.2s; box-shadow: {{ $logFilter === $key ? '0 2px 6px rgba(16, 37, 66, 0.2)' : 'none' }};"
            >
                {{ $label }}
            </button>
            @endforeach
        </div>

        {{-- Visor de Consola Límpido y Elegante --}}
        <div style="background: #ffffff; color: #0F172A; padding: 1.25rem; border-radius: 1.25rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.75rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05); overflow-x: auto; max-height: 550px; display: flex; flex-direction: column; gap: 0.5rem; border: 1px solid #e2e8f0;">
            @forelse($logs as $l)
                <div style="padding: 0.625rem 0.875rem; border-radius: 0.5rem; line-height: 1.5; display: flex; align-items: flex-start; gap: 0.5rem; border: 1px solid {{ $l['level'] === 'ERROR' ? '#FECDD3' : ($l['level'] === 'WARNING' ? '#FEF08A' : '#E2E8F0') }}; background: {{ $l['level'] === 'ERROR' ? '#FFF1F2' : ($l['level'] === 'WARNING' ? '#FFFBEB' : '#F8FAFC') }};">
                    <span style="padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.625rem; font-weight: 900; text-transform: uppercase; flex-shrink: 0; background: {{ $l['level'] === 'ERROR' ? '#FFE4E6' : ($l['level'] === 'WARNING' ? '#FEF3C7' : '#DBEAFE') }}; color: {{ $l['level'] === 'ERROR' ? '#9F1239' : ($l['level'] === 'WARNING' ? '#92400E' : '#1E40AF') }};">
                        {{ $l['level'] }}
                    </span>
                    <span style="word-break: break-all; color: {{ $l['level'] === 'ERROR' ? '#9F1239' : ($l['level'] === 'WARNING' ? '#92400E' : '#334155') }};">{{ $l['raw'] }}</span>
                </div>
            @empty
                <div style="text-align: center; padding: 3rem 0; color: #94a3b8;">
                    No hay registros de eventos para el filtro seleccionado.
                </div>
            @endforelse
        </div>
    </div>
</x-filament-panels::page>
