import { Component, inject, linkedSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

import { SearchFilterBarComponent } from "../../components/search-filter-bar/search-filter-bar.component";
import { PageTitleComponent } from "../../components/page-title/page-title.component";
import { CourseService } from 'src/app/course/services/course.service';
import { LoaderComponent } from "../../components/loader/loader.component";
import { CourseMiniCardComponent } from "src/app/course/components/course-mini-card/course-mini-card.component";
import { CartComponent } from "src/app/cart/components/cart/cart.component";
import { PaginationComponent } from "../../pagination/pagination.component";
import { PaginationService } from '../../services/pagination/pagination.service';
import { FilterMaps } from '@payment/filter-options';

@Component({
  selector: 'app-explore-page',
  imports: [SearchFilterBarComponent, PageTitleComponent, LoaderComponent, CourseMiniCardComponent, CartComponent, PaginationComponent],
  templateUrl: './explore-page.html',
  styleUrl: './explore-page.scss'
})
export class ExplorePage {

  private router = inject(Router);
  private courseService = inject(CourseService);
  paginationService = inject(PaginationService);
  activatedRoute = inject(ActivatedRoute);

  filterOptions = FilterMaps['courses'];
  queryParam = this.activatedRoute.snapshot.queryParamMap.get('title') ?? '';

  // LinkedSignal es utilizado para crear una señal que esta vinculada exactamente a otro estado.
  // En vez de pasar un valor por default se toma el mismo de una función computada.
  query = linkedSignal(() => this.queryParam);

  coursesResource = rxResource({
    request : () => ({ 
      query : this.query(),      
      currentPage : this.paginationService.currentPage() - 1,
     }),
    loader : ({request}) => { 
      return this.courseService.getAll( this.query() , this.paginationService.currentPage() );
    }
  });

}
