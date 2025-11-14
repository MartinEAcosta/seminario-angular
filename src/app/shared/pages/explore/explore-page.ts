import { Component, effect, inject, linkedSignal, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

import { SearchFilterBarComponent } from "../../components/search-filter-bar/search-filter-bar.component";
import { PageTitleComponent } from "../../components/page-title/page-title.component";
import { CourseService } from 'src/app/course/services/course.service';
import { LoaderComponent } from "../../components/loader/loader.component";
import { CourseMiniCardComponent } from "src/app/course/components/course-mini-card/course-mini-card.component";
import { CartComponent } from "src/app/cart/components/cart/cart.component";
import { PaginationComponent } from "../../pagination/pagination.component";
import { PaginationService } from '../../pagination/services/pagination.service';
import { FilterMaps } from '@payment/filter-options';
import { PaginationResponseDto } from '../../models/api.interface';
import { Course } from '@course/models/course.interfaces';

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

  courses = linkedSignal(() => this.coursesResource.value());

  filterOptions = FilterMaps['courses'];
  // Le pido al servició que tome de la activated route los query params actuales
  queryParam = this.activatedRoute.snapshot.queryParamMap.get('title') ?? '';

  // LinkedSignal es utilizado para crear una señal que esta vinculada exactamente a otro estado.
  // En vez de pasar un valor por default se toma el mismo de una función computada.
  query = linkedSignal(() => this.queryParam);

  coursesResource = rxResource({
    request : () => ({ 
      query : this.query(),      
      currentPage : this.paginationService.currentPage(),
     }),
    loader : ({request}) => { 
      // this.router.navigate(['/explore'] , {
      //     queryParams : { 
      //       query : request.query || null,
      //       page : request.currentPage,
      //     }
      // });
      return this.courseService.getAll( request.query , request.currentPage );
    }
  });

  onQueryChange = effect(() => {
    const query = this.query();
    this.router.navigate(['/explore'] , {
        queryParams : { 
          query : query || undefined,
          page : 1,
        }
    });
    this.courseService.getAll( query , 1 ).subscribe( ( res ) => {
      this.courses.set( res );
    });
  });

}
