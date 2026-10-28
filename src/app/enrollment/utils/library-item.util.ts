import { EnrollmentDetailed, EnrollmentStatus } from '@enrollment/models/enrollment.interfaces';

export interface LibraryItem {
  enrollment : EnrollmentDetailed;
  status : EnrollmentStatus;
  category_name : string;
  totalLessons : number;
  nextLessonNumber : number | null;
  nextLessonTitle : string | null;
}

export function getEnrollmentStatus ( progress : number ) : EnrollmentStatus {
  if ( progress <= 0 ) return 'not-started';
  if ( progress >= 100 ) return 'completed';
  return 'in-progress';
}

// Total de lecciones y próxima lección: el endpoint de inscripciones no los
// devuelve hoy (solo título/miniatura/progreso/categoría), y conseguirlos de
// verdad implicaría pedir el curso completo y sus módulos por cada tarjeta.
// Decisión del dueño del producto: mockear esto mientras arma un endpoint
// propio de "próxima lección" que lo resuelva en un solo viaje — cuando
// exista, esta función se reemplaza por ese mapeo real.
function hashToIndex ( key : string , length : number ) : number {
  let hash = 0;
  for ( let i = 0 ; i < key.length ; i++ ) hash = ( hash * 31 + key.charCodeAt(i) ) | 0;
  return Math.abs( hash ) % length;
}

export function toLibraryItem ( enrollment : EnrollmentDetailed ) : LibraryItem {
  const status = getEnrollmentStatus( enrollment.progress );
  const completedCount = enrollment.completed_lessons.length;

  const totalLessons = status === 'completed'
    ? completedCount
    : status === 'in-progress'
      ? Math.round( completedCount / ( enrollment.progress / 100 ) )
      : 4 + hashToIndex( enrollment.course.id_course , 9 ); // "sin empezar": sin dato real, placeholder estable por curso

  return {
    enrollment,
    status,
    category_name : enrollment.course.category_name,
    totalLessons,
    nextLessonNumber : status === 'in-progress' ? completedCount + 1 : null,
    nextLessonTitle : status === 'in-progress' ? '[Título de la lección]' : null,
  };
}
