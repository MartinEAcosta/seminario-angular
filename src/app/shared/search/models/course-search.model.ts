
export interface PriceRange{
    min?: number;
    max?: number;
}
export interface CourseSearchQuery {
    title?: string;
    categoryId?: string;
    price?: PriceRange;
    onlyWithSpots?: boolean;
    page: number;
    // Cuántos cursos pide la página actual. Obligatorio como `page`: el mapper
    // siempre lo resuelve (de la URL o del default), así nadie tiene que
    // inventar un fallback río abajo.
    limit: number;
}
