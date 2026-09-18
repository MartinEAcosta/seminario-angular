import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserState } from '@user/state/user-state';
import { SearchService } from '@shared/services/search/search.service';
import { UserProfileDropdownComponent } from '../../../../user/components/user-profile-dropdown/user-profile-dropdown.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [RouterLink, UserProfileDropdownComponent]
})
export class HeaderComponent {

  userState = inject(UserState);
  searchService = inject(SearchService);

    
}

