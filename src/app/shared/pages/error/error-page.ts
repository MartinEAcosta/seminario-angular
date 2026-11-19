import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

type ErrorIconKind = 'search' | 'alert';

// Copy por defecto, usado cuando la ruta no trae `data` o cuando el valor que
// llega no es confiable. withComponentInputBinding() bindea params, queryParams
// y data por igual, así que `/error?title=...` podría reescribir la página
// entera desde una URL compartible si estos inputs se mostraran a ciegas.
const FALLBACK = {
    code    : 500,
    eyebrow : 'Error del servidor',
    title   : 'Algo falló de nuestro lado',
    message : 'Ya estamos viéndolo. Probá de nuevo en unos minutos.',
    badge   : 'Error 500',
} as const;

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.html',
    styleUrl: './error-page.scss',
    imports: [RouterLink]
})
export default class ErrorPage {

    // El copy entra por el `data` de la ruta, vía el withComponentInputBinding()
    // configurado en app.config.ts. El motivo real del error no se pasa nunca: un
    // 5xx no trae texto pensado para el usuario y puede filtrar detalle interno
    // (ver SPEC 16). Los inputs son opcionales a propósito: esta es la página que
    // se muestra cuando algo ya falló, así que no puede fallar ella misma por un
    // `data` incompleto.
    code    = input<unknown>();
    eyebrow = input<unknown>();
    title   = input<unknown>();
    message = input<unknown>();
    badge   = input<unknown>();

    // Cada valor se valida antes de mostrarse. Como el binding de ruta no
    // distingue `data` de `queryParams`, sin esto un `/error?title=<lo que sea>`
    // reescribiría la página desde una URL compartible.
    safeCode    = computed<number>( () => {
        const value = Number( this.code() );
        return Number.isInteger( value ) && value >= 100 && value <= 599 ? value : FALLBACK.code;
    });
    safeEyebrow = computed<string>( () => readCopy( this.eyebrow() , FALLBACK.eyebrow ) );
    safeTitle   = computed<string>( () => readCopy( this.title()   , FALLBACK.title   ) );
    safeMessage = computed<string>( () => readCopy( this.message() , FALLBACK.message ) );
    safeBadge   = computed<string>( () => readCopy( this.badge()   , FALLBACK.badge   ) );

    // El número grande se parte en dos para que el último dígito lleve el acento
    // de color, como venía haciendo el 404 con los literales '40' y '4'. El rango
    // de `safeCode` garantiza tres dígitos, así que nunca queda un span vacío.
    codeLead   = computed<string>( () => String( this.safeCode() ).slice( 0, -1 ) );
    codeAccent = computed<string>( () => String( this.safeCode() ).slice( -1 ) );

    // El icono del badge sale del código, no de la ruta: es la única parte del
    // panel que afirma algo sobre la causa, y una lupa en un 5xx diría que no
    // encontramos la página cuando lo que pasó es que el servidor falló.
    iconKind = computed<ErrorIconKind>( () => this.safeCode() === 404 ? 'search' : 'alert' );

}

// Solo se muestra un string corto de una línea: cualquier otra cosa (un objeto,
// un texto larguísimo, marcado) cae al copy por defecto.
const readCopy = ( value : unknown , fallback : string ) : string => {
    if( typeof value !== 'string' ) return fallback;

    const trimmed = value.trim();
    const looksLikeCopy = trimmed.length > 0 && trimmed.length <= 160 && !trimmed.includes('<');

    return looksLikeCopy ? trimmed : fallback;
};
