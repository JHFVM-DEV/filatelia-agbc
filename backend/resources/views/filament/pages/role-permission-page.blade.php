<x-filament-panels::page>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        {{-- Header Card --}}
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
            <div>
                <span style="font-size: 0.75rem; font-weight: 700; color: #D97706; text-transform: uppercase; letter-spacing: 0.05em; display: block;">
                    Seguridad & Control de Acceso
                </span>
                <h2 style="font-size: 1.25rem; font-weight: 900; color: #102542; margin-top: 0.25rem;">
                    Matriz Institucional de Asignación de Módulos por Rol
                </h2>
                <p style="font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem;">
                    Control granular de disponibilidad de los módulos del sistema según el perfil del usuario.
                </p>
            </div>
            <div>
                <button 
                    wire:click="saveMatrix" 
                    style="background: linear-gradient(135deg, #102542 0%, #2C63AC 100%); color: #ffffff; font-weight: 800; font-size: 0.8125rem; padding: 0.625rem 1.25rem; border-radius: 0.875rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.2);"
                >
                    <svg style="width: 1.125rem; height: 1.125rem; color: #FECC36;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Guardar Cambios
                </button>
            </div>
        </div>

        {{-- Table Card --}}
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; overflow: hidden; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
                    <thead>
                        <tr style="background: #F8FAFC; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
                            <th style="padding: 1rem 1.5rem;">Módulo / Opción</th>
                            <th style="padding: 1rem 1.5rem; text-align: center;">Super Admin</th>
                            <th style="padding: 1rem 1.5rem; text-align: center;">Encargado de Almacén y Productos</th>
                        </tr>
                    </thead>
                    <tbody style="color: #0F172A;">
                        @foreach($this->getModulesList() as $mod)
                        <tr style="border-bottom: 1px solid #e2e8f0; transition: background-color 0.15s ease;" onmouseover="this.style.backgroundColor='#F8FAFC'" onmouseout="this.style.backgroundColor='transparent'">
                            <td style="padding: 0.875rem 1.5rem; font-weight: 700; color: #102542;">
                                <div style="display: flex; align-items: center; gap: 0.625rem;">
                                    <span style="width: 0.5rem; height: 0.5rem; border-radius: 9999px; background-color: #D97706; flex-shrink: 0;"></span>
                                    <span>{{ $mod }}</span>
                                </div>
                            </td>

                            {{-- Super Admin --}}
                            <td style="padding: 0.875rem 1.5rem; text-align: center;">
                                <span style="display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border-radius: 9999px; background-color: #D1FAE5; color: #065F46; font-weight: 800; border: 1px solid #A7F3D0;">
                                    ✓
                                </span>
                            </td>

                            {{-- Encargado de Almacén y Productos --}}
                            <td style="padding: 0.875rem 1.5rem; text-align: center;">
                                <button 
                                    wire:click="togglePermission('{{ $mod }}', 'ADMIN_PRODUCTOS_ALMACEN')" 
                                    style="display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border-radius: 9999px; font-weight: 800; cursor: pointer; border: 1px solid {{ ($matrix[$mod]['ADMIN_PRODUCTOS_ALMACEN'] ?? false) ? '#10B981' : '#CBD5E1' }}; background-color: {{ ($matrix[$mod]['ADMIN_PRODUCTOS_ALMACEN'] ?? false) ? '#D1FAE5' : '#F1F5F9' }}; color: {{ ($matrix[$mod]['ADMIN_PRODUCTOS_ALMACEN'] ?? false) ? '#065F46' : '#94A3B8' }}; transition: all 0.2s;"
                                >
                                    {{ ($matrix[$mod]['ADMIN_PRODUCTOS_ALMACEN'] ?? false) ? '✓' : '—' }}
                                </button>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-filament-panels::page>
