import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../state/cart.service';

type DiscountStatus = 'idle' | 'applying' | 'applied' | 'error';

@Component({
  selector: 'app-discount-code-input',
  imports: [ReactiveFormsModule],
  templateUrl: './discount-code-input.component.html',
  styleUrl: './discount-code-input.component.scss'
})
export class DiscountCodeInputComponent {

  private cartService = inject(CartService);

  public codeControl = new FormControl<string>( '' , { nonNullable: true } );
  public status = signal<DiscountStatus>('idle');

  constructor() {
    this.codeControl.valueChanges.subscribe( () => {
      if( this.status() === 'error' ) this.status.set('idle');
    });
  }

  public onApply = ( ) : void => {
    const code = this.codeControl.value.trim();
    if( !code || this.status() === 'applying' ) return;

    this.status.set('applying');
    this.codeControl.disable(); // deshabilitar vía el FormControl, no con [disabled] en el template
    this.cartService.applyDiscountCode( code ).subscribe({
      next: () => {
        this.status.set('applied');
        this.codeControl.enable();
      },
      error: ( err ) => {
        console.error('Error aplicando cupón:', err);
        this.status.set('error');
        this.codeControl.enable();
      }
    });
  }

}
