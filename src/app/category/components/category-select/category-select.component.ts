import { Component, effect, ElementRef, EventEmitter, HostListener, inject, input, Output, signal } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Category } from '../../models/category.interfaces';
import { NgClass } from '@angular/common';
import { Course } from '@course/models/course.interfaces';

@Component({
  selector: 'app-category-select',
  imports: [NgClass],
  templateUrl: './category-select.component.html',
  styleUrl: './item-select.component.scss'
})
export class CategorySelectComponent {

  private categoryService = inject(CategoryService);
  private elementRef = inject(ElementRef);

  @Output()
  clickCategory = new EventEmitter<string>();
  course = input.required<Course | null>();

  open = signal<boolean>( false );
  searchText = signal<string>( '' );
  categorySelected = signal<Category | undefined>( undefined );
  categoriesResource = rxResource({
    stream : () => { return this.categoryService.getAllCategories() }
  });

  constructor ( ) {
    effect( () => {
      if( this.categoriesResource.hasValue() ) {
        const initialCategory = this.categoriesResource.value()
                                                        .find(
                                                                category =>
                                                                        category.id === this.course()?.id_category
                                                              )
        this.categorySelected.set(initialCategory)
      }
    })
  }

  get filteredCategories () : Category[] {
    if( !this.categoriesResource.hasValue() ) return [];
    const query = this.searchText().trim().toLowerCase();
    if( !query ) return this.categoriesResource.value();
    return this.categoriesResource.value().filter( category => category.name.toLowerCase().includes(query) );
  }

  public toggle ( ) : void {
    this.open.update( open => !open );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick ( event : MouseEvent ) : void {
    if( this.open() && !this.elementRef.nativeElement.contains(event.target as Node) ) {
      this.open.set(false);
    }
  }

  public onSearchInput ( searchText : string ) : void {
    this.searchText.set(searchText);
  }

  public onSelectCategory ( category : Category ) : Category {
    this.clickCategory.emit(category.id);
    this.categorySelected.set(category);
    this.open.set(false);
    this.searchText.set('');
    return category;
  }

  public onClearCategory ( ) : void {
    this.categorySelected.set(undefined);
    this.clickCategory.emit('');
    this.open.set(false);
    this.searchText.set('');
  }

}
