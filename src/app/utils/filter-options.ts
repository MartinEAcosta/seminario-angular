
export interface FilterOption{
    key : string,
    label : string,
    options ?: 'hover' | 'default' | 'clickable',
    value ?: string,
}

export const FilterMaps : Record<string, FilterOption[]> = {
    courses : [
        { key : 'notFullyEnrolled', label : 'Cupos disponibles' , options : 'default' , value : 'true' },
        { key : 'id_category', label : 'Categoria' , options : 'hover' },
        { key : 'price', label : 'Precio' , options : 'clickable' },
    ],
    // enrollments : [
    //     { key : '' , label : 'Finalizados'},  
    // ],
}