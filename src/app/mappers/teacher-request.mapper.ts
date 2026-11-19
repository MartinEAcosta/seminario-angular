import { FormGroup } from '@angular/forms';

import { ApiResponse } from '@shared/models/api.interfaces';
import { TeacherRequest } from '@teacher-request/models/teacher-request.interface';
import { TeacherRequestResponseDto } from '@teacher-request/models/teacher-request.response';
import { TeacherRequestDTO } from '@teacher-request/models/teacher-request.request';

export class TeacherRequestMapper {

    // El body se arma acá y no en el componente. Dos detalles que vinieron tal cual:
    // `experienceLevel` sale del form como `TeacherExperienceLevel | null` y es el
    // `valid` del formulario el que garantiza que no sea null, y `portfolioUrl` se
    // omite cuando quedó vacío para no mandarle un string vacío al backend.
    static mapFormToTeacherRequestDTO = ( form : FormGroup ) : TeacherRequestDTO => {
        const { portfolioUrl , experienceLevel , ...rest } = form.getRawValue();
        return {
            ...rest,
            experienceLevel : experienceLevel!,
            ...( portfolioUrl ? { portfolioUrl } : {} ),
        };
    }

    static mapResponseToTeacherRequest = ( response : TeacherRequestResponseDto ) : TeacherRequest => {
        return {
            id              : response.id,
            status          : response.status,
            categoryIds     : response.category_ids,
            aboutYou        : response.about_you,
            experienceLevel : response.experience_level,
            courseTitle     : response.course_title,
            courseSummary   : response.course_summary,
            portfolioUrl    : response.portfolio_url ?? null,
            rejectionReason : response.rejection_reason ?? null,
            createdAt       : new Date( response.created_at ),
            reviewedAt      : response.reviewed_at ? new Date( response.reviewed_at ) : null,
        };
    }

    static mapApiResponseToTeacherRequest = ( response : ApiResponse<TeacherRequestResponseDto> ) : TeacherRequest => {
        return this.mapResponseToTeacherRequest( response.data );
    }

}
