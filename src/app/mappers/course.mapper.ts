// Practica vista en el curso de Fernando Herrera, similar a patrón DTO ( Data Transfer Object ),
// utilizado previamente en Java.
import type { Course, CourseApiResponse  } from '@interfaces/course.interfaces';

export class CourseMapper {
    
    static mapResponseToCourse ( response : CourseApiResponse ) : Course {
        return {
            id: response._id ,
            title: response.title,
            description: response.description,
            imgURL: response.imgURL ?? [],
            owner: response.owner,
            price: response.price ?? 0, // Si no existe, se asigna 0 por defecto
            capacity: response.capacity ?? undefined,   
        };
    } 

    static mapResponseToCourseArray ( response : CourseApiResponse[] ) : Course[] {
        return response.map( this.mapResponseToCourse );
    }


}
