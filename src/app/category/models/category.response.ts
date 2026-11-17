// Forma cruda que llega del backend para category. Nada de este archivo se usa
// en un componente: todo pasa antes por `CategoryMapper`.

export interface CategoryResponseDto {
  id   : string;
  name : string;
  slug : string;
}
