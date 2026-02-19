import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '@auth/services/auth.service';
import { SearchService } from '../../../services/search/search.service';
import { UserProfileDropdownComponent } from "src/app/user/components/user-profile-dropdown/user-profile-dropdown.component";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [RouterLink, UserProfileDropdownComponent]
})
export class HeaderComponent {

  authService = inject(AuthService);
  searchService = inject(SearchService);

    
}

