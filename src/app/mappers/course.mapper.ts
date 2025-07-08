// Practica vista en el curso de Fernando Herrera, similar a patrón DTO ( Data Transfer Object ),
// utilizado previamente en Java.
import type { Course , CourseResponse } from '@interfaces/course.interfaces';

export class CourseMapper {
    
    static mapResponseToCourse ( response : CourseResponse ) : Course {
        return {
            _id: response._id ,
            title: response.title,
            description: response.description,
            imgURL: response.imgURL ?? [],
            owner: response.owner,
            price: response.price ?? 0, // Si no existe, se asigna 0 por defecto
            offer: response.offer  ?? false, // Si no existe, se asigna false por defecto
            capacity: response.capacity ?? undefined,   
        };
    } 

    static mapResponseToCourseArray ( response : CourseResponse[] ) : Course[] {
        return response.map( this.mapResponseToCourse );
    }


}
