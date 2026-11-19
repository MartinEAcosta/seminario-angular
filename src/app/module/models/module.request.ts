// Forma que esta app le manda al backend para module. Un tipo de este archivo se
// importa sólo para anotar un borde — la firma de un servicio, un `output<>()`, el
// parámetro de un handler. Construir el body es del mapper
// (`ModuleMapper.mapToModuleDto`), nunca del componente.

export interface ModuleDTO {
  id ?: string,
  id_course : string,
  title ?: string,
  unit ?: number,
}
