export type FilterOption = FilterOptionDefault | FilterOptionBasic | FilterOptionHover | FilterOptionCompound;

export class FilterOptionDefault {
    public key   : string;
    public label : string;
    public type  : 'default' | 'basic' | 'hover' | 'compound' = 'default';

    constructor( key : string , label : string , type ?: 'default' | 'basic' | 'hover' | 'compound' ){
        this.key   = key; 
        this.label = label;
        this.type  = type || 'default';
    }

}

export class FilterOptionBasic extends FilterOptionDefault {
    public value ?: string;

    constructor( key : string , label : string , value ?: string ){
        super( key , label , 'basic' );
        this.value = value;
    }
}

export class FilterOptionHover extends FilterOptionDefault {
    public value ?: FilterOptionBasic[];

    constructor( key : string , label : string , value ?: FilterOptionBasic[] ){
        super( key , label , 'hover' );
        this.value = value || [];
    }

}

export class FilterOptionCompound extends FilterOptionDefault {
    public value : FilterOptionDefault[];

    constructor( key : string , label : string , value : FilterOptionDefault[] ){
        super( key , label , 'compound' );
        this.value = value;
    }

}

export const FilterMaps : Record<string, FilterOption[]> = {
    courses : [
        { key : 'notFullyEnrolled', label : 'Cupos disponibles' , type : 'default' , value : 'true' },
        { key : 'id_category', label : 'Categoria' , type : 'hover' },
        { key : 'price', label : 'Precio' , type : 'compound' , value : [
            { key : 'minPrice' , label : 'Precio mínimo' , type : 'basic' },
            { key : 'maxPrice' , label : 'Precio máximo' , type : 'basic' },
        ] },
    ],
    // enrollments : [
    //     { key : '' , label : 'Finalizados'},  
    // ],
}