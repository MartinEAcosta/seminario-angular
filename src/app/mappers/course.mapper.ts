// Practica vista en el curso de Fernando Herrera, similar a patrón DTO ( Data Transfer Object ),
// utilizado previamente en Java.
import type { Course, CourseDTO } from '@interfaces/course.interfaces';
import { CourseListResponse, CourseUniqueResponse } from '../shared/interfaces/api.interface';
import { FormGroup } from '@angular/forms';

export class CourseMapper {

    static mapToCourseDto ( form : FormGroup ) : CourseDTO {
      const formValues = form.getRawValue();
      return {
        title         : formValues.title,
        description   : formValues.description,
        category      : formValues.category,
        // Igualmente el backend lo reemplaza por el usuario que se encuentre logueado.
        thumbnail_url : formValues.thumbnail_url,
        thumbnail_id  : formValues.thumbnail_id,
        price         : formValues.price ? formValues.price : 0,
        capacity      : formValues.wantLimitedCapacity ? formValues.capacity : undefined,
      }
    }
    
    static mapResponseToCourse ( response : CourseUniqueResponse ) : Course {
        return {
            id: response.id ,
            title: response.title,
            description: response.description,
            category: response.category ?? " ",
            thumbnail_url: response.thumbnail_url ?? "",
            thumbnail_id: response.thumbnail_id ?? "",
            id_owner: response.id_owner,
            price: response.price ?? 0, // Si no existe, se asigna 0 por defecto
            capacity: response.capacity ?? undefined,   
        };
    } 

    static mapResponseToCourseArray ( response : CourseListResponse ) : Course[] {
        return response.data.map( this.mapResponseToCourse );
    }


}
