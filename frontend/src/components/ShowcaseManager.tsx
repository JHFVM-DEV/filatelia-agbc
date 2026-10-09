'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Store,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  ShoppingBag,
  Heart,
  Sliders,
  Globe,
  Code2,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { API_BASE_URL, normalizeImageUrl } from '@/config/api';

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  catalog_code?: string;
  price: number;
  price_formatted?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  emission?: {
    id: number;
    name: string;
    year: number;
  };
  front_image?: string;
  image_url?: string;
  description?: string;
  condition?: string;
  rarity?: string;
  stock: number;
  is_in_showcase: boolean;
  showcase_order: number;
  showcase_badge?: string | null;
}

const BADGE_SUGGESTIONS = [
  'COLECCIÓN OFICIAL',
  'PATRIMONIO CULTURAL',
  'MEMORIA POSTAL',
  'EDICIÓN INSTITUCIONAL',
  'SERIE ESPECIAL',
  'PIEZA DE BÓVEDA',
  'HOMENAJE SOBERANO',
  'BICENTENARIO',
];

export const ShowcaseManager: React.FC = () => {
  const [showcaseItems, setShowcaseItems] = useState<ProductItem[]>([]);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [searchCatalog, setSearchCatalog] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [apiJsonResponse, setApiJsonResponse] = useState<any>(null);
  const [loadingJson, setLoadingJson] = useState<boolean>(false);

  // Endpoint de integración
  const showcaseApiUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/external/showcase`
    : 'http://localhost:8000/api/external/showcase';

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('filatelia_token');
    }
    return null;
  };

  // Cargar datos del backend
  const fetchShowcaseData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/showcase`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setShowcaseItems(data.showcase_items || []);
        setAllProducts(data.all_products || []);
      }
    } catch (err) {
      console.error('Error al cargar datos de vitrina:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcaseData();
  }, []);

  // Mover elemento arriba en el orden
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...showcaseItems];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    // Reasignar orden secuencial
    newItems.forEach((item, idx) => {
      item.showcase_order = idx + 1;
    });
    setShowcaseItems(newItems);
  };

  // Mover elemento abajo en el orden
  const handleMoveDown = (index: number) => {
    if (index >= showcaseItems.length - 1) return;
    const newItems = [...showcaseItems];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    // Reasignar orden secuencial
    newItems.forEach((item, idx) => {
      item.showcase_order = idx + 1;
    });
    setShowcaseItems(newItems);
  };

  // Quitar de vitrina
  const handleRemoveFromShowcase = (id: number) => {
    const newItems = showcaseItems.filter((item) => item.id !== id);
    newItems.forEach((item, idx) => {
      item.showcase_order = idx + 1;
    });
    setShowcaseItems(newItems);
  };

  // Añadir a vitrina
  const handleAddToShowcase = (prod: ProductItem) => {
    if (showcaseItems.some((item) => item.id === prod.id)) return;
    const newItem: ProductItem = {
      ...prod,
      is_in_showcase: true,
      showcase_order: showcaseItems.length + 1,
      showcase_badge: prod.showcase_badge || 'COLECCIÓN OFICIAL',
    };
    setShowcaseItems([...showcaseItems, newItem]);
  };

  // Cambiar badge de un elemento en vitrina
  const handleBadgeChange = (id: number, badge: string) => {
    setShowcaseItems(
      showcaseItems.map((item) =>
        item.id === id ? { ...item, showcase_badge: badge } : item
      )
    );
  };

  // Guardar en backend
  const handleSaveShowcase = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const token = getAuthToken();
      const ordered_ids = showcaseItems.map((item) => item.id);
      const badges: Record<number, string> = {};
      showcaseItems.forEach((item) => {
        badges[item.id] = item.showcase_badge || 'COLECCIÓN OFICIAL';
      });

      const res = await fetch(`${API_BASE_URL}/api/admin/showcase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ordered_ids,
          badges,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
        await fetchShowcaseData();
      }
    } catch (err) {
      console.error('Error al guardar vitrina:', err);
    } finally {
      setSaving(false);
    }
  };

  // Restablecer selección por defecto
  const handleResetDefault = async () => {
    if (!confirm('¿Restablecer la vitrina a las 4 estampas iniciales sugeridas de Correos de Bolivia?')) {
      return;
    }
    setSaving(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/showcase/reset-default`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
        await fetchShowcaseData();
      }
    } catch (err) {
      console.error('Error al restablecer vitrina:', err);
    } finally {
      setSaving(false);
    }
  };

  // Probar y cargar JSON de la API en vivo
  const handleViewJson = async () => {
    setShowJsonModal(true);
    setLoadingJson(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/external/showcase`);
      if (res.ok) {
        const json = await res.json();
        setApiJsonResponse(json);
      }
    } catch (err) {
      console.error('Error al consultar API JSON:', err);
    } finally {
      setLoadingJson(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Filtrar catálogo general
  const filteredCatalog = useMemo(() => {
    return allProducts.filter((prod) => {
      const matchesSearch =
        searchCatalog === '' ||
        prod.name.toLowerCase().includes(searchCatalog.trim().toLowerCase()) ||
        (prod.catalog_code && prod.catalog_code.toLowerCase().includes(searchCatalog.trim().toLowerCase()));

      const matchesCategory =
        selectedCategoryFilter === 'all' ||
        prod.category?.slug === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchCatalog, selectedCategoryFilter]);

  // Lista única de categorías para el filtro
  const availableCategories = useMemo(() => {
    const cats = new Map<string, string>();
    allProducts.forEach((p) => {
      if (p.category?.slug && p.category?.name) {
        cats.set(p.category.slug, p.category.name);
      }
    });
    return Array.from(cats.entries()).map(([slug, name]) => ({ slug, name }));
  }, [allProducts]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header con Banner Informativo y Controles Principales */}
      <div className="bg-[#102542] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FECC36] text-[#102542] text-xs font-black shadow-sm tracking-wide">
              <Store className="w-4 h-4" />
              <span>INTEGRACIÓN OFICIAL — CORREOS MARKET</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Control de Vitrina y API para el Portal General
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              Seleccione qué estampas filatélicas se exhibirán en la sección <strong>&quot;Correos Market / Filatelia&quot;</strong> del portal principal de Correos de Bolivia y defina su <strong>orden exacto de visualización</strong> para la API pública.
            </p>
          </div>

          {/* Botones de Acción Global */}
          <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
            <button
              onClick={handleSaveShowcase}
              disabled={saving}
              className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#FECC36] hover:bg-[#FFD95E] text-[#102542] hover:scale-105 active:scale-95'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Cambios Guardados!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Guardar Orden y Vitrina</span>
                </>
              )}
            </button>

            <button
              onClick={handleViewJson}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FileJson className="w-4 h-4 text-[#FECC36]" />
              <span>Ver Respuesta JSON API</span>
            </button>

            <button
              onClick={handleResetDefault}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer 4 por Defecto</span>
            </button>
          </div>
        </div>

        {/* Barra de Endpoint e Información Técnica */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Globe className="w-4 h-4 text-[#FECC36]" />
            <span className="font-medium">Endpoint API Público:</span>
            <code className="bg-black/40 px-2.5 py-1 rounded-md text-amber-300 font-mono text-[11px]">
              GET /api/external/showcase
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(showcaseApiUrl)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition text-[11px] font-medium cursor-pointer"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? '¡Copiado!' : 'Copiar URL Completa'}</span>
            </button>
            <a
              href={`${API_BASE_URL}/api/external/showcase`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition text-[11px] font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir en Pestaña</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Simulador en Vivo del Portal General (Live Mockup de la imagen adjunta) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DDD5] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2DDD5]">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#102542]" />
              <h3 className="text-lg font-black text-[#102542]">
                Simulador en Tiempo Real — Portal General de Correos
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Así se renderizará exactamente la sección <strong>Correos Market</strong> en la página de inicio del sistema general.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#FECC36]/20 text-[#102542] text-xs font-bold border border-[#FECC36]/40 self-start sm:self-auto">
            {showcaseItems.length} {showcaseItems.length === 1 ? 'estampa expuesta' : 'estampas expuestas'}
          </span>
        </div>

        {/* Marco de Simulación Visual idéntico a la imagen del portal general */}
        <div className="bg-[#F3F6FA] rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-inner">
          {/* Header de la sección Correos Market */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#FECC36] flex items-center justify-center text-[#102542] shadow-md shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-[#102542] tracking-tight">
                Correos Market / Filatelia
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Descubre nuestra colección exclusiva de sellos y souvenirs
              </p>
            </div>
          </div>

          {/* Tarjetas Visuales Renderizadas en el Orden Configurado */}
          {showcaseItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No hay estampas asignadas a la vitrina</p>
              <p className="text-xs text-slate-500 mt-1">Seleccione estampas en el catálogo inferior para agregarlas al portal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {showcaseItems.map((item, idx) => {
                const imgUrl = normalizeImageUrl(item.front_image || item.image_url);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                  >
                    {/* Badge y Wishlist */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#FECC36]/25 text-[#102542] border border-[#FECC36]/50 tracking-wider">
                          {item.showcase_badge || item.category?.name || 'COLECCIÓN OFICIAL'}
                        </span>
                        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition">
                          <Heart className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Marco con Imagen de la Estampa */}
                      <div className="relative w-full h-44 bg-[#0B1526] rounded-xl p-2 flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner mb-4">
                        <div className="relative w-full h-full">
                          <Image
                            src={imgUrl}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 250px"
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      {/* Título y Descripción */}
                      <h5 className="font-extrabold text-sm text-[#102542] line-clamp-1 group-hover:text-[#2C63AC] transition">
                        {item.name}
                      </h5>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description || 'Una pieza conmemorativa oficial pensada para coleccionistas que valoran la identidad postal boliviana.'}
                      </p>
                    </div>

                    {/* Precio y Botón Carrito */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                      <div>
                        <span className="text-base font-black text-[#102542]">
                          Bs. {Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#FECC36] hover:bg-[#FFD95E] text-[#102542] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform cursor-pointer">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Tag de Posición flotante */}
                    <div className="absolute -top-2.5 -right-2.5 bg-[#102542] text-[#FECC36] text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                      #{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Panel de Reordenamiento y Gestión de Estampas Activas */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DDD5] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2DDD5]">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#102542]" />
              <h3 className="text-lg font-black text-[#102542]">
                Secuencia y Etiquetas de la API ({showcaseItems.length} Estampas)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Utilice las flechas <strong>Subir (▲)</strong> y <strong>Bajar (▼)</strong> para alterar el orden en que la API entrega las piezas.
            </p>
          </div>

          <button
            onClick={handleSaveShowcase}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#102542] text-white hover:bg-[#2C63AC] transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-[#FECC36]" />
            <span>Guardar Este Orden</span>
          </button>
        </div>

        {showcaseItems.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No hay piezas seleccionadas aún.</p>
        ) : (
          <div className="space-y-3">
            {showcaseItems.map((item, index) => {
              const imgUrl = normalizeImageUrl(item.front_image || item.image_url);
              return (
                <div
                  key={item.id}
                  className="bg-[#FAF8F0]/70 rounded-2xl p-4 border border-[#E5DFC8] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#102542]/30 transition group"
                >
                  {/* Posición e Imagen */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-[#102542] text-[#FECC36] font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      #{index + 1}
                    </span>

                    <div className="relative w-14 h-16 bg-white rounded-lg border border-[#E2DDD5] p-1 shrink-0 overflow-hidden shadow-xs">
                      <Image
                        src={imgUrl}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#8A6800] font-mono">
                          {item.catalog_code || `ID #${item.id}`}
                        </span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {item.category?.name || 'Oficial'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#102542] truncate mt-0.5" title={item.name}>
                        {item.name}
                      </h4>
                      <span className="text-xs font-black text-slate-700">
                        Bs. {Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Selector / Editor de Badge y Controles de Orden */}
                  <div className="flex flex-wrap items-center gap-3 justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5DFC8]">
                    {/* Selector de Badge Temático */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Etiqueta:</span>
                      <select
                        value={item.showcase_badge || 'COLECCIÓN OFICIAL'}
                        onChange={(e) => handleBadgeChange(item.id, e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-[#E2DDD5] bg-white font-bold text-[#102542] focus:outline-none focus:border-[#102542]"
                      >
                        {BADGE_SUGGESTIONS.map((badge) => (
                          <option key={badge} value={badge}>
                            {badge}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Flechas Subir / Bajar */}
                    <div className="flex items-center bg-white rounded-xl border border-[#E2DDD5] p-0.5 shadow-xs">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Mover arriba en el orden"
                        className={`p-1.5 rounded-lg transition ${
                          index === 0
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-[#102542] hover:bg-[#FAF8F0] active:scale-90 cursor-pointer'
                        }`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === showcaseItems.length - 1}
                        title="Mover abajo en el orden"
                        className={`p-1.5 rounded-lg transition ${
                          index === showcaseItems.length - 1
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-[#102542] hover:bg-[#FAF8F0] active:scale-90 cursor-pointer'
                        }`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Botón Quitar de Vitrina */}
                    <button
                      onClick={() => handleRemoveFromShowcase(item.id)}
                      title="Quitar esta pieza de la vitrina"
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Selector de Sellos del Catálogo Completo */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DDD5] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2DDD5]">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#102542]" />
              <h3 className="text-lg font-black text-[#102542]">
                Catálogo de Piezas Disponibles ({filteredCatalog.length} Piezas)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Busque y active cualquier estampilla de la bóveda para incorporarla a la vitrina de Correos.
            </p>
          </div>

          {/* Filtros y Buscador */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por sello o código..."
                value={searchCatalog}
                onChange={(e) => setSearchCatalog(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2DDD5] bg-[#FAF8F0]/40 text-[#102542] focus:outline-none focus:border-[#102542]"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2DDD5] bg-[#FAF8F0]/40 text-[#102542] focus:outline-none focus:border-[#102542]"
            >
              <option value="all">Todas las Categorías</option>
              {availableCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de Piezas del Catálogo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCatalog.map((prod) => {
            const inShowcase = showcaseItems.some((item) => item.id === prod.id);
            const showcaseIdx = showcaseItems.findIndex((item) => item.id === prod.id);
            const imgUrl = normalizeImageUrl(prod.front_image || prod.image_url);

            return (
              <div
                key={prod.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  inShowcase
                    ? 'bg-amber-50/50 border-[#FECC36] shadow-sm'
                    : 'bg-white border-[#E2DDD5] hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="relative w-full h-32 bg-[#FAF8F0] rounded-xl border border-[#E5DFC8] p-2 flex items-center justify-center overflow-hidden mb-3">
                    <Image
                      src={imgUrl}
                      alt={prod.name}
                      fill
                      sizes="200px"
                      className="object-contain"
                    />
                    {inShowcase && (
                      <span className="absolute top-2 right-2 bg-[#102542] text-[#FECC36] text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        En Vitrina #{showcaseIdx + 1}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-[#8A6800] uppercase font-mono block">
                    {prod.catalog_code || 'OFICIAL'}
                  </span>
                  <h4 className="font-bold text-xs text-[#102542] line-clamp-1 mt-0.5" title={prod.name}>
                    {prod.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    Bs. {Number(prod.price).toFixed(2)} • Stock: {prod.stock}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {inShowcase ? (
                    <button
                      onClick={() => handleRemoveFromShowcase(prod.id)}
                      className="w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar de Vitrina</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToShowcase(prod)}
                      className="w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-[#FECC36] hover:bg-[#FFD95E] text-[#102542] shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar a Vitrina</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Modal de Respuesta JSON en Vivo */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#102542] text-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileJson className="w-5 h-5 text-[#FECC36]" />
                <h4 className="text-base font-bold text-white">
                  Respuesta en Vivo — GET /api/external/showcase
                </h4>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto font-mono text-xs text-amber-200/90 bg-black/50 flex-1">
              {loadingJson ? (
                <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Consultando API en vivo...</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(apiJsonResponse, null, 2)}
                </pre>
              )}
            </div>

            <div className="p-4 bg-[#0D1E35] border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Esta es la carga JSON exacta que recibirá el portal de Correos de Bolivia.
              </span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(apiJsonResponse, null, 2))}
                className="px-4 py-2 rounded-xl bg-[#FECC36] text-[#102542] font-bold flex items-center gap-1.5 hover:bg-[#FFD95E] transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
