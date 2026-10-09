<x-filament-panels::page>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
            <div>
                <span style="font-size: 0.75rem; font-weight: 800; color: #059669; display: flex; align-items: center; gap: 0.375rem;">
                    <span style="width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: #10b981; display: inline-block;"></span>
                    SISTEMA OPERATIVO Y SERVICIOS EN LÍNEA
                </span>
                <h2 style="font-size: 1.25rem; font-weight: 900; color: #102542; margin-top: 0.25rem;">
                    Monitoreo de Infraestructura y Bóveda Digital (Pulse)
                </h2>
            </div>
            <div style="font-size: 0.75rem; color: #64748b; font-family: ui-monospace, monospace;">
                {{ $serverTime }}
            </div>
        </div>

        {{-- Métricas de Servidor --}}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block;">Base de Datos</span>
                <div style="font-size: 1.25rem; font-weight: 900; color: #059669; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    PostgreSQL
                    <span style="font-size: 0.6875rem; padding: 0.125rem 0.5rem; border-radius: 9999px; background: #D1FAE5; color: #065F46; font-weight: 800;">Activo</span>
                </div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; font-family: ui-monospace, monospace;">Latencia: {{ $dbLatency }} ms</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block;">Memoria PHP</span>
                <div style="font-size: 1.25rem; font-weight: 900; color: #2563eb; margin-top: 0.25rem;">{{ $memoryUsage }} MB</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Pico máximo: {{ $peakMemory }} MB</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; box-shadow: 0 2px 8px rgba(16, 37, 66, 0.04);">
                <span style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block;">Entorno Core</span>
                <div style="font-size: 1.25rem; font-weight: 900; color: #102542; margin-top: 0.25rem; font-family: ui-monospace, monospace;">PHP {{ $phpVersion }}</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Laravel {{ $laravelVersion }} &bull; Filament {{ $filamentVersion }}</div>
            </div>
        </div>

        {{-- Parámetros del Core --}}
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; box-shadow: 0 4px 12px rgba(16, 37, 66, 0.05);">
            <h3 style="font-size: 0.9375rem; font-weight: 800; color: #102542; margin-bottom: 1rem;">Parámetros de Configuración del Core</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; font-size: 0.8125rem;">
                <div style="padding: 0.75rem; border-radius: 0.75rem; background: #F8FAFC; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; display: block; font-size: 0.75rem;">Driver de Sesión</span>
                    <strong style="color: #102542; font-family: ui-monospace, monospace; margin-top: 0.25rem; display: block;">{{ $sessionDriver }}</strong>
                </div>
                <div style="padding: 0.75rem; border-radius: 0.75rem; background: #F8FAFC; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; display: block; font-size: 0.75rem;">Driver de Caché</span>
                    <strong style="color: #102542; font-family: ui-monospace, monospace; margin-top: 0.25rem; display: block;">{{ $cacheDriver }}</strong>
                </div>
                <div style="padding: 0.75rem; border-radius: 0.75rem; background: #F8FAFC; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; display: block; font-size: 0.75rem;">Driver de Colas</span>
                    <strong style="color: #102542; font-family: ui-monospace, monospace; margin-top: 0.25rem; display: block;">{{ $queueDriver }}</strong>
                </div>
                <div style="padding: 0.75rem; border-radius: 0.75rem; background: #F8FAFC; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; display: block; font-size: 0.75rem;">Conexión Primaria</span>
                    <strong style="color: #D97706; font-family: ui-monospace, monospace; margin-top: 0.25rem; display: block;">{{ $dbConnection }} (filatelia_db)</strong>
                </div>
            </div>
        </div>
    </div>
</x-filament-panels::page>
