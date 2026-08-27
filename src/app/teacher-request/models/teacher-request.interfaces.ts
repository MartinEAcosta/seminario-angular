export type TeacherRequestStatus = 'pending' | 'approved' | 'rejected';

export interface TeacherRequest {
    id              : string;
    status          : TeacherRequestStatus;
    categoryIds     : string[];
    experience      : string;
    motivation      : string;
    courseIdea      : string;
    portfolioUrl    : string | null;
    rejectionReason : string | null;
    createdAt       : Date;
    reviewedAt      : Date | null;
}

// Lo que se envía al crear una solicitud.
export interface TeacherRequestDTO {
    categoryIds   : string[];
    experience    : string;
    motivation    : string;
    courseIdea    : string;
    portfolioUrl ?: string;
}
