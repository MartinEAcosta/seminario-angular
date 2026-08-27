import { TeacherRequestResponse, TeacherRequestUniqueResponse } from "@shared/models/api.interfaces";
import { TeacherRequest } from "@teacher-request/models/teacher-request.interfaces";

export class TeacherRequestMapper {

    static mapResponseToTeacherRequest = ( response : TeacherRequestUniqueResponse ) : TeacherRequest => {
        return {
            id              : response.id,
            status          : response.status,
            categoryIds     : response.category_ids,
            experience      : response.experience,
            motivation      : response.motivation,
            courseIdea      : response.course_idea,
            portfolioUrl    : response.portfolio_url ?? null,
            rejectionReason : response.rejection_reason ?? null,
            createdAt       : new Date( response.created_at ),
            reviewedAt      : response.reviewed_at ? new Date( response.reviewed_at ) : null,
        };
    }

    static mapApiResponseToTeacherRequest = ( response : TeacherRequestResponse ) : TeacherRequest => {
        return this.mapResponseToTeacherRequest( response.data );
    }

}
