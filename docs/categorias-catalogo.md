# Categorías del catálogo

Las categorías administradas en `/admin/categorias` son la fuente de los filtros
de `/catalogo` y de las tarjetas de categorías de la portada. Se utilizan sus
nombres, slugs y orden del administrador, incluyendo categorías sin piezas.
No es necesario editar el frontend ni recompilar para agregar una categoría.

El navegador consulta `/api/categories` al abrir la página, al volver a la pestaña
y cada 30 segundos mientras está visible. El catálogo también actualiza los
productos para reflejar cambios de asignación y de slug. Si desaparece la categoría
seleccionada, muestra todo el catálogo. Ante un fallo de conexión se conserva la
última lista cargada y se muestra un mensaje mientras se reintenta.

Laravel invalida la caché pública cuando se crea, edita o elimina una categoría;
también actualiza los conteos cuando cambian las piezas. Se conserva la protección
existente: una categoría con piezas no se puede eliminar hasta reasignarlas.

Para verificar: crear una categoría vacía, abrir el catálogo y comprobar que
aparece con el nombre y orden elegidos; asignar una pieza y filtrarla; cambiar
nombre y slug; reasignar sus piezas, eliminarla y comprobar que desaparece del
catálogo y la portada. Volver a la pestaña actualiza la lista sin esperar el ciclo.
