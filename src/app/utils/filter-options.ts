
export interface FilterOption{
    key : string,
    label : string,
    options ?: 'hover' | 'default' | 'clickable',
    value ?: string,
}

export const FilterMaps : Record<string, FilterOption[]> = {
    courses : [
        { key : 'notFullyEnrolled', label : 'Cupos disponibles' , value : 'true' },
        { key : 'id_category', label : 'Categoria'},
        { key : 'price', label : 'Precio'},
    ],
    // enrollments : [
    //     { key : '' , label : 'Finalizados'},  
    // ],
}