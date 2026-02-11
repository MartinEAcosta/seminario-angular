import { Component, computed, inject, linkedSignal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

import { CourseService } from 'src/app/course/services/course.service';
import { SearchService } from '../../services/search/search.service';
import { PaginationService } from '../../pagination/services/pagination.service';
import { PageTitleComponent } from "../../components/page-title/page-title.component";
import { LoaderComponent } from "../../components/loader/loader.component";
import { CourseMiniCardComponent } from "src/app/course/components/course-mini-card/course-mini-card.component";
import { CartComponent } from "src/app/cart/components/cart/cart.component";
import { PaginationComponent } from "../../pagination/pagination.component";
import { SearchBarComponent } from "../../components/search-filter-bar/search-bar.component";
import { FilterMaps } from '@utils/filters/filter-options';
import { FilterSelectComponent } from "@shared/components/filters/filter-select/filter-select.component";

@Component({
  selector: 'app-explore-page',
  imports: [SearchBarComponent, PageTitleComponent, LoaderComponent, CourseMiniCardComponent,
    CartComponent, PaginationComponent, FilterSelectComponent],
  templateUrl: './explore-page.html',
  styleUrl: './explore-page.scss'
})
export class ExplorePage {

  private router = inject(Router);
  private courseService = inject(CourseService);
  paginationService = inject(PaginationService);
  searchService = inject(SearchService)
  
  filterOptions = computed(() => FilterMaps['courses'] || []);
  courses = linkedSignal(() => this.coursesResource.value());
  
  coursesResource = rxResource({
    request : () => ({
      textSearch : this.searchService.textSearch(), 
      filters : { ...this.searchService.query() },
      page : this.paginationService.currentPage(),
    }),
    loader : ({request}) => { 
      // console.log(request.textSearch)
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


}

