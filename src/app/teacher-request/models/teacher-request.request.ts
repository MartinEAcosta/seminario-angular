// Forma que esta app le manda al backend para teacher-request. Un tipo de este
// archivo se importa sólo para anotar un borde — el `output<TeacherRequestDTO>()`
// del formulario, el handler de la página, la firma del servicio. Construir el
// body es del mapper (`TeacherRequestMapper.mapFormToTeacherRequestDTO`), nunca
// del componente.
//
// `experienceLevel` es la misma unión que el modelo interno: se importa de
// `teacher-request.interface` para que exista una sola fuente.

import { TeacherExperienceLevel } from './teacher-request.interface';

export interface TeacherRequestDTO {
    categoryIds     : string[];
    aboutYou        : string;
    experienceLevel : TeacherExperienceLevel;
    courseTitle     : string;
    courseSummary   : string;
    portfolioUrl   ?: string;
}
