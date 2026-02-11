export type FilterOption =
  | FilterOptionDefault
  | FilterOptionBasic
  | FilterOptionHover
  | FilterOptionCompound;

type FilterOptionType = 'default' | 'basic' | 'hover' | 'compound';

export interface FilterOptionBasic {
    key: string;
    label: string;
    type: FilterOptionType;
}

export interface FilterOptionDefault extends FilterOptionBasic {
    value?: string;
}

export interface FilterOptionHover extends FilterOptionBasic {
    value?: FilterOptionBasic[];
}

export interface FilterOptionCompound extends FilterOptionBasic {
    value: FilterOptionDefault[];
}

export const FilterMaps: Record<string, FilterOption[]> = {
  courses: [
    {
      key: 'notFullyEnrolled',
      label: 'Cupos disponibles',
      type: 'default',
      value: 'true',
    },
    { key: 'id_category', label: 'Categoria', type: 'hover' },
    {
      key: 'price',
      label: 'Precio',
      type: 'compound',
      value: [
        { key: 'minPrice', label: 'Precio mínimo', type: 'basic' },
        { key: 'maxPrice', label: 'Precio máximo', type: 'basic' },
      ],
    },
  ],
  // enrollments : [
  //     { key : '' , label : 'Finalizados'},
  // ],
};
