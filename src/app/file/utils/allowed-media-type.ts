// Regla de qué archivo se acepta en los selectores de la app. Función pura, sin
// dependencia de Angular: `FileService` ya no valida ni toastea — propaga el
// archivo elegido y es el componente el que decide si muestra el rechazo y por
// qué canal (ver SPEC 16).

// El copy vive acá para que no quede repetido en cada llamador.
export const INVALID_MEDIA_TYPE_MESSAGE = 'Tipo de archivo no válido. Por favor, selecciona una imagen o un video.';

export const isAllowedMediaType = ( file : File ) : boolean => {
  const kind = file.type.split('/')[0];
  return kind === 'image' || kind === 'video';
};
