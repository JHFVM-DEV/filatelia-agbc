'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/config/api';
import { readAdminResponse } from '@/lib/admin-api';

type Ranking = { name?: string; path?: string; views: number; sessions: number; code?: string };
interface Metrics {
  period: { from: string; to: string }; tracking_since: string | null; last_visit: string | null;
  totals: { page_views: number; sessions: number }; kpis: Record<string, number | null>; funnel: Record<string, number>;
  pages: Ranking[]; categories: Ranking[]; products: Ranking[];
  timeline: { date: string; views: number; sessions: number }[];
  referrers: { referrer_host: string | null; views: number }[];
  devices: { device: string; views: number }[]; languages: { language: string | null; views: number }[];
  recent_visits: { path: string; device: string; occurred_at: string; referrer_host: string | null }[];
}
const number = (value: number | null | undefined) => Number(value ?? 0).toLocaleString('es-BO', { maximumFractionDigits: 2 });
const timestamp = (value: string | null) => value ? new Date(/[Zz]|[+-]\d\d:\d\d$/.test(value) ? value : value.replace(' ', 'T') + 'Z').toLocaleString('es-BO', { timeZone: 'America/La_Paz' }) : 'Sin visitas registradas';
const date = (days = 0) => { const today = new Date(); today.setDate(today.getDate() - days); return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit' }).format(today); };
const panel = 'rounded-2xl border border-white/10 bg-[#102542] p-5';

function RankingTable({ title, rows }: { title: string; rows: Ranking[] }) {
  return <section className={panel}><h2 className="mb-4 text-lg font-semibold">{title}</h2>{!rows.length ? <p className="text-slate-400">Todavía no hay consultas en este período.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-slate-400"><tr><th className="pb-3">Destino</th><th className="px-3 pb-3 text-right">Consultas</th><th className="pb-3 text-right">Sesiones</th></tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-t border-white/10"><td className="py-3">{row.name ?? row.path}{row.code && <span className="block text-xs text-slate-400">{row.code}</span>}</td><td className="px-3 text-right text-[#FECC36]">{number(row.views)}</td><td className="text-right">{number(row.sessions)}</td></tr>)}</tbody></table></div>}</section>;
}

export default function MetricsPage() {
  const [from, setFrom] = useState(() => date(29)); const [to, setTo] = useState(() => date());
  const [range, setRange] = useState({ from, to }); const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<Metrics | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('filatelia_token');
        if (!token) throw new Error('Inicia sesión para consultar las métricas.');
        const response = await fetch(`${API_BASE_URL}/api/admin/analytics?${new URLSearchParams(range)}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: controller.signal });
        const result = await readAdminResponse(response);
        if (!controller.signal.aborted) setData(result.data);
      } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'No se pudieron cargar las métricas.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [range, refresh]);
  function exportCsv() {
    if (!data) return;
    const rows: (string | number)[][] = [['Período', data.period.from, data.period.to], ['Indicador', 'Valor'], ...Object.entries(data.kpis).map(([key, value]) => [key, value ?? 'Sin comparación']), ['Fecha', 'Páginas vistas', 'Sesiones'], ...data.timeline.map(row => [row.date, row.views, row.sessions]), ['Destino', 'Consultas', 'Sesiones'], ...[...data.pages, ...data.categories, ...data.products].map(row => [row.name ?? row.path ?? '', row.views, row.sessions])];
    const csv = '\uFEFF' + rows.map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""').replace(/^[=+@-]/, "'") + '"').join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = `metricas-${data.period.from}-${data.period.to}.csv`; link.click(); URL.revokeObjectURL(url);
  }
  const k = data?.kpis ?? {}; const peak = Math.max(1, ...data?.timeline.map(row => row.views) ?? []);
  const cards = [['Visitas (sesiones)', number(k.sessions)], ['Páginas vistas', number(k.page_views)], ['Navegadores únicos', number(k.unique_browsers)], ['Actividad en últimos 5 minutos', number(k.active_sessions)], ['Conversión a pedido', number(k.conversion_percent) + '%'], ['Pedidos no cancelados', number(k.orders)], ['Valor de pedidos', 'Bs. ' + number(k.order_value)], ['Valor con pago verificado', 'Bs. ' + number(k.verified_order_value)], ['Clientes nuevos', number(k.new_customers)], ['Páginas por sesión', number(k.pages_per_session)], ['Sesiones de una página', number(k.single_page_sessions_percent) + '%'], ['Duración observada promedio', number(k.average_observed_session_seconds) + ' s']];
  return <div className="space-y-6 p-4 text-slate-100 sm:p-8">
    <header><h1 className="text-2xl font-bold sm:text-3xl">Métricas web y negocio</h1><p className="mt-2 text-slate-400">Conoce el interés de los coleccionistas y el resultado comercial del catálogo.</p></header>
    <form className={`${panel} flex flex-wrap items-end gap-3`} onSubmit={event => { event.preventDefault(); setRange({ from, to }); setRefresh(value => value + 1); }}>
      <label className="text-sm">Desde<input required type="date" value={from} max={to} onChange={event => setFrom(event.target.value)} className="mt-1 block rounded-lg bg-slate-950 p-2 [color-scheme:dark]" /></label>
      <label className="text-sm">Hasta<input required type="date" value={to} min={from} onChange={event => setTo(event.target.value)} className="mt-1 block rounded-lg bg-slate-950 p-2 [color-scheme:dark]" /></label>
      <button className="rounded-lg bg-[#FECC36] px-4 py-2 font-semibold text-[#102542]">Consultar</button>
      {[7, 30, 90].map(days => <button key={days} type="button" onClick={() => { const next = { from: date(days - 1), to: date() }; setFrom(next.from); setTo(next.to); setRange(next); }} className="rounded-lg border border-white/20 px-3 py-2">{days} días</button>)}
      <button type="button" disabled={!data || loading || !!error} onClick={exportCsv} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40">Exportar CSV</button>
    </form>
    {error && <div role="alert" className="rounded-lg bg-red-950 p-4">{error}<button onClick={() => setRefresh(value => value + 1)} className="ml-3 underline">Reintentar</button></div>}
    {loading && <p role="status">Cargando métricas…</p>}
    {data && !loading && !error && <>
      <div className={`${panel} text-sm text-slate-300`}><p>Última visita al sitio: <strong className="text-white">{timestamp(data.last_visit)}</strong></p><p className="mt-2">Acumulado desde el inicio del registro: {number(data.totals.sessions)} visitas · {number(data.totals.page_views)} páginas vistas.</p><p className="mt-2">Inicio del registro: {timestamp(data.tracking_since)} · Horario de Bolivia.</p><p className="mt-2">Variación de páginas vistas frente al período anterior: {k.views_change_percent === null ? 'Sin datos anteriores para comparar' : number(k.views_change_percent) + '%'}.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <div key={label} className={panel}><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-[#FECC36]">{value}</p></div>)}</div>
      <section className={panel}><h2 className="text-lg font-semibold">Evolución diaria · páginas vistas</h2><div className="mt-5 overflow-x-auto"><div className="flex h-48 items-end gap-1" style={{ minWidth: data.timeline.length * 14 }}>{data.timeline.map(row => <div key={row.date} className="group relative flex h-full flex-1 items-end" title={`${row.date}: ${row.views} páginas, ${row.sessions} sesiones`}><div className="w-full rounded-t bg-[#FECC36]" style={{ height: `${row.views / peak * 100}%`, minHeight: row.views ? 3 : 0 }} /><span className="sr-only">{row.date}: {row.views} páginas, {row.sessions} sesiones</span></div>)}</div></div><div className="mt-2 flex justify-between text-xs text-slate-400"><span>{data.period.from}</span><span>{data.period.to}</span></div></section>
      <div className="grid gap-5 xl:grid-cols-3"><RankingTable title="Páginas más visitadas" rows={data.pages} /><RankingTable title="Categorías más consultadas" rows={data.categories} /><RankingTable title="Sellos más visitados" rows={data.products} /></div>
      <section className={panel}><h2 className="text-lg font-semibold">Recorrido de compra · sesiones</h2><div className="mt-4 grid gap-3 sm:grid-cols-5">{Object.entries({ 'Visitan el sitio': data.funnel.sessions, 'Consultan una ficha': data.funnel.product_sessions, 'Agregan al carrito': data.funnel.cart_sessions, 'Inician compra': data.funnel.checkout_sessions, 'Crean un pedido': data.funnel.order_sessions }).map(([label, value]) => <div key={label} className="rounded-lg bg-slate-950 p-3"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-xl text-[#FECC36]">{number(value)}</p></div>)}</div><p className="mt-3 text-xs text-slate-400">Cada etapa cuenta sesiones únicas con esa acción; no exige que sucedan en orden. Crear un pedido no equivale a confirmar su pago.</p></section>
      <div className="grid gap-5 lg:grid-cols-3">{[{ title: 'Origen de las visitas', rows: data.referrers.map(row => ({ label: row.referrer_host ?? 'Directo / sin referencia', views: row.views })) }, { title: 'Dispositivos', rows: data.devices.map(row => ({ label: ({ desktop: 'Computadora', mobile: 'Móvil', tablet: 'Tableta', unknown: 'Desconocido' } as Record<string, string>)[row.device] ?? row.device, views: row.views })) }, { title: 'Idioma del navegador', rows: data.languages.map(row => ({ label: row.language ?? 'Desconocido', views: row.views })) }].map(group => <section key={group.title} className={panel}><h2 className="mb-4 font-semibold">{group.title}</h2>{!group.rows.length && <p className="text-slate-400">Sin datos.</p>}{group.rows.map(row => <div key={row.label} className="flex justify-between gap-3 border-t border-white/10 py-3 text-sm"><span className="break-all">{row.label}</span><span>{number(row.views)} páginas</span></div>)}</section>)}</div>
      <section className={panel}><h2 className="mb-4 text-lg font-semibold">Últimas visitas del período</h2>{data.recent_visits.map((row, i) => <div key={i} className="flex flex-wrap justify-between gap-2 border-t border-white/10 py-3 text-sm"><span>{row.path}</span><span className="text-slate-400">{timestamp(row.occurred_at)}</span></div>)}{!data.recent_visits.length && <p className="text-slate-400">Sin visitas registradas.</p>}</section>
      <p className="text-sm text-slate-400">Las métricas comienzan con esta actualización. Una sesión termina tras 30 minutos de inactividad. Navegadores únicos no equivalen a personas. La duración observada mide el tiempo entre acciones registradas. Se excluyen las páginas administrativas y los navegadores que solicitan no ser rastreados.</p>
    </>}
  </div>;
}
