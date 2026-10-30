import { PaginationResponse, PaginationResponseDto } from "@shared/models/api.interfaces";

export class PaginationMapper {

    // `mapItem` es obligatorio a propósito: antes esta función devolvía los
    // items crudos tipados como modelo de la app, que es justo la mentira que
    // el patrón de mappers existe para evitar.
    static mapToPaginationDto = <TDto, TModel>(
        response : PaginationResponse<TDto>,
        mapItem  : ( item : TDto ) => TModel,
    ) : PaginationResponseDto<TModel> => {
        return {
            pages        : response.data.pages,
            current_page : response.data.current_page,
            limit        : response.data.limit,
            total        : response.data.total,
            next         : response.data.next,
            prev         : response.data.prev,
            items        : ( response.data.items ?? [] ).map( item => mapItem( item ) ),
        };
    }

}
