// Forma que esta app le manda al backend para lesson. Un tipo de este archivo se
// importa sólo para anotar un borde — la firma de un servicio, un `output<>()`, el
// parámetro de un handler. Construir el body es del mapper
// (`LessonMapper.mapToCreateLessonDto`), nunca del componente.

export interface SaveLessonDto{
    id            ?: string;
    id_file       ?: string;
    lesson_number ?: number;
    id_module      : string;
    title          : string;
    description    : string;
}
