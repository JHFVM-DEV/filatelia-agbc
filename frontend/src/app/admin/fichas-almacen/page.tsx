'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCode,
  Printer,
  Search,
  Filter,
  Layers,
  Package,
  Building2,
  FolderOpen,
  CheckSquare,
  Square,
  RefreshCw,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Tag,
  FileText,
  Copy,
  Download,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useStore } from '@/context/StoreContext';

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  catalog_code: string;
  price: number;
  face_value: string | null;
  year: number;
  country: string;
  condition: string;
  rarity: string;
  certified: boolean;
  stock: number;
  perforation: string | null;
  printing_technique: string | null;
  paper_type: string | null;
  gum_condition: string | null;
  dimensions: string | null;
  front_image: string | null;
  category?: { id: number; name: string };
  emission?: { id: number; name: string; year: number };
  vault_room?: string;
  vault_cabinet?: string;
  vault_drawer?: string;
  vault_album?: string;
  vault_envelope?: string;
  vault_notes?: string;
}

type CardFormat = 'CARD_GLASSINE' | 'LABEL_DRAWER' | 'SHEET_A4';
type QRTarget = 'CATALOG' | 'ADMIN' | 'TECHNICAL';

export default function FichasAlmacenPage() {
  const { currentUser, openLoginModal } = useStore();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [cardFormat, setCardFormat] = useState<CardFormat>('CARD_GLASSINE');
  const [qrTarget, setQrTarget] = useState<QRTarget>('CATALOG');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [drawerFilter, setDrawerFilter] = useState('ALL');

  // QR cache map: productId -> base64 dataURL
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({});

  // Quick Topography Edit Modal
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editRoom, setEditRoom] = useState('');
  const [editCabinet, setEditCabinet] = useState('');
  const [editDrawer, setEditDrawer] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editEnvelope, setEditEnvelope] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Status banners
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null);

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = getToken();
      if (!token) {
        setErrorMessage('Por favor inicie sesión como administrador para gestionar fichas de bóveda.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Error al cargar inventario filatélico');

      const data = await res.json();
      const list: ProductItem[] = data.products || [];
      setProducts(list);

      // Preselect stamps: if search param exists, preselect matching stamps, else first 8
      const urlQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('search')?.toLowerCase() : null;
      if (urlQuery) {
        const matches = list.filter(
          (p) =>
            p.catalog_code?.toLowerCase().includes(urlQuery) ||
            p.name.toLowerCase().includes(urlQuery)
        );
        if (matches.length > 0) {
          setSelectedIds(matches.map((p) => p.id));
        } else if (list.length > 0) {
          setSelectedIds(list.slice(0, 8).map((p) => p.id));
        }
      } else if (selectedIds.length === 0 && list.length > 0) {
        setSelectedIds(list.slice(0, 8).map((p) => p.id));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search');
      if (q) setSearchTerm(q);
      const fmt = params.get('format') as CardFormat;
      if (fmt) setCardFormat(fmt);
    }
    fetchProducts();
  }, []);

  // Generate QR codes for all products whenever products or qrTarget changes
  useEffect(() => {
    if (products.length === 0) return;

    const generateAllQrs = async () => {
      const newQrMap: Record<number, string> = {};
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

      for (const p of products) {
        let payload = '';
        if (qrTarget === 'CATALOG') {
          payload = `${origin}/catalogo/${p.slug}`;
        } else if (qrTarget === 'ADMIN') {
          payload = `${origin}/admin/piezas?search=${encodeURIComponent(p.catalog_code)}`;
        } else {
          // Compact technical string
          payload = `FIL-BO|${p.catalog_code}|${p.year}|${p.face_value || 'S/V'}|${p.condition}|${p.vault_drawer || 'G-01'}|${p.vault_envelope || 'ENV-01'}`;
        }

        try {
          const url = await QRCode.toDataURL(payload, {
            width: 280,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
          });
          newQrMap[p.id] = url;
        } catch (e) {
          console.error('Error generating QR for', p.catalog_code, e);
        }
      }
      setQrCodes(newQrMap);
    };

    generateAllQrs();
  }, [products, qrTarget]);

  // Unique categories & drawers for filters
  const categories = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach((p) => {
      if (p.category) map.set(p.category.id, p.category.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const drawers = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.vault_drawer) set.add(p.vault_drawer);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'ALL' && String(p.category?.id) !== categoryFilter) {
        return false;
      }
      if (drawerFilter !== 'ALL' && p.vault_drawer !== drawerFilter) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const mName = p.name.toLowerCase().includes(q);
        const mCode = p.catalog_code?.toLowerCase().includes(q);
        const mDrawer = p.vault_drawer?.toLowerCase().includes(q);
        const mAlbum = p.vault_album?.toLowerCase().includes(q);
        return mName || mCode || mDrawer || mAlbum;
      }
      return true;
    });
  }, [products, categoryFilter, drawerFilter, searchTerm]);

  // Selection handlers
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredProducts.map((p) => p.id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Quick Topography Edit Modal
  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setEditRoom(p.vault_room || 'Bóveda Central A');
    setEditCabinet(p.vault_cabinet || 'Armario Ignífugo 01');
    setEditDrawer(p.vault_drawer || 'Gaveta G-01');
    setEditAlbum(p.vault_album || '');
    setEditEnvelope(p.vault_envelope || '');
    setEditNotes(p.vault_notes || '');
  };

  const handleSaveTopography = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingEdit(true);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          vault_room: editRoom,
          vault_cabinet: editCabinet,
          vault_drawer: editDrawer,
          vault_album: editAlbum || null,
          vault_envelope: editEnvelope || null,
          vault_notes: editNotes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar topografía');

      // Update local list
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                vault_room: editRoom,
                vault_cabinet: editCabinet,
                vault_drawer: editDrawer,
                vault_album: editAlbum,
                vault_envelope: editEnvelope,
                vault_notes: editNotes,
              }
            : item
        )
      );

      setSuccessMessage(`Topografía de '${editingProduct.catalog_code}' actualizada en bóveda.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setEditingProduct(null);
    } catch (err: any) {
      alert(err.message || 'Error al guardar ubicación');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Trigger Print
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      alert('Por favor seleccione al menos una pieza filatélica para imprimir.');
      return;
    }
    window.print();
  };

  // Selected items to render
  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedIds.includes(p.id));
  }, [products, selectedIds]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. NON-PRINTABLE DASHBOARD CONTROLS (HIDDEN DURING window.print()) */}
      {/* ========================================================================= */}
      <div className="print:hidden space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#102542] border border-amber-500/30 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#102542] border border-white/10 flex items-center justify-center text-amber-200 shadow-lg shadow-black/40">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-widest bg-white/[0.08] text-amber-200 border border-white/10">
                  Logística & Bóveda Filatélica
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Etiquetado Físico & QR de Alta Densidad
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white font-serif tracking-wide mt-1">
                Generador de Fichas & Rótulos con QR para Almacén
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Genere e imprima fichas técnicas para sobres de glassine, etiquetas frontales de gavetas y hojas de corte A4 con códigos QR vinculados a la base de datos de bóveda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Imprimir Fichas ({selectedIds.length})</span>
            </button>

            <button
              onClick={fetchProducts}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#102542] hover:bg-[#2C63AC] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-md"
              title="Refrescar catálogo"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => openLoginModal()}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold cursor-pointer"
            >
              Identificarse
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Format Selector & QR Destination Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card Format Selector */}
          <div className="bg-[#0F233E] border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" /> Formato de Impresión / Salida:
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCardFormat('CARD_GLASSINE')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  cardFormat === 'CARD_GLASSINE'
                    ? 'bg-[#102542] border-white/10 text-white shadow-sm'
                    : 'bg-[#0B1A2D] border-slate-800 text-slate-400 hover:text-white hover:bg-[#102542]/40'
                }`}
              >
                <div className="font-bold text-xs">Ficha Sobre Glassine</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  85 × 55 mm • Inserto vertical técnico con especificaciones completas
                </div>
              </button>

              <button
                onClick={() => setCardFormat('LABEL_DRAWER')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  cardFormat === 'LABEL_DRAWER'
                    ? 'bg-[#102542] border-white/10 text-white shadow-sm'
                    : 'bg-[#0B1A2D] border-slate-800 text-slate-400 hover:text-white hover:bg-[#102542]/40'
                }`}
              >
                <div className="font-bold text-xs">Rótulo de Gaveta</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  75 × 45 mm • Tipografía gigante de bóveda y código QR frontal
                </div>
              </button>

              <button
                onClick={() => setCardFormat('SHEET_A4')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  cardFormat === 'SHEET_A4'
                    ? 'bg-[#102542] border-white/10 text-white shadow-sm'
                    : 'bg-[#0B1A2D] border-slate-800 text-slate-400 hover:text-white hover:bg-[#102542]/40'
                }`}
              >
                <div className="font-bold text-xs">Pliego A4 (8 Fichas)</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Rejilla 2x4 con guías punteadas para corte con guillotina
                </div>
              </button>
            </div>
          </div>

          {/* QR Destination Selector */}
          <div className="bg-[#0F233E] border border-slate-800 p-5 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cyan-400" /> Destino del Escaneo QR:
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setQrTarget('CATALOG')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  qrTarget === 'CATALOG'
                    ? 'bg-[#102542] border-white/10 text-white shadow-sm'
                    : 'bg-[#0B1A2D] border-slate-800 text-slate-400 hover:text-white hover:bg-[#102542]/40'
                }`}
              >
                <div className="font-bold text-xs">Catálogo Público</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Abre la ficha interactiva del coleccionista con lupa 10x
                </div>
              </button>

              <button
                onClick={() => setQrTarget('ADMIN')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  qrTarget === 'ADMIN'
                    ? 'bg-[#102542] border-white/10 text-white shadow-sm'
                    : 'bg-[#0B1A2D] border-slate-800 text-slate-400 hover:text-white hover:bg-[#102542]/40'
                }`}
              >
                <div className="font-bold text-xs">Bóveda Administrativa</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Acceso directo a edición de stock y acta de custodia
                </div>
              </button>

              <button
                onClick={() => setQrTarget('TECHNICAL')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  qrTarget === 'TECHNICAL'
                    ? 'bg-[#102542] border-white/10 text-white shadow-sm'
                    : 'bg-[#0B1A2D] border-slate-800 text-slate-400 hover:text-white hover:bg-[#102542]/40'
                }`}
              >
                <div className="font-bold text-xs">Cripto-Ficha Offline</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Cadena de texto estructurada legible sin conexión a internet
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Search, Filter & Bulk Selection Toolbar */}
        <div className="bg-[#0D2039] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por código (ej. SCOTT-BO-1866-C1), nombre, gaveta o álbum..."
                className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0B1A2D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Drawer Filter */}
            <select
              value={drawerFilter}
              onChange={(e) => setDrawerFilter(e.target.value)}
              className="bg-[#0B1A2D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">Todas las Gavetas</option>
              {drawers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Selection Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAllFiltered}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#163359] hover:bg-[#102542] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>
                {filteredProducts.every((p) => selectedIds.includes(p.id)) && filteredProducts.length > 0
                  ? 'Deseleccionar Mostrados'
                  : 'Seleccionar Mostrados'}
              </span>
            </button>

            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
              {selectedIds.length} seleccionados
            </span>
          </div>
        </div>

        {/* Interactive Stamp Selection Strip (Horizontal Accordion / Grid) */}
        <div className="bg-[#0B1A2D] border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Piezas en Almacén ({filteredProducts.length}) — Haga clic para marcar/desmarcar para impresión:
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Topografía física en Bóveda Central
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const isSelected = selectedIds.includes(p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => handleToggleSelect(p.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative group flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
                      : 'bg-[#0D2039] border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100 hover:bg-[#102542]/30'
                  }`}
                >
                  {/* Stamp Thumbnail */}
                  {p.front_image ? (
                    <img
                      src={p.front_image}
                      alt={p.name}
                      className="w-12 h-12 object-contain rounded bg-black/40 border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-[#102542] flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                      BO
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-300 truncate">
                        {p.catalog_code}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </div>
                    <div className="text-xs font-bold text-white truncate mt-0.5">{p.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {p.vault_drawer || 'Sin gaveta'} • {p.vault_envelope || 'Sin sobre'}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                      Stock: {p.stock} un. • Bs. {Number(p.price).toFixed(2)}
                    </div>
                  </div>

                  {/* Edit Location Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(p);
                    }}
                    className="absolute bottom-2 right-2 p-1 rounded-md bg-[#102542] hover:bg-amber-400 hover:text-slate-950 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Editar ubicación en bóveda"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Print Preview Banner */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Vista Previa de Impresión ({selectedProducts.length} fichas generadas)
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Mandar a Impresora</span>
          </button>
        </div>
      </div>

      {/* Global CSS for Paper Printing */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm 8mm 10mm 8mm !important;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            aside, header, nav, footer, .print-hidden, .print\\:hidden {
              display: none !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              background: #ffffff !important;
              overflow: visible !important;
            }
            #printable-canvas {
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-cards-grid {
              display: grid !important;
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              column-gap: 5mm !important;
              row-gap: 5mm !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-card-box {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              border-color: #000000 !important;
              box-shadow: none !important;
            }
          }
        `,
        }}
      />

      {/* ========================================================================= */}
      {/* 2. PRINTABLE CANVAS & LIVE PREVIEW (SHOWN IN BROWSER AND ON PAPER) */}
      {/* ========================================================================= */}
      <div id="printable-canvas" className="space-y-6 print:m-0 print:p-0 print:w-full">
        {selectedProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-[#0B1A2D] border border-slate-800 rounded-2xl">
            <QrCode className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-300">No hay piezas seleccionadas</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Seleccione una o varias piezas filatélicas en el panel superior para generar sus fichas con código QR.
            </p>
          </div>
        ) : (
          <div
            className={`print-cards-grid print:m-0 print:p-0 ${
              cardFormat === 'SHEET_A4'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                : cardFormat === 'LABEL_DRAWER'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            }`}
          >
            {selectedProducts.map((stamp) => {
              const qrImg = qrCodes[stamp.id];

              return (
                <div
                  key={stamp.id}
                  className="print-card-box break-inside-avoid page-break-inside-avoid transition-all"
                >
                  {/* ============================================================= */}
                  {/* FORMAT A: FICHA TÉCNICA PARA SOBRE GLASSINE (85 × 55 mm) */}
                  {/* ============================================================= */}
                  {cardFormat === 'CARD_GLASSINE' && (
                    <div className="bg-white text-slate-900 border-2 border-slate-900 rounded-xl p-3.5 shadow-xl print:shadow-none print:border-black print:p-3 relative overflow-hidden flex flex-col justify-between min-h-[210px] print:min-h-[58mm]">
                      {/* Top Bolivian Philatelic Header */}
                      <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-6 rounded-sm bg-gradient-to-b from-[#D52B1E] via-[#FCD116] to-[#007934] shrink-0 border border-slate-400 print:border-black" />
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-wider text-[#102542] print:text-black leading-tight">
                              ESTADO PLURINACIONAL DE BOLIVIA
                            </div>
                            <div className="text-[7.5px] font-bold text-slate-600 print:text-black tracking-tight leading-none mt-0.5">
                              DIRECCIÓN GENERAL DE FILATELIA • FICHA DE BÓVEDA
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block px-1.5 py-0.2 rounded text-[8px] font-mono font-black bg-slate-100 text-slate-900 border border-slate-900 print:border-black print:bg-white print:text-black">
                            {stamp.condition || 'MINT_NH'}
                          </span>
                        </div>
                      </div>

                      {/* Main Body */}
                      <div className="py-2 flex items-start gap-3 flex-1">
                        {/* QR Code */}
                        <div className="shrink-0 text-center">
                          {qrImg ? (
                            <img
                              src={qrImg}
                              alt={`QR ${stamp.catalog_code}`}
                              className="w-20 h-20 border border-slate-900 print:border-black rounded p-0.5 bg-white mx-auto block"
                            />
                          ) : (
                            <div className="w-20 h-20 border border-slate-400 flex items-center justify-center text-[9px] text-slate-400">
                              Generando QR...
                            </div>
                          )}
                          <div className="text-[7px] font-mono text-slate-600 print:text-black mt-1 font-bold tracking-wider">
                            ESCANEABLE
                          </div>
                        </div>

                        {/* Philatelic Data */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div>
                            <div className="text-[11px] font-black font-mono text-[#102542] print:text-black leading-tight">
                              {stamp.catalog_code}
                            </div>
                            <div className="text-[10px] font-bold text-slate-950 leading-tight mt-0.5 line-clamp-2">
                              {stamp.name}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8.5px] font-sans pt-0.5 border-t border-slate-200 print:border-slate-300">
                            <div>
                              <span className="text-slate-600 print:text-black font-semibold">Año: </span>
                              <strong className="text-slate-950">{stamp.year}</strong>
                            </div>
                            <div>
                              <span className="text-slate-600 print:text-black font-semibold">Facial: </span>
                              <strong className="text-slate-950">{stamp.face_value || 'S/V'}</strong>
                            </div>
                            <div>
                              <span className="text-slate-600 print:text-black font-semibold">Dentado: </span>
                              <strong className="text-slate-950">{stamp.perforation || 'S/D'}</strong>
                            </div>
                            <div>
                              <span className="text-slate-600 print:text-black font-semibold">Stock: </span>
                              <strong className="text-slate-950">{stamp.stock} un.</strong>
                            </div>
                          </div>

                          <div className="text-[8px] text-slate-700 print:text-black leading-tight pt-0.5 line-clamp-1">
                            <span className="font-semibold">Papel: </span>
                            <span>{stamp.paper_type || 'Estándar filatélico'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Topography Ribbon */}
                      <div className="border-t border-slate-300 print:border-black pt-1 flex items-center justify-between text-[8px] font-mono bg-slate-50 print:bg-slate-100/60 -mx-3.5 -mb-3.5 px-3 py-1 rounded-b-lg border-t">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0 pr-2">
                          <span className="font-bold text-slate-950">GAVETA:</span>
                          <span className="bg-white px-1 py-0.2 rounded border border-slate-300 print:border-black font-semibold text-slate-900">{stamp.vault_drawer || 'G-01'}</span>
                          <span className="font-bold text-slate-950 ml-1">SOBRE:</span>
                          <span className="bg-white px-1 py-0.2 rounded border border-slate-300 print:border-black font-semibold text-slate-900">{stamp.vault_envelope || '#001'}</span>
                        </div>
                        <div className="shrink-0 text-right font-black text-[9.5px] text-[#102542] print:text-black font-mono">
                          Bs. {Number(stamp.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================= */}
                  {/* FORMAT B: RÓTULO FRONTAL DE GAVETA / CLASIFICADOR (75 × 45 mm) */}
                  {/* ============================================================= */}
                  {cardFormat === 'LABEL_DRAWER' && (
                    <div className="bg-white text-slate-900 border-2 border-slate-900 rounded-xl p-3.5 shadow-xl print:shadow-none print:border-black flex items-center justify-between gap-3 min-h-[135px]">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-950 text-white print:bg-black">
                            {stamp.vault_room || 'BÓVEDA CENTRAL A'}
                          </span>
                          <span className="text-[8px] font-mono font-bold text-slate-700">
                            {stamp.vault_cabinet || 'ARM. 01'}
                          </span>
                        </div>

                        <div className="text-sm font-black font-mono text-slate-950 tracking-tight leading-tight mt-1">
                          {stamp.vault_drawer || 'GAVETA GENERAL'}
                        </div>

                        <div className="text-[10px] font-bold text-[#102542] print:text-black line-clamp-2">
                          [{stamp.catalog_code}] {stamp.name}
                        </div>

                        <div className="text-[8px] text-slate-700 print:text-black font-mono">
                          {stamp.vault_album ? `Álbum: ${stamp.vault_album}` : 'Gaveta Estándar'} • Sobre {stamp.vault_envelope || '#001'}
                        </div>

                        <div className="text-[7.5px] text-slate-500 print:text-black italic line-clamp-1">
                          {stamp.vault_notes || 'Custodia permanente con control de humedad.'}
                        </div>
                      </div>

                      {/* QR on right */}
                      <div className="shrink-0 text-center">
                        {qrImg ? (
                          <img
                            src={qrImg}
                            alt={`QR ${stamp.catalog_code}`}
                            className="w-18 h-18 border-2 border-slate-900 print:border-black rounded p-0.5 bg-white mx-auto block"
                          />
                        ) : null}
                        <div className="text-[7px] font-mono font-bold text-slate-700 print:text-black mt-1">
                          SCAN BÓVEDA
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================= */}
                  {/* FORMAT C: PLIEGO A4 CON GUÍAS DE CORTE PUNTEADAS */}
                  {/* ============================================================= */}
                  {cardFormat === 'SHEET_A4' && (
                    <div className="bg-white text-slate-900 border-2 border-dashed border-slate-500 print:border-black p-3 rounded-lg relative overflow-hidden flex flex-col justify-between min-h-[175px] print:min-h-[58mm]">
                      {/* Corner Scissors Icons / Guides */}
                      <div className="text-[7px] text-slate-500 print:text-black uppercase font-mono tracking-widest absolute top-1 right-2">
                        ✂ LÍNEA DE CORTE
                      </div>

                      <div>
                        <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-3.5 rounded-sm bg-gradient-to-b from-[#D52B1E] via-[#FCD116] to-[#007934] shrink-0 border border-slate-400 print:border-black" />
                            <span className="text-[8.5px] font-black text-[#102542] print:text-black">
                              FILATELIA BOLIVIANA • BÓVEDA OFICIAL
                            </span>
                          </div>
                          <span className="text-[8px] font-mono font-bold text-slate-900 bg-slate-100 px-1 py-0.2 rounded border border-slate-300">
                            {stamp.condition}
                          </span>
                        </div>

                        <div className="flex items-start gap-2.5 mt-2">
                          {qrImg && (
                            <img
                              src={qrImg}
                              alt="QR"
                              className="w-16 h-16 border border-slate-900 print:border-black rounded p-0.5 shrink-0 block bg-white"
                            />
                          )}

                          <div className="min-w-0 space-y-0.5 flex-1">
                            <div className="text-[10.5px] font-black font-mono text-slate-950">
                              {stamp.catalog_code}
                            </div>
                            <div className="text-[9.5px] font-bold text-slate-900 line-clamp-2 leading-tight">
                              {stamp.name}
                            </div>
                            <div className="text-[8px] text-slate-700">
                              Año: <strong>{stamp.year}</strong> • Facial: <strong>{stamp.face_value || 'S/V'}</strong>
                            </div>
                            <div className="text-[8px] font-mono text-slate-900">
                              Cotización: <strong>Bs. {Number(stamp.price).toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-300 pt-1 text-[7.5px] font-mono text-slate-700 flex items-center justify-between">
                        <span>
                          <strong>Gaveta:</strong> {stamp.vault_drawer || 'G-01'} • <strong>Sobre:</strong> {stamp.vault_envelope || '#001'}
                        </span>
                        <span className="font-bold text-slate-950">Stock: {stamp.stock} piezas</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: EDITAR TOPOGRAFÍA DE BÓVEDA (UBICACIÓN FÍSICA) */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:hidden animate-fadeIn">
          <div className="bg-[#0E223C] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-[#102542] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-amber-200/90">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-serif tracking-wide">
                    Topografía de Almacén & Bóveda
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    [{editingProduct.catalog_code}] {editingProduct.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopography} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Bóveda / Sala:
                  </label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    required
                    placeholder="Ej. Bóveda Central A"
                    className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Armario / Mueble:
                  </label>
                  <input
                    type="text"
                    value={editCabinet}
                    onChange={(e) => setEditCabinet(e.target.value)}
                    required
                    placeholder="Ej. Armario Ignífugo 01"
                    className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Gaveta / Bandeja:
                  </label>
                  <input
                    type="text"
                    value={editDrawer}
                    onChange={(e) => setEditDrawer(e.target.value)}
                    required
                    placeholder="Ej. Gaveta G-01 (Clásicos)"
                    className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold text-amber-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Álbum / Clasificador:
                  </label>
                  <input
                    type="text"
                    value={editAlbum}
                    onChange={(e) => setEditAlbum(e.target.value)}
                    placeholder="Ej. Álbum Lindner Tomo I"
                    className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Sobre Glassine / Posición:
                </label>
                <input
                  type="text"
                  value={editEnvelope}
                  onChange={(e) => setEditEnvelope(e.target.value)}
                  placeholder="Ej. Sobre Acid-Free #014"
                  className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Notas de Conservación & Climatización:
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Humedad relativa, gel de sílice, temperatura recomendada..."
                  className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Topografía</span>
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
