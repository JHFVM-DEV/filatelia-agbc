export async function readAdminResponse(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const validation = data?.errors
      ? Object.values(data.errors).flat().join(' ')
      : '';
    throw new Error(validation || data?.message || `No se pudo completar la operación (${response.status}).`);
  }
  if (!data || data.success === false) {
    throw new Error(data?.message || 'El servidor devolvió una respuesta no válida.');
  }
  return data;
}
