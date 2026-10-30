import { ApiResponse, TeacherRequestResponseDto } from "@shared/models/api.interfaces";
import { TeacherRequest } from "@teacher-request/models/teacher-request.interfaces";

export class TeacherRequestMapper {

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
