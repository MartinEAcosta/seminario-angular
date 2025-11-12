import { PaginationResponse, PaginationResponseDto } from "../shared/models/api.interface";

export class PaginationMapper {
 
    static mapToPaginationDto = <T>( response : PaginationResponse<T> ) : PaginationResponseDto<T> => {
        return {
            pages : response.data.pages,
            current_page : response.data.current_page,
            limit : response.data.limit,
            total : response.data.total,
            next : response.data.next,
            prev : response.data.prev,
            items : response.data.items,
        };
    }


}