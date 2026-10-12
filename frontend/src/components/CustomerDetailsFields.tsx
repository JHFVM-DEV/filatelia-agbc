'use client';

import { useId } from 'react';

export interface CustomerDetails {
  phone: string;
  country: string;
  department: string;
  city: string;
  shipping_address: string;
  postal_code: string;
  address_reference: string;
}

export const EMPTY_CUSTOMER_DETAILS: CustomerDetails = {
  phone: '', country: 'Bolivia', department: '', city: '', shipping_address: '', postal_code: '', address_reference: '',
};

const COUNTRIES = ['Bolivia', 'Alemania', 'Argentina', 'Australia', 'Bélgica', 'Brasil', 'Canadá', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'España', 'Estados Unidos', 'Francia', 'Guatemala', 'Honduras', 'India', 'Italia', 'Japón', 'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Portugal', 'Reino Unido', 'República Dominicana', 'Suiza', 'Uruguay', 'Venezuela'];

export function customerDetailsFromUser(user: Partial<CustomerDetails> | null | undefined): CustomerDetails {
  return Object.fromEntries(Object.entries(EMPTY_CUSTOMER_DETAILS).map(([key, fallback]) => [key, user?.[key as keyof CustomerDetails] || fallback])) as unknown as CustomerDetails;
}

export function CustomerDetailsFields({ value, onChange, required = true }: {
  value: CustomerDetails;
  onChange: (value: CustomerDetails) => void;
  required?: boolean;
}) {
  const prefix = useId();
  const inputClass = 'mt-1.5 w-full rounded-xl border border-[#E2DDD5] bg-white px-3 py-2.5 text-sm text-[#102542] focus:outline-none focus:border-[#102542] focus:ring-2 focus:ring-[#102542]/15';
  const update = (key: keyof CustomerDetails, next: string) => onChange({ ...value, [key]: next });
  const fields = [
    { key: 'phone', label: 'Teléfono de contacto', type: 'tel', autoComplete: 'tel', maxLength: 30, placeholder: 'Ej. +591 71234567', required },
    { key: 'city', label: 'Ciudad o localidad', type: 'text', autoComplete: 'address-level2', maxLength: 100, required },
    { key: 'shipping_address', label: 'Dirección de entrega', type: 'text', autoComplete: 'street-address', maxLength: 500, placeholder: 'Calle, número, zona y vivienda o departamento', required },
    { key: 'postal_code', label: 'Código postal (opcional)', type: 'text', autoComplete: 'postal-code', maxLength: 20 },
    { key: 'address_reference', label: 'Referencia de ubicación (opcional)', type: 'text', autoComplete: 'off', maxLength: 255, placeholder: 'Ej. frente a la plaza, portón azul' },
  ] as const;

  return <fieldset className="space-y-3 border-t border-[#E2DDD5] pt-4">
    <legend className="px-1 text-sm font-bold text-[#102542]">Contacto y datos de entrega</legend>
    <p className="text-xs leading-relaxed text-slate-500">Guardaremos tus datos de contacto y dirección en tu cuenta.</p>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${prefix}-country`} className="text-xs font-semibold text-[#102542]">País{required ? ' *' : ''}</label>
        <select id={`${prefix}-country`} name="country" autoComplete="country-name" required={required} value={COUNTRIES.includes(value.country) ? value.country : value.country ? 'other' : ''} onChange={(event) => onChange({ ...value, country: event.target.value === 'other' ? 'Otro país' : event.target.value, department: '' })} className={inputClass}>
          <option value="">Selecciona un país</option>
          {COUNTRIES.map((country) => <option key={country}>{country}</option>)}
          <option value="other">Otro país</option>
        </select>
        {value.country && !COUNTRIES.includes(value.country) && <>
          <label htmlFor={`${prefix}-other-country`} className="mt-3 block text-xs font-semibold text-[#102542]">Escribe el nombre del país</label>
          <input id={`${prefix}-other-country`} autoComplete="country-name" maxLength={100} required value={value.country === 'Otro país' ? '' : value.country} onChange={(event) => onChange({ ...value, country: event.target.value || 'Otro país' })} className={inputClass} />
        </>}
      </div>
      {fields.map((field) => <div key={field.key} className={field.key === 'shipping_address' || field.key === 'address_reference' ? 'sm:col-span-2' : ''}>
        <label htmlFor={`${prefix}-${field.key}`} className="text-xs font-semibold text-[#102542]">{field.label}{'required' in field && field.required ? ' *' : ''}</label>
        <input id={`${prefix}-${field.key}`} name={field.key} value={value[field.key]} onChange={(event) => update(field.key, event.target.value)} type={field.type} autoComplete={field.autoComplete} maxLength={field.maxLength} required={'required' in field && field.required} placeholder={'placeholder' in field ? field.placeholder : undefined} className={inputClass} />
      </div>)}
      <div className="sm:col-span-2">
        <label htmlFor={`${prefix}-department`} className="text-xs font-semibold text-[#102542]">{value.country === 'Bolivia' ? 'Departamento' : 'Estado, provincia o región'}{required ? ' *' : ''}</label>
        {value.country === 'Bolivia' ? <select id={`${prefix}-department`} name="department" autoComplete="address-level1" required={required} value={value.department} onChange={(event) => update('department', event.target.value)} className={inputClass}>
          <option value="">Selecciona un departamento</option>
          {['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando'].map((department) => <option key={department}>{department}</option>)}
        </select> : <input id={`${prefix}-department`} name="department" autoComplete="address-level1" maxLength={100} required={required} value={value.department} onChange={(event) => update('department', event.target.value)} className={inputClass} />}
      </div>
    </div>
  </fieldset>;
}
