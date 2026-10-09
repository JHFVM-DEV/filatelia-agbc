'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Search,
  Lock,
  RefreshCw,
  FileCode,
  Code2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Server,
  Zap,
  Eye,
  EyeOff,
  Store,
} from 'lucide-react';

import { useStore } from '@/context/StoreContext';
import { ShowcaseManager } from '@/components/ShowcaseManager';

interface ApiTokenItem {
  id: number;
  name: string;
  token_value?: string | null;
  token_preview?: string | null;
  abilities: string[];
  detailed_scopes?: ScopeItem[];
  tokenable_name: string;
  tokenable_email: string;
  last_used_at: string | null;
  last_used_human: string;
  expires_at: string | null;
  expires_human: string;
  created_at: string;
  status: 'ACTIVE' | 'EXPIRED';
  is_expired: boolean;
}


interface ScopeItem {
  category: string;
  key: string;
  label: string;
  description: string;
}

interface EndpointDoc {
  method: string;
  path: string;
  full_url: string;
  title: string;
  description: string;
  required_scopes: string[];
  headers: Record<string, string>;
  query_params?: Record<string, string>;
  body_sample?: any;
  response_sample: any;
  curl_sample: string;
}

interface EndpointGroup {
  group: string;
  endpoints: EndpointDoc[];
}

export default function ApiKeysManagementPage() {
  const { currentUser, openLoginModal } = useStore();

  const [tokens, setTokens] = useState<ApiTokenItem[]>([]);
  const [availableScopes, setAvailableScopes] = useState<ScopeItem[]>([]);
  const [endpointGroups, setEndpointGroups] = useState<EndpointGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  const [activeTab, setActiveTab] = useState<'tokens' | 'showcase' | 'docs' | 'downloads'>('tokens');

  // Permitir activar pestaña mediante parámetro ?tab=showcase
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'showcase' || tabParam === 'docs' || tabParam === 'downloads') {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  // Modal para crear nueva API Key
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['catalogo:read', 'pedidos:read']);
  const [expiresInDays, setExpiresInDays] = useState<number>(90);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de token revelado (se muestra solo una vez al crearse)
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [revealedTokenName, setRevealedTokenName] = useState<string>('');
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Modal de Detalles Completos de una API existente
  const [selectedDetailToken, setSelectedDetailToken] = useState<ApiTokenItem | null>(null);
  const [showSecretToken, setShowSecretToken] = useState<boolean>(false);
  const [detailCopied, setDetailCopied] = useState<boolean>(false);

  // Estados de copiado para endpoints cURL
  const [copiedCurlIndex, setCopiedCurlIndex] = useState<string | null>(null);

  // Verificación de Super Administrador
  const isSuperAdmin = () => {
    if (!currentUser) return false;
    let roles: string[] = [];
    if (Array.isArray(currentUser.roles)) {
      roles = currentUser.roles.map((r: any) => (typeof r === 'string' ? r : r?.name || ''));
    } else if (typeof currentUser.roles === 'object' && currentUser.roles !== null) {
      roles = Object.values(currentUser.roles).map((r: any) => (typeof r === 'string' ? r : r?.name || ''));
    }
    if (currentUser.primary_role) roles.push(currentUser.primary_role);
    if (currentUser.email === 'admin@filatelia.bo') roles.push('SUPER_ADMIN');

    return roles.includes('SUPER_ADMIN');
  };

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('filatelia_token');
    }
    return null;
  };

  // Cargar lista de tokens y documentación
  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch tokens
      const res = await fetch(`${API_BASE_URL}/api/admin/api-tokens`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens || []);
        if (data.available_scopes) {
          setAvailableScopes(data.available_scopes);
        }
      }

      // Fetch documentation specs
      const docsRes = await fetch(`${API_BASE_URL}/api/admin/api-tokens/docs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        if (docsData.endpoints_groups) {
          setEndpointGroups(docsData.endpoints_groups);
        }
        if (docsData.available_scopes && availableScopes.length === 0) {
          setAvailableScopes(docsData.available_scopes);
        }
      }
    } catch (err) {
      console.error('Error al consultar endpoints de API tokens:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Selección de Scopes en el formulario
  const toggleScope = (scopeKey: string) => {
    if (scopeKey === '*') {
      setSelectedScopes(['*']);
      return;
    }

    let next = selectedScopes.filter((s) => s !== '*');
    if (next.includes(scopeKey)) {
      next = next.filter((s) => s !== scopeKey);
    } else {
      next.push(scopeKey);
    }
    setSelectedScopes(next);
  };

  const handleSelectAllScopes = () => {
    const all = availableScopes.map((s) => s.key);
    setSelectedScopes(all);
  };

  const handleSelectMasterScope = () => {
    setSelectedScopes(['*']);
  };

  const handleClearScopes = () => {
    setSelectedScopes([]);
  };

  // Crear Token
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Por favor ingrese el nombre identificador del cliente o aplicación.');
      return;
    }

    if (selectedScopes.length === 0) {
      setFormError('Debe seleccionar al menos un permiso o scope para la clave.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/api-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          abilities: selectedScopes,
          expires_in_days: expiresInDays,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRevealedToken(data.plain_text_token);
        setRevealedTokenName(name.trim());
        setName('');
        setSelectedScopes(['catalogo:read', 'pedidos:read']);
        setExpiresInDays(90);
        setIsCreateModalOpen(false);
        fetchData();
      } else {
        setFormError(data.message || 'Error al emitir la API Key.');
      }
    } catch (err: any) {
      setFormError('Fallo de conexión al servidor al emitir el token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revocar Token
  const handleRevokeToken = async (id: number, tokenName: string) => {
    if (
      !confirm(
        `¿Confirmar revocación definitiva de la API Key "${tokenName}"?\n\nCualquier sistema o integración externa que use esta clave dejará de tener acceso inmediatamente.`
      )
    ) {
      return;
    }

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/api-tokens/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        setTokens((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert('No se pudo revocar la API Key.');
      }
    } catch (err) {
      alert('Error de conexión al intentar revocar la clave.');
    }
  };

  // Descarga de archivos
  const handleDownloadFile = async (type: 'postman' | 'openapi' | 'markdown' | 'word') => {
    const token = getAuthToken();
    let url = '';
    let fallbackFileName = '';

    if (type === 'postman') {
      url = `${API_BASE_URL}/api/admin/api-tokens/export-postman`;
      fallbackFileName = 'Filatelia_Bolivia_API.postman_collection.json';
    } else if (type === 'openapi') {
      url = `${API_BASE_URL}/api/admin/api-tokens/export-openapi`;
      fallbackFileName = 'filatelia-openapi-spec.json';
    } else if (type === 'word') {
      url = `${API_BASE_URL}/api/admin/api-tokens/export-word`;
      fallbackFileName = 'INFORME_TECNICO_API_FILATELIA_BOLIVIA.doc';
    } else {
      url = `${API_BASE_URL}/api/admin/api-tokens/export-markdown`;
      fallbackFileName = 'FILATELIA_BOLIVIA_API_DOCUMENTACION.md';
    }

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert('No se pudo generar el archivo de exportación.');
        return;
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fallbackFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Error al descargar la documentación.');
    }
  };

  // Descarga de paquete específico para una API individual
  const handleDownloadTokenSpecific = async (tokenId: number, type: 'postman' | 'markdown' | 'word', tokenName: string) => {
    const token = getAuthToken();
    const safeName = tokenName.replace(/[^a-zA-Z0-9_-]/g, '_');
    let url = '';
    let filename = '';

    if (type === 'postman') {
      url = `${API_BASE_URL}/api/admin/api-tokens/${tokenId}/export-postman`;
      filename = `API_${safeName}_Postman.json`;
    } else if (type === 'word') {
      url = `${API_BASE_URL}/api/admin/api-tokens/${tokenId}/export-word`;
      filename = `INFORME_TECNICO_API_${safeName}.doc`;
    } else {
      url = `${API_BASE_URL}/api/admin/api-tokens/${tokenId}/export-markdown`;
      filename = `API_${safeName}_Manual.md`;
    }

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error en descarga');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      alert('No se pudo descargar el archivo.');
    }
  };

  // Copiar Token al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 3000);
  };

  // Copiar comando cURL
  const copyCurl = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCurlIndex(id);
    setTimeout(() => setCopiedCurlIndex(null), 2500);
  };

  // Si no es Super Admin, mostrar bloqueo de seguridad
  if (!isSuperAdmin()) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-amber-50 border-2 border-amber-300 rounded-3xl flex items-center justify-center text-amber-600 mb-6 shadow-xl">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <span className="text-xs font-black tracking-widest text-amber-600 uppercase bg-amber-100 px-3 py-1 rounded-full mb-3">
          Seguridad Institucional &bull; Dirección General
        </span>
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Acceso Exclusivo al Super Administrador
        </h1>
        <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          El módulo de creación de llaves criptográficas (API Keys), emisión de credenciales Sanctum y control de
          integraciones está restringido con exclusividad al personal de Dirección General.
        </p>
        <button
          onClick={() => (window.location.href = '/admin')}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-slate-900/10"
        >
          Volver al Panel Principal
        </button>
      </div>
    );
  }

  // Filtrado de tokens
  const filteredTokens = tokens.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.trim().toLowerCase());
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && t.status === statusFilter;
  });

  const activeCount = tokens.filter((t) => t.status === 'ACTIVE').length;
  const expiredCount = tokens.filter((t) => t.status === 'EXPIRED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado Superior */}
      <div className="bg-[#102542] border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black tracking-wider uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Exclusivo Super Administrador
            </span>
            <span className="text-xs font-semibold text-slate-400">
              &bull; Bóveda & Integraciones REST Correos de Bolivia
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white font-serif tracking-wide">
            Centro de Gestión de APIs & Integraciones
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Control de ciclo de vida de tokens institucionales (Laravel Sanctum), alcances (*scopes*), consumo criptográfico y catálogo de endpoints REST.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2.5 bg-[#0F233E] hover:bg-[#102542] border border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={() => {
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            Emitir Nueva API Key
          </button>
        </div>
      </div>

      {/* Alerta de Token Generado (Bóveda Segura) */}
      {revealedToken && (
        <div className="bg-emerald-950/70 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl shadow-emerald-950/50 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
              <Sparkles className="w-6 h-6 text-emerald-100" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ¡API Key Generada Exitosamente!
                </span>
                <button
                  onClick={() => setRevealedToken(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
              <h3 className="text-lg font-bold text-white font-serif mt-1">
                Clave de Acceso Bearer para: &ldquo;{revealedTokenName}&rdquo;
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                <strong className="text-amber-300">Aviso de Seguridad Criptográfica:</strong> Por políticas de hash SHA-256 de Laravel Sanctum, este token secreto en texto plano{' '}
                <strong className="text-white">no se volverá a mostrar nunca más</strong>. Cópielo y almacénelo en su bóveda segura o entréguelo al integrador oficial ahora mismo.
              </p>

              <div className="mt-4 flex items-center gap-2 bg-[#091627] border border-emerald-500/40 rounded-xl p-3 shadow-inner">
                <code className="flex-1 font-mono text-xs sm:text-sm font-bold text-emerald-300 break-all select-all px-2">
                  {revealedToken}
                </code>
                <button
                  onClick={() => copyToClipboard(revealedToken)}
                  className={`px-4 py-2 rounded-lg font-black text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    hasCopied
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Clave
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setRevealedToken(null)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  He guardado la clave en un lugar seguro, descartar aviso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de Estadísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F233E] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Emitidas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">{tokens.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Historial de credenciales emitidas</span>
        </div>

        <div className="bg-[#0F233E] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Claves Activas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2 font-mono">{activeCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Habilitadas para consumo REST</span>
        </div>

        <div className="bg-[#0F233E] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Claves Caducadas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 mt-2 font-mono">{expiredCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Expiradas por límite de tiempo</span>
        </div>

        <div className="bg-[#0F233E] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Formatos Oficiales</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">4 Formatos</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Word (.doc), Postman, OpenAPI 3 & MD</span>
        </div>
      </div>

      {/* Barra de Pestañas */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('tokens')}
          className={`pb-3 px-5 text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'tokens'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Key className="w-4 h-4" />
          API Keys Emitidas ({tokens.length})
        </button>
        <button
          onClick={() => setActiveTab('showcase')}
          className={`pb-3 px-5 text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'showcase'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Store className="w-4 h-4 text-[#FECC36]" />
          Vitrina Portal Correos (API)
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`pb-3 px-5 text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'docs'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Documentación de Endpoints
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`pb-3 px-5 text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'downloads'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Download className="w-4 h-4 text-amber-400" />
          Descargar Especificaciones
        </button>
      </div>

      {/* TAB VITRINA: CONFIGURACIÓN PARA EL PORTAL GENERAL DE CORREOS */}
      {activeTab === 'showcase' && (
        <ShowcaseManager />
      )}

      {/* TAB 1: LISTADO DE TOKENS */}
      {activeTab === 'tokens' && (
        <div className="bg-[#0D2039] border border-slate-800 rounded-2xl p-6 shadow-xl">
          {/* Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre de cliente o integración..."
                className="w-full pl-9 pr-4 py-2 bg-[#0B1A2D] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Filtrar:</span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
                    : 'bg-[#0B1A2D] border border-slate-800 text-slate-400 hover:text-white hover:bg-[#102542]/40'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
                    : 'bg-[#0B1A2D] border border-slate-800 text-slate-400 hover:text-white hover:bg-[#102542]/40'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setStatusFilter('EXPIRED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'EXPIRED'
                    ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
                    : 'bg-[#0B1A2D] border border-slate-800 text-slate-400 hover:text-white hover:bg-[#102542]/40'
                }`}
              >
                Caducadas
              </button>
            </div>
          </div>

          {/* Tabla de Tokens */}
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-bold">Cargando credenciales oficiales...</p>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#0B1A2D]/50">
              <Key className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-black text-slate-300">No se encontraron API Keys</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No hay credenciales que coincidan con los criterios de búsqueda o aún no ha emitido ninguna clave.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
              >
                Emitir Primera Clave
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B1A2D] border-b border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-4">Aplicación / Cliente</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Permisos (*Scopes*)</th>
                    <th className="py-3 px-4">Última Actividad</th>
                    <th className="py-3 px-4">Vigencia / Expiración</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs bg-[#0D2039]">
                  {filteredTokens.map((t) => (
                    <tr key={t.id} className="hover:bg-[#102542]/70 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${t.is_expired ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                          {t.name}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Emitida por: {t.tokenable_name} &bull; {new Date(t.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {t.is_expired ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 border border-rose-500/30 text-rose-400">
                            CADUCADA
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            ACTIVA
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {t.abilities.map((ab) => (
                            <span
                              key={ab}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                ab === '*'
                                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                                  : 'bg-[#0B1A2D] border border-slate-700 text-slate-300'
                              }`}
                            >
                              {ab}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-medium">
                        {t.last_used_human}
                      </td>

                      <td className="py-4 px-4 text-slate-300">
                        {t.expires_at ? (
                          <span title={t.expires_at}>
                            {new Date(t.expires_at).toLocaleDateString()} ({t.expires_human})
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">Permanente</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedDetailToken(t);
                              setShowSecretToken(false);
                            }}
                            className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Ver todos los detalles, token y documentación de esta API"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver Detalles
                          </button>
                          <button
                            onClick={() => handleRevokeToken(t.id, t.name)}
                            className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Revocar permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Revocar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCUMENTACIÓN DE ENDPOINTS */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-[#0D2039] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Especificación REST &bull; OAS 3.0
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-serif mb-1">
              Catálogo de Servicios REST & Endpoints Institucionales
            </h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Consulte la especificación interactiva de los endpoints REST expuestos por la plataforma. Para consumir los
              servicios protegidos, incluya el encabezado{' '}
              <code className="bg-[#091627] border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                Authorization: Bearer &lt;API_TOKEN&gt;
              </code>
              .
            </p>

            <div className="space-y-6">
              {endpointGroups.map((group) => (
                <div key={group.group} className="border border-slate-800 rounded-xl overflow-hidden bg-[#0B1A2D]/50 shadow-md">
                  <div className="bg-[#0F233E] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                      {group.group}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400">
                      {group.endpoints.length} servicio(s)
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/60 p-4 space-y-4">
                    {group.endpoints.map((ep, idx) => {
                      const curlId = `${group.group}-${idx}`;
                      const isCurlCopied = copiedCurlIndex === curlId;
                      const methodColor =
                        ep.method === 'GET'
                          ? 'bg-blue-600'
                          : ep.method === 'POST'
                          ? 'bg-emerald-600'
                          : ep.method === 'PATCH'
                          ? 'bg-amber-600'
                          : 'bg-rose-600';

                      return (
                        <div key={ep.path + ep.method} className="bg-[#0D2039]/90 border border-slate-800/90 rounded-xl p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`${methodColor} text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm`}>
                                {ep.method}
                              </span>
                              <code className="text-xs font-black text-amber-300 font-mono">
                                {ep.path}
                              </code>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {ep.required_scopes.map((s) => (
                                <span
                                  key={s}
                                  className="text-[10px] font-mono font-bold bg-[#0B1A2D] border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-white">{ep.title}</h4>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{ep.description}</p>

                          {/* Bloque cURL */}
                          <div className="mt-3 bg-[#091627] text-slate-100 border border-slate-800 rounded-xl p-3 font-mono text-xs relative overflow-x-auto shadow-inner">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 font-sans">
                              <span>Comando cURL de prueba</span>
                              <button
                                onClick={() => copyCurl(ep.curl_sample, curlId)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {isCurlCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    ¡Copiado!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    Copiar cURL
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="text-sky-300 whitespace-pre-wrap break-all text-[11px]">
                              {ep.curl_sample}
                            </pre>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DESCARGAS DE ESPECIFICACIONES */}
      {activeTab === 'downloads' && (
        <div className="bg-[#0D2039] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="max-w-2xl mb-6">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full inline-block mb-1.5">
              Documentación Descargable &bull; Integración Oficial
            </span>
            <h2 className="text-xl font-bold text-white font-serif mt-1">
              Paquetes de Especificación para Desarrolladores y Entidades
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Descargue los archivos estandarizados de la API para importarlos en sus herramientas de desarrollo,
              generar SDKs automáticos o compartir con organismos que integrarán con Filatelia Bolivia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tarjeta Informe Técnico Word */}
            <div className="border-2 border-amber-500/40 bg-[#102542] rounded-2xl p-6 flex flex-col justify-between hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all">
              <div>
                <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl flex items-center justify-center font-black text-sm mb-4 shadow-md">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Informe Técnico Word (.doc)
                </span>
                <h3 className="text-base font-bold text-white font-serif mt-2">
                  Informe Formal Institucional
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Documento formal estructurado para Microsoft Word con carátula ministerial, código oficial (INF-DGTIC-FIL-2026), arquitectura criptográfica Sanctum, matriz de permisos, endpoints y firmas de responsabilidad técnica.
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile('word')}
                className="mt-6 w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                Descargar Informe (.doc)
              </button>
            </div>

            {/* Tarjeta Postman */}
            <div className="border border-orange-500/30 bg-orange-950/20 rounded-2xl p-6 flex flex-col justify-between hover:border-orange-400/60 hover:shadow-xl hover:shadow-orange-500/10 transition-all">
              <div>
                <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/40 text-orange-400 rounded-xl flex items-center justify-center font-black text-sm mb-4 shadow-md">
                  POST
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  Postman Collection v2.1
                </span>
                <h3 className="text-base font-bold text-white font-serif mt-2">
                  Colección Postman Oficial
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Lista completa de endpoints con variables de entorno preconfiguradas, cabeceras de autorización y
                  solicitudes de prueba preparadas para ejecutar en un solo clic.
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile('postman')}
                className="mt-6 w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Descargar .postman_collection.json
              </button>
            </div>

            {/* Tarjeta OpenAPI */}
            <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all">
              <div>
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl flex items-center justify-center font-black text-sm mb-4 shadow-md">
                  OAS
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  OpenAPI 3.0 / Swagger
                </span>
                <h3 className="text-base font-bold text-white font-serif mt-2">
                  Especificación OpenAPI JSON
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Estándar mundial para importar en Swagger UI, Redoc o generar clientes tipados en Python, TypeScript,
                  Java, Go o PHP usando OpenAPI Generator.
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile('openapi')}
                className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Descargar openapi.json
              </button>
            </div>

            {/* Tarjeta Markdown */}
            <div className="border border-blue-500/30 bg-blue-950/20 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
              <div>
                <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-xl flex items-center justify-center font-black text-sm mb-4 shadow-md">
                  MD
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  Manual Técnico en Markdown
                </span>
                <h3 className="text-base font-bold text-white font-serif mt-2">
                  Manual Técnico Completo (.md)
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Documento legible listo para repositorios Git, wikis institucionales o exportar a PDF con matriz de
                  permisos, códigos de respuesta y ejemplos cURL.
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile('markdown')}
                className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Descargar Documentación (.md)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES COMPLETOS DE LA API SELECCIONADA */}
      {selectedDetailToken && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D2039] border-2 border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Cabecera */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Ficha Técnica de Integración
                  </span>
                  {selectedDetailToken.is_expired ? (
                    <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                      CADUCADA
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      ACTIVA
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white font-serif">
                  {selectedDetailToken.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID #{selectedDetailToken.id} &bull; Asignada a {selectedDetailToken.tokenable_name} ({selectedDetailToken.tokenable_email})
                </p>
              </div>

              <button
                onClick={() => setSelectedDetailToken(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold p-1 leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Credencial / Token con opción de revelar y copiar */}
            <div className="bg-[#0B1A2D] border border-slate-800 rounded-2xl p-5 mb-6 text-white shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Token de Acceso Bearer
                </span>
                {selectedDetailToken.token_value && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSecretToken(!showSecretToken)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {showSecretToken ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          Ver Token
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedDetailToken.token_value || '');
                        setDetailCopied(true);
                        setTimeout(() => setDetailCopied(false), 2500);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        detailCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {detailCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {selectedDetailToken.token_value ? (
                <div className="bg-[#091627] border border-slate-800 rounded-xl p-3 font-mono text-xs text-sky-300 break-all select-all font-bold">
                  {showSecretToken
                    ? selectedDetailToken.token_value
                    : selectedDetailToken.token_preview || '••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                </div>
              ) : (
                <div className="bg-[#091627] border border-slate-800 rounded-xl p-3 text-xs text-slate-400 italic">
                  Token generado previamente sin copia cifrada reversible. Se recomienda generar una nueva clave si necesita ver el texto plano.
                </div>
              )}

              <div className="mt-2 text-[11px] text-slate-400 font-mono">
                Cabecera HTTP: <span className="text-amber-300">Authorization: Bearer {selectedDetailToken.token_value || '<API_TOKEN>'}</span>
              </div>
            </div>

            {/* Metadatos en Grilla */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-[#0B1A2D] border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Fecha de Emisión</span>
                <span className="text-xs font-black text-white mt-1 block">
                  {new Date(selectedDetailToken.created_at).toLocaleString()}
                </span>
              </div>
              <div className="bg-[#0B1A2D] border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Expiración</span>
                <span className={`text-xs font-black mt-1 block ${selectedDetailToken.is_expired ? 'text-rose-400' : 'text-slate-200'}`}>
                  {selectedDetailToken.expires_at ? new Date(selectedDetailToken.expires_at).toLocaleDateString() : 'Permanente'}
                </span>
              </div>
              <div className="bg-[#0B1A2D] border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Último Acceso</span>
                <span className="text-xs font-black text-white mt-1 block">
                  {selectedDetailToken.last_used_human}
                </span>
              </div>
            </div>

            {/* Scopes Autorizados */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                Permisos Autorizados (*Scopes*) ({selectedDetailToken.abilities.length})
              </h3>
              <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl p-2.5 bg-[#0B1A2D]/80 space-y-1.5">
                {selectedDetailToken.detailed_scopes && selectedDetailToken.detailed_scopes.length > 0 ? (
                  selectedDetailToken.detailed_scopes.map((sc) => (
                    <div key={sc.key} className="bg-[#0F233E] border border-slate-800 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{sc.label}</span>
                        <code className="text-[10px] font-mono bg-[#0B1A2D] border border-slate-700 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                          {sc.key}
                        </code>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {sc.description}
                      </p>
                    </div>
                  ))
                ) : (
                  selectedDetailToken.abilities.map((ab) => (
                    <div key={ab} className="bg-[#0F233E] border border-slate-800 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{ab}</span>
                      <code className="text-[10px] font-mono bg-[#0B1A2D] border border-slate-700 text-amber-300 px-1.5 py-0.5 rounded">
                        {ab}
                      </code>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Descargas Específicas de esta API */}
            <div className="bg-[#0B1A2D] border border-amber-500/30 rounded-2xl p-5 mb-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Paquete de Integración Directa
              </span>
              <h3 className="text-sm font-bold text-white font-serif mt-0.5">
                Descargar Documentación para &ldquo;{selectedDetailToken.name}&rdquo;
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Descargue la colección o el manual con la API Key y variables ya configuradas para esta integración específica.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <button
                  onClick={() => handleDownloadTokenSpecific(selectedDetailToken.id, 'word', selectedDetailToken.name)}
                  className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                  Informe Word (.doc)
                </button>
                <button
                  onClick={() => handleDownloadTokenSpecific(selectedDetailToken.id, 'postman', selectedDetailToken.name)}
                  className="py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Postman (.json)
                </button>
                <button
                  onClick={() => handleDownloadTokenSpecific(selectedDetailToken.id, 'markdown', selectedDetailToken.name)}
                  className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Manual (.md)
                </button>
              </div>
            </div>

            {/* Pie del modal */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  if (confirm(`¿Revocar permanentemente la clave "${selectedDetailToken.name}"?`)) {
                    handleRevokeToken(selectedDetailToken.id, selectedDetailToken.name);
                    setSelectedDetailToken(null);
                  }
                }}
                className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Revocar Clave
              </button>
              <button
                onClick={() => setSelectedDetailToken(null)}
                className="px-5 py-2 bg-[#0F233E] hover:bg-[#102542] border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA EMITIR NUEVA API KEY */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D2039] border-2 border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Credencial Institucional
                </span>
                <h2 className="text-xl font-bold text-white font-serif">
                  Emitir Nueva API Key (Laravel Sanctum)
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateToken} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">
                    Nombre Identificador / Cliente *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Aduana Postal, App Móvil, Courier"
                    className="w-full px-3 py-2 bg-[#0B1A2D] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Nombre para rastrear quién realiza las llamadas.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">
                    Vigencia / Expiración
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0B1A2D] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
                  >
                    <option value={30} className="bg-[#0B1A2D] text-white">30 Días (1 Mes)</option>
                    <option value={60} className="bg-[#0B1A2D] text-white">60 Días (2 Meses)</option>
                    <option value={90} className="bg-[#0B1A2D] text-white">90 Días (3 Meses - Recomendado)</option>
                    <option value={180} className="bg-[#0B1A2D] text-white">180 Días (6 Meses)</option>
                    <option value={365} className="bg-[#0B1A2D] text-white">365 Días (1 Año Institucional)</option>
                    <option value={0} className="bg-[#0B1A2D] text-white">Sin Expiración (Permanente)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Tiempo tras el cual la clave quedará inactiva.
                  </span>
                </div>
              </div>

              {/* Selector de Scopes */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-black text-slate-300">
                      Permisos y Capacidades (*Scopes*) *
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Elija las operaciones autorizadas para esta clave.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllScopes}
                      className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-bold rounded-lg hover:bg-blue-500/25 cursor-pointer"
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectMasterScope}
                      className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold rounded-lg hover:bg-amber-500/25 cursor-pointer"
                    >
                      Maestro (*)
                    </button>
                    <button
                      type="button"
                      onClick={handleClearScopes}
                      className="px-2.5 py-1 bg-[#0B1A2D] border border-slate-700 text-slate-400 text-[11px] font-bold rounded-lg hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-xl p-3 bg-[#0B1A2D]/80 space-y-2">
                  {availableScopes.map((scope) => {
                    const isChecked = selectedScopes.includes(scope.key) || selectedScopes.includes('*');

                    return (
                      <label
                        key={scope.key}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#102542] border-amber-500/40 text-white shadow-sm'
                            : 'bg-[#0D2039]/80 border-slate-800 text-slate-300 hover:bg-[#102542]/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope.key)}
                          onChange={() => toggleScope(scope.key)}
                          className="mt-0.5 rounded text-amber-400 focus:ring-0 w-4 h-4 cursor-pointer accent-amber-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white">{scope.label}</span>
                            <code className="text-[10px] font-mono bg-[#0B1A2D] border border-slate-700 px-1.5 py-0.5 rounded text-amber-300">
                              {scope.key}
                            </code>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {scope.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generando Token...
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5 stroke-[2.5]" />
                      Emitir y Revelar Clave
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
