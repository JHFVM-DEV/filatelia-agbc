<x-filament-panels::page>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        {{-- KPI Cards --}}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0, 43, 91, 0.04);">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Existencias Totales</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #002B5B; margin-top: 0.25rem;">{{ number_format($totalUnits) }} unid.</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Custodiadas en bóveda central y sedes</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0, 43, 91, 0.04);">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Alertas Stock Crítico</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: {{ $lowStockCount > 0 ? '#e11d48' : '#059669' }}; margin-top: 0.25rem;">{{ $lowStockCount }} piezas</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">{{ $lowStockCount > 0 ? 'Existencias ≤ 2 unidades' : 'Niveles óptimos' }}</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0, 43, 91, 0.04);">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Valoración en Bóveda</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #D97706; margin-top: 0.25rem;">Bs. {{ number_format($totalValuation, 2) }}</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Tasación oficial de inventario</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0, 43, 91, 0.04);">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Títulos Activos</div>
                <div style="font-size: 1.5rem; font-weight: 900; color: #2563eb; margin-top: 0.25rem;">{{ $products->count() }} obras</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Con ficha técnica y peritaje</div>
            </div>
        </div>

        {{-- Formulario de Ajuste Rápido --}}
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0, 43, 91, 0.05);">
            <h3 style="font-size: 1rem; font-weight: 800; color: #002B5B; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #D97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Ajuste Operativo de Stock Físico
            </h3>
            <form wire:submit.prevent="adjustStock" style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: flex-end;">
                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #334155; margin-bottom: 0.375rem;">Pieza Filatélica</label>
                        <select wire:model="adjustProductId" style="width: 100%; font-size: 0.875rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 0.625rem 0.75rem;">
                            <option value="">-- Seleccionar pieza --</option>
                            @foreach($products as $p)
                                <option value="{{ $p->id }}">{{ $p->name }} (Stock: {{ $p->stock }})</option>
                            @endforeach
                        </select>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #334155; margin-bottom: 0.375rem;">Tipo de Movimiento</label>
                        <select wire:model="adjustType" style="width: 100%; font-size: 0.875rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 0.625rem 0.75rem;">
                            <option value="IN">Entrada (Ingreso por emisión/reingreso)</option>
                            <option value="OUT">Salida (Muestra/Merma/Despacho)</option>
                            <option value="ADJUST">Ajuste Directo (Inventario Físico)</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #334155; margin-bottom: 0.375rem;">Cantidad</label>
                        <input type="number" min="1" wire:model="adjustQuantity" style="width: 100%; font-size: 0.875rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 0.625rem 0.75rem;" />
                    </div>

                    <div>
                        <button type="submit" style="width: 100%; padding: 0.625rem 1.25rem; border-radius: 0.75rem; background: linear-gradient(135deg, #002B5B 0%, #0A3B73 100%); color: #ffffff; font-weight: 800; font-size: 0.875rem; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 43, 91, 0.2);">
                            Registrar Movimiento
                        </button>
                    </div>
                </div>

                <div>
                    <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #334155; margin-bottom: 0.375rem;">Motivo / Justificación Oficial</label>
                    <input type="text" wire:model="adjustReason" placeholder="Ej: Arqueo físico mensual de bóveda de seguridad..." style="width: 100%; font-size: 0.875rem; border-radius: 0.75rem; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; padding: 0.625rem 0.75rem;" />
                </div>
            </form>
        </div>

        {{-- Tabla de Inventario por Pieza --}}
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 43, 91, 0.05);">
            <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-size: 1rem; font-weight: 800; color: #002B5B;">Inventario de Piezas en Bóveda</h3>
                <span style="font-size: 0.75rem; color: #64748b;">Ordenado por menor disponibilidad</span>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
                    <thead>
                        <tr style="background: #F8FAFC; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
                            <th style="padding: 1rem 1.25rem;">Pieza Filatélica</th>
                            <th style="padding: 1rem 1.25rem;">Código Catálogo</th>
                            <th style="padding: 1rem 1.25rem;">Categoría</th>
                            <th style="padding: 1rem 1.25rem;">Rareza</th>
                            <th style="padding: 1rem 1.25rem;">Precio Unit.</th>
                            <th style="padding: 1rem 1.25rem; text-align: center;">Stock Físico</th>
                            <th style="padding: 1rem 1.25rem; text-align: right;">Valor Total</th>
                        </tr>
                    </thead>
                    <tbody style="color: #0F172A;">
                        @foreach($products as $prod)
                        <tr style="border-bottom: 1px solid #e2e8f0; transition: background-color 0.15s ease;" onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
                            <td style="padding: 0.875rem 1.25rem; font-weight: 700; color: #002B5B;">{{ $prod->name }}</td>
                            <td style="padding: 0.875rem 1.25rem; font-family: ui-monospace, monospace; font-size: 0.75rem; color: #64748b;">{{ $prod->catalog_code ?? 'S/C' }}</td>
                            <td style="padding: 0.875rem 1.25rem; font-size: 0.8125rem; color: #475569;">{{ $prod->category->name ?? '-' }}</td>
                            <td style="padding: 0.875rem 1.25rem;">
                                <span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; background: {{ $prod->rarity === 'MUSEUM_PIECE' ? '#FEF3C7' : '#F1F5F9' }}; color: {{ $prod->rarity === 'MUSEUM_PIECE' ? '#92400E' : '#475569' }};">
                                    {{ $prod->rarity }}
                                </span>
                            </td>
                            <td style="padding: 0.875rem 1.25rem; font-weight: 700; color: #002B5B;">Bs. {{ number_format($prod->price, 2) }}</td>
                            <td style="padding: 0.875rem 1.25rem; text-align: center;">
                                <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8125rem; font-weight: 900; background: {{ $prod->stock <= 2 ? '#FFE4E6' : '#D1FAE5' }}; color: {{ $prod->stock <= 2 ? '#9F1239' : '#065F46' }};">
                                    {{ $prod->stock }} unid.
                                </span>
                            </td>
                            <td style="padding: 0.875rem 1.25rem; text-align: right; font-family: ui-monospace, monospace; font-weight: 800; color: #D97706;">
                                Bs. {{ number_format($prod->price * $prod->stock, 2) }}
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        {{-- Historial de Movimientos --}}
        @if($movements->count() > 0)
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 43, 91, 0.05);">
            <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0;">
                <h3 style="font-size: 1rem; font-weight: 800; color: #002B5B;">Últimos Movimientos de Bóveda</h3>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                    <thead>
                        <tr style="background: #F8FAFC; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">
                            <th style="padding: 0.875rem 1.25rem;">Fecha/Hora</th>
                            <th style="padding: 0.875rem 1.25rem;">Pieza</th>
                            <th style="padding: 0.875rem 1.25rem;">Tipo</th>
                            <th style="padding: 0.875rem 1.25rem; text-align: center;">Cantidad</th>
                            <th style="padding: 0.875rem 1.25rem; text-align: center;">Previo -> Nuevo</th>
                            <th style="padding: 0.875rem 1.25rem;">Motivo</th>
                            <th style="padding: 0.875rem 1.25rem;">Responsable</th>
                        </tr>
                    </thead>
                    <tbody style="color: #0F172A;">
                        @foreach($movements as $m)
                        <tr style="border-bottom: 1px solid #e2e8f0; transition: background-color 0.15s ease;" onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
                            <td style="padding: 0.75rem 1.25rem; color: #64748b;">{{ $m->created_at->format('d/m/Y H:i') }}</td>
                            <td style="padding: 0.75rem 1.25rem; font-weight: 700; color: #002B5B;">{{ $m->product->name ?? '-' }}</td>
                            <td style="padding: 0.75rem 1.25rem;">
                                <span style="display: inline-block; padding: 0.2rem 0.5rem; border-radius: 9999px; font-weight: 800; font-size: 0.6875rem; background: {{ $m->type === 'IN' ? '#D1FAE5' : ($m->type === 'OUT' ? '#FFE4E6' : '#DBEAFE') }}; color: {{ $m->type === 'IN' ? '#065F46' : ($m->type === 'OUT' ? '#9F1239' : '#1E40AF') }};">
                                    {{ $m->type }}
                                </span>
                            </td>
                            <td style="padding: 0.75rem 1.25rem; text-align: center; font-weight: 800; color: #002B5B;">{{ $m->quantity }}</td>
                            <td style="padding: 0.75rem 1.25rem; text-align: center; font-family: ui-monospace, monospace; color: #64748b;">{{ $m->previous_stock }} &rarr; {{ $m->new_stock }}</td>
                            <td style="padding: 0.75rem 1.25rem; color: #475569;">{{ $m->reason }}</td>
                            <td style="padding: 0.75rem 1.25rem; color: #64748b;">{{ $m->user->name ?? 'Sistema' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        @endif
    </div>
</x-filament-panels::page>
