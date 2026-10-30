import { ApiResponse, CategoryResponseDto } from "@shared/models/api.interfaces";


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