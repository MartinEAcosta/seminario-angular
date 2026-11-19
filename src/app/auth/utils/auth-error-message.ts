import { HttpErrorResponse } from '@angular/common/http';

import { ErrorResponse } from '@shared/models/api.interfaces';

// Concentra la regla de ruteo del error de los flujos de AuthService, para que
// no quede copiada en cada `subscribe` (ver SPEC 16). Funciones puras, sin
// dependencia de Angular.

export const CONNECTION_ERROR_MESSAGE = 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.';
export const INVALID_CREDENTIALS_MESSAGE = 'Revisá las credenciales e intentá de nuevo.';
export const REGISTRATION_ERROR_MESSAGE = 'No pudimos crear tu cuenta. Revisá los datos e intentá de nuevo.';

export const isServerError = ( error : HttpErrorResponse ) : boolean => error.status >= 500;
export const isConnectionError = ( error : HttpErrorResponse ) : boolean => error.status === 0;

interface AuthErrorMessageOptions {
  // Deja mostrar el texto del backend también en 401/403/404. Solo para flujos
  // donde el usuario YA está autenticado (cambio de contraseña), donde no hay
  // nada que enumerar y el mensaje del backend es la única forma de distinguir
  // "la contraseña actual está mal" de un fallo cualquiera.
  trustBackendMessage ?: boolean;
}

export const getAuthErrorMessage = (
  error : HttpErrorResponse ,
  fallback : string ,
  options : AuthErrorMessageOptions = {},
) : string => {
  // No es que el servidor falló: es que no contestó. Decir "algo falló de
  // nuestro lado" cuando puede ser la conexión del usuario sería impreciso.
  if( isConnectionError( error ) ) return CONNECTION_ERROR_MESSAGE;

  // En los flujos no autenticados, 401/403/404 nunca muestran el texto del
  // backend: un login con un email inexistente puede contestar
  // notFound('usuario no encontrado'), y mostrarlo permitiría enumerar cuentas
  // con un solo intento.
  const isIdentityStatus = error.status === 401 || error.status === 403 || error.status === 404;
  if( isIdentityStatus && !options.trustBackendMessage ) return fallback;

  return readBackendMessage( error ) ?? fallback;
};

const readBackendMessage = ( error : HttpErrorResponse ) : string | null => {
  const body : ErrorResponse | string | null = error.error;

  // Cuando la respuesta no es JSON (404 de ruta de Express, error de proxy) el
  // body llega como string. Se acepta solo si parece un mensaje y no una página
  // HTML de error, que sería peor que el copy del front.
  if( typeof body === 'string' ){
    const trimmed = body.trim();
    const looksLikeMessage = trimmed.length > 0 && trimmed.length <= 200 && !trimmed.includes('<');
    return looksLikeMessage ? trimmed : null;
  }

  const message = body?.error;
  return typeof message === 'string' && message.trim().length > 0 ? message : null;
};
