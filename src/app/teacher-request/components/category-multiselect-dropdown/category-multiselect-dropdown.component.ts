import { Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';

import { Category } from '@category/models/category.interfaces';

interface CategoryCheckbox {
  category : Category;
  checked  : boolean;
}

@Component({
  selector: 'app-category-multiselect-dropdown',
  templateUrl: './category-multiselect-dropdown.component.html',
  styleUrl: './category-multiselect-dropdown.component.scss',
})
export class CategoryMultiselectDropdownComponent {

  private elementRef = inject(ElementRef);

  public categories = input.required<Category[]>();
  public selectedIds = input.required<string[]>();

  public toggleCategory = output<CategoryCheckbox>();

  public open = signal<boolean>( false );

  public toggle = ( ) : void => {
    this.open.update( open => !open );
  }

  public isSelected = ( category : Category ) : boolean => {
    return this.selectedIds().includes( category.id );
  }

  public onToggleCategory = ( category : Category ) : void => {
    this.toggleCategory.emit(
      {
       category,
       checked : !this.isSelected(category) 
      }
    );
  }

  public get selectedLabel ( ) : string {
    const selectedCount = this.selectedIds().length;
    if( selectedCount === 0 ) return 'Seleccioná una o más categorías';
    const selectedNames = this.categories()
                                .filter( category => this.selectedIds().includes( category.id ) )
                                .map( category => category.name );
    return selectedNames.join(', ');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick ( event : MouseEvent ) : void {
    if( this.open() && !this.elementRef.nativeElement.contains(event.target as Node) ) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKeydown ( ) : void {
    this.open.set(false);
  }

}