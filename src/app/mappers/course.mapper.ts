// Practica vista en el curso de Fernando Herrera, similar a patrón DTO ( Data Transfer Object ),
// utilizado previamente en Java.
import type { Course } from '@interfaces/course.interfaces';
import { CourseListResponse, CourseUniqueResponse } from '../shared/interfaces/api.interface';

export class CourseMapper {
    
    static mapResponseToCourse ( response : CourseUniqueResponse ) : Course {
        return {
            id: response.id ,
            title: response.title,
            description: response.description,
            category: response.category ?? " ",
            thumbnail_url: response.thumbnail_url ?? "",
            id_owner: response.id_owner,
            price: response.price ?? 0, // Si no existe, se asigna 0 por defecto
            capacity: response.capacity ?? undefined,   
        };
    } 

    static mapResponseToCourseArray ( response : CourseListResponse ) : Course[] {
        return response.data.map( this.mapResponseToCourse );
    }


}
