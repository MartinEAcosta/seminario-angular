import { Component, inject, linkedSignal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

import { PageTitleComponent } from "../../components/page-title/page-title.component";
import { CourseService } from 'src/app/course/services/course.service';
import { LoaderComponent } from "../../components/loader/loader.component";
import { CourseMiniCardComponent } from "src/app/course/components/course-mini-card/course-mini-card.component";
import { CartComponent } from "src/app/cart/components/cart/cart.component";
import { PaginationComponent } from "../../pagination/pagination.component";
import { PaginationService } from '../../pagination/services/pagination.service';
import { SearchService } from '../../search/search.service';
import { SearchBarComponent } from "../../components/search-filter-bar/search-bar.component";
import { FilterMaps } from '@utils/filter-options';
import { FilterSelectorComponent } from "../../components/filter-selector/filter-selector/filter-selector.component";

@Component({
  selector: 'app-explore-page',
  imports: [SearchBarComponent, PageTitleComponent, LoaderComponent, CourseMiniCardComponent, CartComponent, PaginationComponent, FilterSelectorComponent],
  templateUrl: './explore-page.html',
  styleUrl: './explore-page.scss'
})
export class ExplorePage {

  private router = inject(Router);
  private courseService = inject(CourseService);
  paginationService = inject(PaginationService);
  searchService = inject(SearchService)
  filterMaps = FilterMaps;
  
  // compoundFilterVisible = signal<boolean>(false);

  courses = linkedSignal(() => this.coursesResource.value());
  
  coursesResource = rxResource({
    request : () => ({
      textSearch : this.searchService.textSearch(), 
      filters : { ...this.searchService.query() },
      page : this.paginationService.currentPage(),
    }),
    loader : ({request}) => { 
      console.log(request.textSearch)
      this.router.navigate(['/explore'] , {
          queryParams : { 
            ...request.filters,
            title : request.textSearch || undefined,
            page : request.page,
          }
      });
      return this.courseService.getAll( { 
        ...request.filters,
        title: request.textSearch || undefined,
        page : request.page
      } );
    }
  });

  constructor() { }

}
