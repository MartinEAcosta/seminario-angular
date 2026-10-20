import { Component, computed, inject, linkedSignal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { CourseService } from '@course/services/course.service';
import { SearchService } from '../../services/search/search.service';
import { PaginationService } from '../../pagination/services/pagination.service';
import { CategoryService } from '@category/services/category.service';
import { CourseCatalogCardComponent } from "@course/components/course-catalog-card/course-catalog-card.component";
import { CourseCatalogCardSkeletonComponent } from "@course/components/course-catalog-card-skeleton/course-catalog-card-skeleton.component";
import { CartComponent } from "@cart/components/cart/cart.component";
import { PaginationComponent } from "../../pagination/pagination.component";
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";
import { FilterSelectComponent } from "@shared/components/filters/filter-select/filter-select.component";
import { FilterExplorePage } from '@utils/filters/filter-options';
import { FilterOptionDefault } from '@utils/filters/filter.interfaces';
import { EnrollmentState } from '@enrollment/state/enrollment-state';

@Component({
  selector: 'app-explore-page',
  imports: [SearchBarComponent, CourseCatalogCardComponent, CourseCatalogCardSkeletonComponent,
    CartComponent, PaginationComponent, FilterSelectComponent],
  templateUrl: './explore-page.html',
  styleUrl: './explore-page.scss'
})
export class ExplorePage {

  private router = inject(Router);
  private courseService = inject(CourseService);
  paginationService = inject(PaginationService);
  searchService = inject(SearchService)
  categoryService = inject(CategoryService);
  enrollmentState = inject(EnrollmentState);

  // Grilla de skeletons mientras carga: 2 filas completas en el layout de
  // 4 columnas (el breakpoint más ancho), aunque en pantallas chicas sobren
  // algunas, no se nota porque el grid simplemente las apila.
  skeletonCards = Array.from({ length: 8 }, (_, i) => i);

  categories = toSignal( 
    this.categoryService.getAllCategories(),
    { initialValue : [] }
  );
  categoriesResource = rxResource({
    params : () => ({}),
    stream : () => this.categoryService.getAllCategories(),
  });

  courses = linkedSignal(() => this.coursesResource.value());
  coursesResource = rxResource({
    params : () => ({
      textSearch : this.searchService.textSearch(), 
      filters : this.searchService.queryParams() ,
      page : this.paginationService.currentPage(),
    }),
    stream : ({params}) => { 
      this.router.navigate(['/explore'] , {
          queryParams : {
            ...params.filters,
            title : params.textSearch || undefined,
            page : params.page,
          },
          replaceUrl : true,
      });
      return this.courseService.getAll( { 
        ...params.filters,
        title: params.textSearch || undefined,
        page : params.page
      } );
    }
  });

  enrollmentIdFor = ( id_course : string ) : string | null => {
    const enrollment = this.enrollmentState.enrollmentList().find( e => e.course.id_course === id_course );
    return enrollment?.id ?? null;
  }

  filterOptions = computed( () => {
    const filters = FilterExplorePage.map( filter => {
      if( filter.type === 'hover' && filter.key === 'id_category') {
        const categoriesFilter : FilterOptionDefault[] = this.categories().map( category => ({
            key : 'id_category',
            label : category.name,
            type: 'default',
            value : category.id,
          })
        );
        return { ...filter , value : categoriesFilter };
      }
      return filter;
    });
    return filters;
  });


}

