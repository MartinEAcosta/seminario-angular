import { CategoryListResponse, CategoryUniqueResponse } from "../shared/models/api.interfaces";


export class CategoryMapper {

    static mapResponseToCategory = ( response : CategoryUniqueResponse ) => {
        return {
            id   : response.id,
            name : response.name,
            slug : response.slug,
        };
    }

    static mapResponseToCategoriesArray = ( response : CategoryListResponse ) => {
        return response.data.map( this.mapResponseToCategory );
    }
}