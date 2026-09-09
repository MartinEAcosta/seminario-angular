import { Component, inject } from '@angular/core';

import { EnrollmentMiniCardComponent } from "../components/enrollment-card/enrollment-mini-card.component";
import { SearchBarComponent } from "@shared/components/search-bar/search-bar.component";
import { PageTitleComponent } from "@shared/components/page-title/page-title.component";
import { EnrollmentState } from '@enrollment/state/enrollment-state';
import { LoaderComponent } from "@shared/components/loader/loader.component";

@Component({
  selector: 'app-enrollments-page',
  templateUrl: './enrollments-page.html',
  styleUrl: './enrollments-page.scss',
  imports: [EnrollmentMiniCardComponent, SearchBarComponent, PageTitleComponent, LoaderComponent]
})
export default class EnrollmentsPage {

  private enrollmentState = inject(EnrollmentState);
  userEnrollments = this.enrollmentState.enrollmentList;
  isLoading = this.enrollmentState.isLoadingList;
  error = this.enrollmentState.listError;

  constructor() { }

}
