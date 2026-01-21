import { computed, Injectable, signal } from '@angular/core';

export interface StateData<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

@Injectable({
  providedIn: 'root',
})
export class State<T> {
  state = signal<StateData<T>>({
    isLoading: false,
    error: null,
    data: null,
  });


  isLoading = computed( () => this.state().isLoading ); 
  error = computed( () => this.state().error );

  constructor() {}

  handleError(error: any): StateData<T> {
    const errorMessage = error.message || 'Ocurrio un error inesperado.';

    this.state.update((c) => ({
      ...c,
      error: errorMessage,
    }));
    this.setIsLoading(false);

    return this.state();
  }

  setIsLoading( bool : boolean ) : StateData<T> {
    this.state.update( (c) => ({
        ...c ,
        isLoading : bool,
    }));

    return this.state();
  }

  resetState ( ) : StateData<T> {
    this.state.set( {
      isLoading : false,
      error : null,
      data : null,
    } );

    return this.state();
  }

}
