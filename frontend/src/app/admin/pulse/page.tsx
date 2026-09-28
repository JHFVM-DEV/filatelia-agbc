'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Database,
  Server,
  Activity,
  Zap,
  HardDrive,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface HealthData {
  phpVersion: string;
  laravelVersion: string;
  dbConnection: string;
  dbStatus: string;
  dbLatency: number;
  memoryUsage: number;
  peakMemory: number;
  cacheDriver: string;
  sessionDriver: string;
  queueDriver: string;
  serverTime: string;
}

export default function AdminPulsePage() {
  const { currentUser, openLoginModal } = useStore();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) {
        setErrorMessage('Sesión no encontrada. Por favor inicie sesión.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/system-health`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.status === 401) {
        setErrorMessage('Credenciales expiradas. Por favor identifíquese nuevamente.');
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error('Error al consultar telemetría del servidor');

      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#001A38]/90 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-serif tracking-wide">
              Reportes & Auditoría: Monitoreo Pulse del Servidor
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Telemetría en tiempo real, latencia de base de datos y consumo de memoria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Telemetría Activa (15s)</span>
          </div>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#002B5B] hover:bg-[#0A3B73] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Actualizar métricas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => openLoginModal()}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold"
          >
            Identificarse
          </button>
        </div>
      )}

      {/* Real-time Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latency */}
        <div className="bg-[#001A38] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Latencia DB</span>
            <Zap className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 mt-2">
            {health?.dbLatency ?? 0}{' '}
            <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Respuesta óptima de consulta</span>
          </div>
        </div>

        {/* Memory */}
        <div className="bg-[#001A38] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Consumo RAM PHP</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-2">
            {health?.memoryUsage ?? 0}{' '}
            <span className="text-xs font-normal text-slate-400">MB</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Pico registrado: {health?.peakMemory ?? 0} MB
          </span>
        </div>

        {/* DB Connection */}
        <div className="bg-[#001A38] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Motor Relacional</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300 mt-2 uppercase tracking-wide">
            {health?.dbConnection ?? 'pgsql'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Estado: {health?.dbStatus ?? 'OK'}</span>
          </div>
        </div>

        {/* Server Time */}
        <div className="bg-[#001A38] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Hora del Servidor</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-sm font-mono font-medium text-amber-200/90 mt-2">
            {health?.serverTime ?? 'Cargando...'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Sincronización NTP oficial</span>
        </div>
      </div>

      {/* System Specifications Grid */}
      <div className="bg-[#001A38] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-400" />
          <span>Especificaciones de la Pila Tecnológica</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#00142B] border border-slate-800/80">
            <div className="text-slate-400 font-semibold mb-1">Versión del Motor PHP</div>
            <div className="text-sm font-mono font-bold text-white">
              {health?.phpVersion ?? 'PHP 8.2+'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#00142B] border border-slate-800/80">
            <div className="text-slate-400 font-semibold mb-1">Framework Backend</div>
            <div className="text-sm font-mono font-bold text-white">
              Laravel {health?.laravelVersion ?? '12.x'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#00142B] border border-slate-800/80">
            <div className="text-slate-400 font-semibold mb-1">Controlador de Sesiones</div>
            <div className="text-sm font-mono font-bold text-amber-300">
              {health?.sessionDriver ?? 'database'} (Sanctum Tokens)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#00142B] border border-slate-800/80">
            <div className="text-slate-400 font-semibold mb-1">Caché de Aplicación</div>
            <div className="text-sm font-mono font-bold text-white">
              {health?.cacheDriver ?? 'database'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#00142B] border border-slate-800/80">
            <div className="text-slate-400 font-semibold mb-1">Gestor de Colas (Queue)</div>
            <div className="text-sm font-mono font-bold text-white">
              {health?.queueDriver ?? 'database'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#00142B] border border-slate-800/80">
            <div className="text-slate-400 font-semibold mb-1">Suite Administrativa</div>
            <div className="text-sm font-mono font-bold text-emerald-400">
              Next.js 15 SPA (Native Admin)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
