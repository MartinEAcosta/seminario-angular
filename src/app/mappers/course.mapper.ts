// Practica vista en el curso de Fernando Herrera, similar a patrón DTO ( Data Transfer Object ),
// utilizado previamente en Java.
import type { Course, CourseDTO } from 'src/app/course/models/course.interfaces';
import { CourseListResponse, CourseUniqueResponse } from '../shared/models/api.interface';
import { FormGroup } from '@angular/forms';

export class CourseMapper {

    static mapToCourseDto ( form : FormGroup , limitedCapacity ?: boolean ) : CourseDTO {
      const formValues = form.getRawValue();
      return {
        title         : formValues.title,
        description   : formValues.description,
        id_category   : formValues.id_category,
        price         : formValues.price ? formValues.price : 0,
        capacity      : limitedCapacity ? formValues.capacity : null,
      }
    }
    
    static mapResponseToCourse ( response : CourseUniqueResponse ) : Course {
        return {
            id: response.id ,
            title: response.title,
            description: response.description,
            id_category: response.id_category,
            thumbnail_url: response.thumbnail_url ?? "",
            id_file: response.id_file ?? "",
            id_owner: response.id_owner,
            price: response.price ?? 0, // Si no existe, se asigna 0 por defecto
            capacity: response.capacity ?? null,   
        };
    } 

    static mapResponseToCourseArray ( response : CourseListResponse ) : Course[] {
        return response.data.map( this.mapResponseToCourse );
    }


}
