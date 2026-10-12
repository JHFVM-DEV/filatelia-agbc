<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductImageStorage
{
    public function store(Request $request, array $data, array &$storedPaths): array
    {
        foreach (['front_image', 'back_image'] as $field) {
            unset($data[$field . '_file']);
            if (!$request->hasFile($field . '_file')) continue;
            $path = $request->file($field . '_file')->store('product-images', 'public');
            if (!$path) {
                throw ValidationException::withMessages([$field . '_file' => 'No se pudo guardar la imagen. Revisa el almacenamiento del servidor.']);
            }
            $storedPaths[] = $path;
            $data[$field] = '/storage/' . $path;
        }
        return $data;
    }

    public function cleanup(array $paths): void
    {
        Storage::disk('public')->delete($paths);
    }
}
