import { FilterOption } from "./filter.interfaces";

export const FilterExplorePage: FilterOption[] = [
  {
    key: 'notFullyEnrolled',
    label: 'Cupos disponibles',
    type: 'default',
    value: 'true',
  },
  {
    key: 'id_category',
    label: 'Categoria',
    type: 'hover',
    value: [],
  },
  {
    key: 'price',
    label: 'Precio',
    type: 'compound',
    value: [
      { key: 'minPrice', label: 'Precio mínimo', type: 'default' },
      { key: 'maxPrice', label: 'Precio máximo', type: 'default' },
    ],
  },
];
