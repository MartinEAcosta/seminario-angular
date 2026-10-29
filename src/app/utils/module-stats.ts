import { ModulePopulated } from '@module/models/module.interfaces';

export interface ModuleStats {
    moduleCount           : number;
    lessonCount           : number;
    // null cuando algún lesson no trae duration_minutes — mostrar un total
    // que ignora esas lecciones sería un número falso, no una estimación.
    totalDurationMinutes  : number | null;
}

export function computeModuleStats( modules: ModulePopulated[] ) : ModuleStats {
    const lessons = modules.flatMap( module => module.lessons );
    const hasUnknownDuration = lessons.some( lesson => lesson.duration_minutes == null );

    return {
        moduleCount: modules.length,
        lessonCount: lessons.length,
        totalDurationMinutes: hasUnknownDuration
            ? null
            : lessons.reduce( ( total, lesson ) => total + ( lesson.duration_minutes ?? 0 ), 0 ),
    };
}

export function formatDuration( minutes: number | null ) : string | null {
    if ( minutes == null ) return null;

    const hours = Math.floor( minutes / 60 );
    const remainingMinutes = minutes % 60;

    if ( hours === 0 ) return `${remainingMinutes}min`;
    if ( remainingMinutes === 0 ) return `${hours}h`;

    return `${hours}h ${remainingMinutes}min`;
}
