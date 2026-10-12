export interface ProductImages {
  front: File | null;
  back: File | null;
}

export function productFormData(fields: Record<string, string | number | boolean | null | undefined>, images: ProductImages, updating = false): FormData {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) body.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
  }
  if (images.front) body.append('front_image_file', images.front);
  if (images.back) body.append('back_image_file', images.back);
  if (updating) body.append('_method', 'PUT');
  return body;
}
