import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CourseService } from 'src/app/course/services/course.service';
import { PageTitleComponent } from "src/app/shared/components/page-title/page-title.component";

@Component({
  selector: 'app-buy-page',
  imports: [PageTitleComponent],
  templateUrl: './buy-page.html',
  styleUrl: './buy-page.scss'
})
export class BuyPage {

  private router = inject(Router);
  private authService = inject(AuthService);
  private courseService = inject(CourseService);

  constructor ( ) { }



}
