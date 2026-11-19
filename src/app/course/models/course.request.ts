// Forma que esta app le manda al backend para course. Un tipo de este archivo se
// importa sólo para anotar un borde — la firma de un servicio, un `output<>()`, el
// parámetro de un handler. Construir el body es del mapper
// (`CourseMapper.mapToCourseDto`), nunca del componente.

export interface CourseDTO {
    id?           : string;
    title         : string;
    description   : string;
    id_category   : string;
    thumbnail_url ?: string;
    id_file       ?: string;
    id_owner     ?: string;
    price?        : number;
    capacity?     : number | null;
}
