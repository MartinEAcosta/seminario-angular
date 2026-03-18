import { Component, inject } from '@angular/core';
import { SearchService } from '@shared/services/search/search.service';

@Component({
  selector: 'app-selected-filters',
  templateUrl: './selected-filters.component.html',
  styleUrl: './selected-filters.component.scss'
})
export class SelectedFiltersComponent {

  searchService = inject(SearchService);


}
