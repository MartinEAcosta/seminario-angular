import { Enrollment } from '../enrollment/models/enrollment.interfaces';
import { EnrollmentListResponse, EnrollmentUniqueResponse } from './../shared/models/api.interface';


export class EnrollmentMapper {

    static mapResponseToEnrollment ( response : EnrollmentUniqueResponse ) : Enrollment {
        return {
            id : response.id,
            id_course : response.id_course,
            id_user : response.id_user,
            purchaseDate : response.purchaseDate,
            progress : response.progress,
            completionDate : response.completionDate, 
        }
    }

    static mapResponseToEnrollmentArray ( response : EnrollmentListResponse ) : Enrollment[] {
        return response.data.map( this.mapResponseToEnrollment );
    }
}