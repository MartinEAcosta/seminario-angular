export type FilterOption =
  | FilterOptionDefault
  | FilterOptionHover
  | FilterOptionCompound;


export interface FilterOptionBasic {
    key: string;
    label: string;
  }

export interface FilterOptionDefault extends FilterOptionBasic {
    value?: string;
    type: 'default';
}

export interface FilterOptionHover extends FilterOptionBasic {
    value?: FilterOptionDefault[];
    type: 'hover';
}

export interface FilterOptionCompound extends FilterOptionBasic {
    value: FilterOptionDefault[];
    type: 'compound';
}
