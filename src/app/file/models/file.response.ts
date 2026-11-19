// Forma cruda que llega del backend para file. Nada de este archivo se usa en un
// componente: todo pasa antes por `FileMapper`.

import { ResourceValidTypes } from './file.interface';

export interface FileResponseDto {
  id            : string;
  public_id     : string;
  folder        : string;
  size          : number;
  url           : string;
  extension     : string;
  resource_type : ResourceValidTypes;
}
