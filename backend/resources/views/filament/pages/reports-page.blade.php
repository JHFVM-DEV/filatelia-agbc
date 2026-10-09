<x-filament-panels::page>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        {{-- Encabezado Institucional --}}
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
            <div>
                <span style="font-size: 0.75rem; font-weight: 800; color: #D97706; text-transform: uppercase; letter-spacing: 0.05em; display: block;">
                    Estado Plurinacional de Bolivia &bull; Correos de Bolivia
                </span>
                <h2 style="font-size: 1.25rem; font-weight: 900; color: #102542; margin-top: 0.25rem;">
                    Balance Oficial de Operaciones Filatélicas
                </h2>
                <p style="font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem;">
                    Informe financiero consolidado de recaudación soberana, ventas y tasación de bóveda.
                </p>
            </div>
            <div>
                <button 
                    onclick="window.print()" 
                    style="padding: 0.625rem 1.25rem; border-radius: 0.75rem; background: #102542; color: #ffffff; font-weight: 800; font-size: 0.8125rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.2);"
                >
                    <svg style="width: 1rem; height: 1rem; color: #FECC36;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir Informe Oficial
                </button>
            </div>
        </div>

        {{-- Métricas Clave --}}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Recaudación Bruta</span>
                <div style="font-size: 1.5rem; font-weight: 900; color: #059669; margin-top: 0.25rem;">Bs. {{ number_format($totalRevenue, 2) }}</div>
                <span style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; display: block;">Total liquidado en pasarelas</span>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Valoración de Activos</span>
                <div style="font-size: 1.5rem; font-weight: 900; color: #D97706; margin-top: 0.25rem;">Bs. {{ number_format($vaultValuation, 2) }}</div>
                <span style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; display: block;">Tasación oficial en custodia</span>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Ticket Promedio</span>
                <div style="font-size: 1.5rem; font-weight: 900; color: #2563eb; margin-top: 0.25rem;">Bs. {{ number_format($avgTicket, 2) }}</div>
                <span style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; display: block;">Por orden de coleccionista</span>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Entregas Efectivas</span>
                <div style="font-size: 1.5rem; font-weight: 900; color: #7c3aed; margin-top: 0.25rem;">{{ $deliveredOrders }} / {{ $totalOrders }}</div>
                <span style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; display: block;">Órdenes recibidas con éxito</span>
            </div>
        </div>

        {{-- Módulo de Exportación y Arqueo Oficial --}}
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem;">
                <div>
                    <h3 style="font-size: 1rem; font-weight: 800; color: #102542; display: flex; align-items: center; gap: 0.5rem;">
                        <svg style="width: 1.25rem; height: 1.25rem; color: #D97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Exportación de Libros Matrices & Arqueo de Bóveda
                    </h3>
                    <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
                        Documentos oficiales codificados en UTF-8 con compatibilidad inmediata para Microsoft Excel y auditoría fiscal.
                    </p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem;">
                {{-- Card 1: Libro Matriz de Ventas --}}
                <div style="background: #F8FAFC; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.75rem; font-weight: 800; color: #102542; text-transform: uppercase;">
                                📜 Libro Matriz de Ventas
                            </span>
                        </div>
                        <p style="font-size: 0.8125rem; color: #475569; line-height: 1.4;">
                            Registro correlativo de todas las órdenes emitidas, clientes, método de pago, desglose de piezas y recaudación en BOB.
                        </p>
                    </div>
                    <div style="margin-top: 0.75rem;">
                        <button 
                            wire:click="exportSalesBook"
                            wire:loading.attr="disabled"
                            style="width: 100%; padding: 0.625rem 1rem; border-radius: 0.75rem; background: #102542; color: #ffffff; font-weight: 800; font-size: 0.8125rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 10px rgba(16, 37, 66, 0.2);"
                        >
                            <svg style="width: 1rem; height: 1rem; color: #FECC36;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span wire:loading.remove wire:target="exportSalesBook">Descargar Libro de Ventas (Excel/CSV)</span>
                            <span wire:loading wire:target="exportSalesBook">Generando archivo oficial...</span>
                        </button>
                    </div>
                </div>

                {{-- Card 2: Arqueo Físico de Bóveda --}}
                <div style="background: #F8FAFC; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.75rem; font-weight: 800; color: #102542; text-transform: uppercase;">
                                🏛️ Arqueo Físico de Bóveda
                            </span>
                        </div>
                        <p style="font-size: 0.8125rem; color: #475569; line-height: 1.4;">
                            Inventario valorado de existencias, códigos Scott, estado de goma (MINT), nivel de rareza y valor total patrimonial en custodia.
                        </p>
                    </div>
                    <div style="margin-top: 0.75rem;">
                        <button 
                            wire:click="exportVaultInventory"
                            wire:loading.attr="disabled"
                            style="width: 100%; padding: 0.625rem 1rem; border-radius: 0.75rem; background: #ffffff; color: #102542; border: 1.5px solid #102542; font-weight: 800; font-size: 0.8125rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 2px 6px rgba(16, 37, 66, 0.08);"
                            onmouseover="this.style.background='#102542'; this.style.color='#FECC36';"
                            onmouseout="this.style.background='#ffffff'; this.style.color='#102542';"
                        >
                            <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span wire:loading.remove wire:target="exportVaultInventory">Descargar Arqueo de Bóveda (Excel/CSV)</span>
                            <span wire:loading wire:target="exportVaultInventory">Generando archivo oficial...</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Desglose por Departamento y Categoría --}}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
            {{-- Ventas por Departamento --}}
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.25rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
                <h3 style="font-size: 0.9375rem; font-weight: 800; color: #102542; margin-bottom: 1rem;">Ventas por Departamento</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                        <thead>
                            <tr style="background: #F8FAFC; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">
                                <th style="padding: 0.75rem 1rem;">Departamento</th>
                                <th style="padding: 0.75rem 1rem; text-align: center;">Pedidos</th>
                                <th style="padding: 0.75rem 1rem; text-align: right;">Recaudación (Bs.)</th>
                            </tr>
                        </thead>
                        <tbody style="color: #0F172A;">
                            @foreach($departmentBreakdown as $dept)
                            <tr style="border-bottom: 1px solid #e2e8f0; transition: background-color 0.15s ease;" onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
                                <td style="padding: 0.75rem 1rem; font-weight: 700; color: #102542;">{{ $dept->department }}</td>
                                <td style="padding: 0.75rem 1rem; text-align: center; font-weight: 800; color: #475569;">{{ $dept->orders_count }}</td>
                                <td style="padding: 0.75rem 1rem; text-align: right; font-family: ui-monospace, monospace; font-weight: 800; color: #059669;">Bs. {{ number_format($dept->total_dept, 2) }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- Rendimiento por Categoría --}}
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.25rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
                <h3 style="font-size: 0.9375rem; font-weight: 800; color: #102542; margin-bottom: 1rem;">Valoración por Categoría</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                        <thead>
                            <tr style="background: #F8FAFC; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">
                                <th style="padding: 0.75rem 1rem;">Categoría</th>
                                <th style="padding: 0.75rem 1rem; text-align: center;">Ejemplares</th>
                                <th style="padding: 0.75rem 1rem; text-align: center;">Stock</th>
                                <th style="padding: 0.75rem 1rem; text-align: right;">Tasación Bóveda</th>
                            </tr>
                        </thead>
                        <tbody style="color: #0F172A;">
                            @foreach($categoryBreakdown as $cat)
                            <tr style="border-bottom: 1px solid #e2e8f0; transition: background-color 0.15s ease;" onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
                                <td style="padding: 0.75rem 1rem; font-weight: 700; color: #102542;">{{ $cat['name'] }}</td>
                                <td style="padding: 0.75rem 1rem; text-align: center; color: #475569;">{{ $cat['pieces_count'] }}</td>
                                <td style="padding: 0.75rem 1rem; text-align: center; font-weight: 800; color: #475569;">{{ $cat['stock'] }}</td>
                                <td style="padding: 0.75rem 1rem; text-align: right; font-family: ui-monospace, monospace; font-weight: 800; color: #D97706;">Bs. {{ number_format($cat['valuation'], 2) }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-filament-panels::page>
