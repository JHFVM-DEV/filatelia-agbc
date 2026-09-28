<x-filament-panels::page>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        {{-- Banner informativo y estado --}}
        <div style="background: linear-gradient(135deg, #002B5B 0%, #0A3B73 100%); padding: 1.5rem; border-radius: 1.25rem; color: #ffffff; box-shadow: 0 4px 12px rgba(0, 43, 91, 0.2); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border: 1px solid #0A3B73;">
            <div>
                <h2 style="font-size: 1.25rem; font-weight: 900; color: #F4C400; margin: 0;">Mesa de Embalaje Glassine & Asignación de Valijas</h2>
                <p style="font-size: 0.8125rem; color: #cbd5e1; margin-top: 0.25rem;">Gestión operativa de pedidos listos para peritaje, estuche protector y precinto oficial de Correos de Bolivia.</p>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="background: rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.2); text-align: center;">
                    <span style="font-size: 0.75rem; color: #cbd5e1; display: block;">En Cola de Embalaje</span>
                    <span style="font-size: 1.25rem; font-weight: 900; color: #F4C400;">{{ $queueOrders->count() }} órdenes</span>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.2); text-align: center;">
                    <span style="font-size: 0.75rem; color: #cbd5e1; display: block;">Despachados Hoy</span>
                    <span style="font-size: 1.25rem; font-weight: 900; color: #34d399;">{{ $dispatchedToday }} valijas</span>
                </div>
            </div>
        </div>

        {{-- Formulario para Despachar con Guía --}}
        @if($dispatchOrderId)
        <div style="background: #ffffff; border: 2px solid #002B5B; border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0, 43, 91, 0.08);">
            <h3 style="font-size: 0.9375rem; font-weight: 800; color: #002B5B; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #D97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                Asignación de Guía Postal y Confirmación de Salida
            </h3>
            <form wire:submit.prevent="confirmDispatch" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; align-items: flex-end;">
                <div>
                    <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #334155; margin-bottom: 0.375rem;">Empresa / Valija de Correos</label>
                    <input type="text" wire:model="dispatchCarrier" style="width: 100%; font-size: 0.875rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 0.625rem 0.75rem;" required />
                </div>
                <div>
                    <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #334155; margin-bottom: 0.375rem;">Código de Guía Postal (Tracking)</label>
                    <input type="text" wire:model="dispatchTrackingCode" placeholder="Ej: BO-CORREOS-LPZ-008" style="width: 100%; font-size: 0.875rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 0.625rem 0.75rem;" required />
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="submit" style="padding: 0.625rem 1.25rem; background: #059669; color: #ffffff; font-weight: 800; font-size: 0.875rem; border-radius: 0.75rem; border: none; cursor: pointer; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.2);">
                        Confirmar Salida
                    </button>
                    <button type="button" wire:click="$set('dispatchOrderId', null)" style="padding: 0.625rem 1rem; background: #f1f5f9; color: #475569; font-weight: 700; font-size: 0.875rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; cursor: pointer;">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
        @endif

        {{-- Cola Operativa de Pedidos --}}
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            @forelse($queueOrders as $order)
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0, 43, 91, 0.04); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; flex-direction: column; gap: 0.375rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                        <span style="font-size: 0.9375rem; font-weight: 900; color: #002B5B; font-family: ui-monospace, monospace;">{{ $order->order_number }}</span>
                        <span style="padding: 0.2rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; background: {{ $order->status === 'PACKED_GLASSINE' ? '#F3E8FF' : '#FEF3C7' }}; color: {{ $order->status === 'PACKED_GLASSINE' ? '#6B21A8' : '#92400E' }};">
                            {{ $order->status === 'PACKED_GLASSINE' ? '📦 Empacado Glassine' : '⏳ Pendiente Embalaje' }}
                        </span>
                        <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">{{ $order->department }} ({{ $order->city }})</span>
                    </div>
                    <div style="font-size: 0.8125rem; color: #334155;">
                        <strong style="color: #002B5B;">Coleccionista:</strong> {{ $order->customer_name }} &bull; {{ $order->customer_phone ?? 'Sin teléfono' }}
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b;">
                        <strong style="color: #475569;">Dirección de custodia:</strong> {{ $order->shipping_address }}
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.375rem; padding-top: 0.25rem;">
                        @foreach($order->items as $it)
                        <span style="background: #F8FAFC; padding: 0.25rem 0.625rem; border-radius: 0.5rem; font-size: 0.75rem; color: #0F172A; border: 1px solid #e2e8f0;">
                            {{ $it->quantity }}x {{ $it->product_name }}
                        </span>
                        @endforeach
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    @if($order->status !== 'PACKED_GLASSINE')
                    <button 
                        wire:click="markAsGlassine({{ $order->id }})" 
                        style="padding: 0.625rem 1rem; border-radius: 0.75rem; font-size: 0.8125rem; font-weight: 800; background: #F3E8FF; color: #6B21A8; border: 1px solid #D8B4FE; cursor: pointer; transition: all 0.2s;"
                        onmouseover="this.style.background='#E9D5FF'"
                        onmouseout="this.style.background='#F3E8FF'"
                    >
                        Empacar Glassine
                    </button>
                    @endif

                    <button 
                        wire:click="$set('dispatchOrderId', {{ $order->id }})" 
                        style="padding: 0.625rem 1.25rem; border-radius: 0.75rem; font-size: 0.8125rem; font-weight: 800; background: linear-gradient(135deg, #002B5B 0%, #0A3B73 100%); color: #ffffff; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 43, 91, 0.2);"
                    >
                        Despachar Valija
                    </button>
                </div>
            </div>
            @empty
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 3rem; text-align: center; color: #64748b; box-shadow: 0 2px 8px rgba(0, 43, 91, 0.04);">
                <svg style="width: 3rem; height: 3rem; color: #059669; margin: 0 auto 0.5rem auto;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 style="font-weight: 800; color: #002B5B; margin: 0;">Bandeja de Despacho al Día</h4>
                <p style="font-size: 0.8125rem; margin-top: 0.25rem;">No hay pedidos pendientes de empaque ni despacho en este momento.</p>
            </div>
            @endforelse
        </div>
    </div>
</x-filament-panels::page>
