import { Component, computed, effect, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Category } from '../../models/category.interfaces';
import { Course } from '@interfaces/course.interfaces';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-category-select',
  imports: [NgClass],
  templateUrl: './category-select.component.html',
  styleUrl: './category-select.component.scss'
})
export class CategorySelectComponent {

  @Input()
  public courseProvided : Course | undefined;
  @Output() 
  public clickCategory = new EventEmitter<string>();
  
  private categoryService = inject(CategoryService);
  
  public categoriesResource = rxResource({ 
    loader : () => { return this.categoryService.getAllCategories() }
  });

  public categorySelected = signal<Category | undefined>( undefined );

  constructor ( ) {
    effect( () => {
      if( this.categoriesResource.hasValue() ) {
        const initialCategory = this.categoriesResource.value()
                                                        ?.find( 
                                                                category => 
                                                                        category.id === this.courseProvided?.id_category 
                                                              )

        this.categorySelected.set(initialCategory)
      }
    })
  }


  public onSelectCategory ( category : Category ) : Category {
    this.clickCategory.emit(category.id);
    this.categorySelected.set(category);
    return category;
  }


}
