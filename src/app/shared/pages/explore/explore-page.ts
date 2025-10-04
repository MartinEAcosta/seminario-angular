import { Component, inject } from '@angular/core';
import { SearchFilterBarComponent } from "../../components/search-filter-bar/search-filter-bar.component";
import { PageTitleComponent } from "../../components/page-title/page-title.component";
import { rxResource } from '@angular/core/rxjs-interop';
import { CourseService } from 'src/app/course/services/course.service';
import { LoaderComponent } from "../../components/loader/loader.component";
import { CourseMiniCardComponent } from "src/app/course/components/course-mini-card/course-mini-card.component";

@Component({
  selector: 'app-explore-page',
  imports: [SearchFilterBarComponent, PageTitleComponent, LoaderComponent, CourseMiniCardComponent],
  templateUrl: './explore-page.html',
  styleUrl: './explore-page.scss'
})
export class ExplorePage {

  private courseService = inject(CourseService);
  
  public courseResource = rxResource({
    loader : ({ }) => {
      return this.courseService.getAll();
    }
  });

}
