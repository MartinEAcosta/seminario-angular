import { Component, effect, EventEmitter, inject, input, Input, Output, signal } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Category } from '../../models/category.interfaces';
import { NgClass } from '@angular/common';
import { Course } from '@course/models/course.interfaces';

@Component({
  selector: 'app-category-select',
  imports: [NgClass],
  templateUrl: './category-select.component.html',
  styleUrl: './category-select.component.scss'
})
export class CategorySelectComponent {
  
  private categoryService = inject(CategoryService);

  @Output() 
  clickCategory = new EventEmitter<string>();
  course = input.required<Course | null>();

  categorySelected = signal<Category | undefined>( undefined );
  categoriesResource = rxResource({ 
    loader : () => { return this.categoryService.getAllCategories() }
  });

  constructor ( ) {
    effect( () => {
      if( this.categoriesResource.hasValue() ) {
        const initialCategory = this.categoriesResource.value()
                                                        ?.find( 
                                                                category => 
                                                                        category.id === this.course()?.id_category 
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
