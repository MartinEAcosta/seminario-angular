import { Enrollment, EnrollmentDetailed } from '../enrollment/models/enrollment.interfaces';
import { EnrollmentDetailedListResponse, EnrollmentDetailedUniqueResponse, EnrollmentListResponse, EnrollmentUniqueResponse } from './../shared/models/api.interface';


export class EnrollmentMapper {

    static mapResponseToEnrollment ( response : EnrollmentUniqueResponse ) : Enrollment {
        return {
            id : response.id,
            id_user : response.id_user,
            id_course : response.id_course,
            purchaseDate : response.purchaseDate,
            progress : response.progress,
            completionDate : response.completionDate, 
        };
    }

    static mapResponseToEnrollmentArray ( response : EnrollmentListResponse ) : Enrollment[] {
        return response.data.map( this.mapResponseToEnrollment );
    }

    static mapResponseToEnrollmentDetailed ( response : EnrollmentDetailedUniqueResponse ) : EnrollmentDetailed {
        return{
            id : response.id,
            id_user : response.id_user,
            course : {
                id_course : response.course._id,
                title : response.course.title,
                id_owner : response.course.id_owner,
                thumbnail_url : response.course.thumbnail_url,
            },
            purchaseDate : response.purchaseDate,
            progress : response.progress,
            completionDate : response.completionDate, 
        };
    }

    static mapResponseToEnrollmentDetailedArray ( response : EnrollmentDetailedListResponse ) : EnrollmentDetailed[] {
        return response.data.map( this.mapResponseToEnrollmentDetailed );
    }
}