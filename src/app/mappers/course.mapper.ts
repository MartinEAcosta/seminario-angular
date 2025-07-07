// Practica vista en el curso de Fernando Herrera, similar a patrón DTO ( Data Transfer Object ),
// utilizado previamente en Java.
import type { Course , CourseResponse } from '@interfaces/course.interfaces';


export class CourseMapper {

    
    static mapResponseToCourse ( response : CourseResponse ) : Course {
        return {
            _id: response.course._id ,
            title: response.course.title,
            description: response.course.description,
            imgURL: response.course.imgURL,
            owner: response.course.owner,
            price: response.course.price,
            offer: response.course.offer,
            capacity: response.course.capacity ?? undefined,   
        };
    } 

    static mapResponseToCourseArray ( response : CourseResponse[] ) : Course[] {
        return response.map( ( courseResponse ) => {
            return this.mapResponseToCourse( courseResponse ); 
        });
    }

}
