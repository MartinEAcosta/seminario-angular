import { Component, input } from '@angular/core';

import { EnrollmentMiniCardComponent } from "../components/enrollment-card/enrollment-mini-card.component";
import { SearchBarComponent } from "src/app/shared/components/search-filter-bar/search-bar.component";
import { PageTitleComponent } from "src/app/shared/components/page-title/page-title.component";
import { EnrollmentDetailed } from '@enrollment/models/enrollment.interfaces';

@Component({
  selector: 'app-enrollments-page',
  templateUrl: './enrollments-page.html',
  styleUrl: './enrollments-page.scss',
  imports: [EnrollmentMiniCardComponent, SearchBarComponent, PageTitleComponent]
})
export default class EnrollmentsPage {

  resolvedEnrollments = input.required<EnrollmentDetailed[]>();

  constructor() { }

}
