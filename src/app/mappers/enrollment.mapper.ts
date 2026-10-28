import { Enrollment, EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';
import { EnrollmentPopulatedListResponse, EnrollmentPopulatedUniqueResponse, EnrollmentListResponse, EnrollmentUniqueResponse } from '@shared/models/api.interfaces';


export class EnrollmentMapper {

    static mapResponseToEnrollment ( response : EnrollmentUniqueResponse ) : Enrollment {
        return {
            id : response.id,
            id_user : response.id_user,
            id_course : response.id_course,
            purchaseDate : response.purchaseDate,
            progress : response.progress,
            completed_lessons : response.completed_lessons,
            last_accessed_at : response.last_accessed_at,
        };
    }

    static mapResponseToEnrollmentArray ( response : EnrollmentListResponse ) : Enrollment[] {
        return response.data.map( this.mapResponseToEnrollment );
    }

    static mapResponseToEnrollmentDetailed ( response : EnrollmentPopulatedUniqueResponse ) : EnrollmentDetailed {
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
            purchaseDate : response.purchaseDate,
            progress : response.progress,
            completed_lessons : response.completed_lessons,
            last_accessed_at : response.last_accessed_at,
        };
    }

    static mapResponseToEnrollmentDetailedArray ( response : EnrollmentPopulatedListResponse ) : EnrollmentDetailed[] {
        return response.data.map( this.mapResponseToEnrollmentDetailed );
    }
}