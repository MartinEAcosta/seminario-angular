import { ApiResponse } from "@shared/models/api.response";
import { CategoryResponseDto } from "@category/models/category.response";


export class CategoryMapper {

    static mapResponseToCategory = ( response : CategoryResponseDto ) => {
        return {
            id   : response.id,
            name : response.name,
            slug : response.slug,
        };
    }

    static mapResponseToCategoriesArray = ( response : ApiResponse<CategoryResponseDto[]> ) => {
        return response.data.map( this.mapResponseToCategory );
    }
}