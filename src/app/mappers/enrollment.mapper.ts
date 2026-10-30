import { Enrollment, EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';
import { ApiResponse, EnrollmentPopulatedResponseDto, EnrollmentResponseDto } from '@shared/models/api.interfaces';


export class EnrollmentMapper {

    static mapResponseToEnrollment ( response : EnrollmentResponseDto ) : Enrollment {
        return {
            id : response.id,
            id_user : response.id_user,
            id_course : response.id_course,
            purchaseDate : new Date( response.purchaseDate ),
            progress : response.progress,
            completed_lessons : response.completed_lessons,
            last_accessed_at : new Date( response.last_accessed_at ),
        };
    }

    static mapResponseToEnrollmentArray ( response : ApiResponse<EnrollmentResponseDto[]> ) : Enrollment[] {
        return response.data.map( this.mapResponseToEnrollment );
    }

    static mapResponseToEnrollmentDetailed ( response : EnrollmentPopulatedResponseDto ) : EnrollmentDetailed {
        return{
            id : response.id,
            id_user : response.id_user,
            course : {
                id_course : response.course._id,
                title : response.course.title,
                id_owner : response.course.id_owner,
                category_name : response.course.category_name,
                thumbnail_url : response.course.thumbnail_url,
            },
            purchaseDate : new Date( response.purchaseDate ),
            progress : response.progress,
            completed_lessons : response.completed_lessons,
            last_accessed_at : new Date( response.last_accessed_at ),
        };
    }

    static mapResponseToEnrollmentDetailedArray ( response : ApiResponse<EnrollmentPopulatedResponseDto[]> ) : EnrollmentDetailed[] {
        return response.data.map( this.mapResponseToEnrollmentDetailed );
    }
}