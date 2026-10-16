import { Category } from '@category/models/category.interfaces';

// El backend manda un id en `id_category`; `defaultCourses` guarda ahí el
// NOMBRE de la categoría. Se resuelve por id, después por nombre, y si no
// matchea no se muestra pill: un hash crudo en la vidriera es peor que una
// etiqueta de menos.
export function resolveCategoryName(key: string | null | undefined, categories: Category[]): string | null {
  if (!key) return null;

  return categories.find((category) => category.id === key)?.name
      ?? categories.find((category) => category.name === key)?.name
      ?? null;
}
