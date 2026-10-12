'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { normalizeImageUrl } from '@/config/api';
import type { ProductImages } from '@/lib/product-form';

function ImagePicker({ label, file, current, onChange, disabled }: {
  label: string; file: File | null; current?: string; onChange: (file: File | null) => void; disabled?: boolean;
}) {
  const id = useId();
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // The preview is synchronized with an external browser object URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const source = file ? preview : current ? normalizeImageUrl(current) : '';

  return <div className="space-y-2">
    <label htmlFor={id} className="block text-xs font-semibold text-slate-200">{label}</label>
    {source && <div className="relative h-36 rounded-xl border border-white/15 bg-white"><Image src={source} alt={`Vista previa: ${label}`} fill unoptimized sizes="240px" className="object-contain p-2" /></div>}
    <input id={id} key={file?.name || 'empty'} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} className="block w-full text-xs text-slate-300 file:mr-2 file:rounded-lg file:border-0 file:bg-[#FECC36] file:px-3 file:py-2 file:font-semibold file:text-[#102542]" onChange={(event) => {
      const selected = event.target.files?.[0];
      if (!selected) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) || selected.size > 2 * 1024 * 1024) {
        setError('Elige una imagen JPG, PNG o WebP de hasta 2 MB.');
        event.target.value = '';
        return;
      }
      setError(''); onChange(selected);
    }} />
    {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
    {file && <button type="button" disabled={disabled} className="text-xs text-amber-200 underline" onClick={() => { setError(''); onChange(null); }}>Cancelar selección</button>}
  </div>;
}

export function ProductImageFields({ images, onChange, frontImage, backImage, disabled }: {
  images: ProductImages; onChange: (images: ProductImages) => void; frontImage?: string; backImage?: string; disabled?: boolean;
}) {
  return <fieldset className="space-y-3 border-t border-white/10 pt-4">
    <legend className="px-1 text-sm font-bold text-white">Imágenes de la pieza</legend>
    <p className="text-xs text-slate-400">JPG, PNG o WebP, hasta 2 MB por imagen. El reverso es opcional.</p>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <ImagePicker label="Anverso (frente)" file={images.front} current={frontImage} onChange={(front) => onChange({ ...images, front })} disabled={disabled} />
      <ImagePicker label="Reverso" file={images.back} current={backImage} onChange={(back) => onChange({ ...images, back })} disabled={disabled} />
    </div>
  </fieldset>;
}
