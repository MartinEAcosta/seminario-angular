// Practica vista en el curso de Fernando Herrera, similar a patrón DTO ( Data Transfer Object ),
// utilizado previamente en Java.
import type { Course, CourseDTO, CoursePopulated } from '@course/models/course.interfaces';
import { ApiResponse, CoursePopulatedResponseDto, CourseResponseDto } from '@shared/models/api.interfaces';
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
    
    // `GET /courses` y `GET /courses/:id`: sin datos del profesor más allá del
    // id. Los campos de owner quedan en null y la UI los trata como ausentes.
    static mapResponseToCourse ( response : CourseResponseDto ) : Course {
        return {
            id: response.id ,
            title: response.title,
            description: response.description,
            id_category: response.id_category,
            category_name: response.category_name,
            thumbnail_url: response.thumbnail_url ?? "",
            id_file: response.id_file ?? "",
            id_owner: response.id_owner,
            price: response.price ?? 0, // Si no existe, se asigna 0 por defecto
            current_enrolled: response.current_enrolled,
            capacity: response.capacity ?? null,
            spots_remaining: response.spots_remaining ?? null,
        };
    }

    // `GET /courses/detailed/:id`: el profesor viene anidado y se aplana acá,
    // que es el único lugar que conoce las dos formas.
    static mapPopulatedResponseToCourse ( response : CoursePopulatedResponseDto ) : CoursePopulated {
        return {
            id: response.id,
            title: response.title,
            description: response.description,
            id_category: response.id_category,
            category_name: response.category_name,
            thumbnail_url: response.thumbnail_url ?? "",
            id_file: response.id_file ?? "",
            owner: {
                id : response.owner.id,
                username : response.owner.username,
                email : response.owner.email,
                avatar_url : response.owner.avatar_url ?? '',
            },
            price: response.price ?? 0,
            current_enrolled: response.current_enrolled,
            capacity: response.capacity ?? null,
            spots_remaining: response.spots_remaining ?? null,
        };
    }

    static mapResponseToCourseArray ( response : ApiResponse<CourseResponseDto[]> ) : Course[] {
        return response.data.map( this.mapResponseToCourse );
    }


}
