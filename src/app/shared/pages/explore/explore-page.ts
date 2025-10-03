import { Component } from '@angular/core';
import { SearchFilterBarComponent } from "../../components/search-filter-bar/search-filter-bar.component";
import { PageTitleComponent } from "../../components/page-title/page-title.component";

@Component({
  selector: 'app-explore-page',
  imports: [SearchFilterBarComponent, PageTitleComponent],
  templateUrl: './explore-page.html',
  styleUrl: './explore-page.scss'
})
export class ExplorePage {

}
