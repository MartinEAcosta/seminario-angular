export type TeacherRequestStatus = 'pending' | 'approved' | 'rejected';
export type TeacherExperienceLevel = 'none' | 'informal' | 'teacher';

export interface TeacherRequest {
    id              : string;
    status          : TeacherRequestStatus;
    categoryIds     : string[];
    aboutYou        : string;
    experienceLevel : TeacherExperienceLevel;
    courseTitle     : string;
    courseSummary   : string;
    portfolioUrl    : string | null;
    rejectionReason : string | null;
    createdAt       : Date;
    reviewedAt      : Date | null;
}

// Lo que se envía al crear una solicitud.
export interface TeacherRequestDTO {
    categoryIds     : string[];
    aboutYou        : string;
    experienceLevel : TeacherExperienceLevel;
    courseTitle     : string;
    courseSummary   : string;
    portfolioUrl   ?: string;
}
