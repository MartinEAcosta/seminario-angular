import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../search/search.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [RouterLink]
})
export class HeaderComponent {

  authService = inject(AuthService);
  searchService = inject(SearchService);

    
}

