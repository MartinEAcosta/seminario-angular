import { Component, DestroyRef, NgZone, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

import { UserState } from '@user/state/user-state';
import { SearchService } from '@shared/services/search/search.service';
import { UserProfileDropdownComponent } from '../../../../user/components/user-profile-dropdown/user-profile-dropdown.component';

const DARK_HERO_ROUTES = ['/', '/about'];
const SCROLL_THRESHOLD = 48;

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [RouterLink, UserProfileDropdownComponent]
})
export class HeaderComponent {

  userState = inject(UserState);
  searchService = inject(SearchService);

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);

  private currentUrl = signal(this.router.url);
  private isScrolled = signal(window.scrollY > SCROLL_THRESHOLD);

  private hasDarkHero = computed(() => DARK_HERO_ROUTES.includes(this.currentUrl()));

  isTransparentTop = computed(() => this.hasDarkHero() && !this.isScrolled());

  // El header sticky reserva su propio alto en el flujo normal; en rutas con
  // hero oscuro se superpone al contenido (margin negativo) para que el hero
  // quede visible detrás del header transparente/glass sin tocar esas páginas.
  overlaysDarkHero = computed(() => this.hasDarkHero());

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.currentUrl.set(this.router.url));

    const onScroll = () => this.ngZone.run(() => this.isScrolled.set(window.scrollY > SCROLL_THRESHOLD));
    this.ngZone.runOutsideAngular(() => window.addEventListener('scroll', onScroll, { passive: true }));
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
  }
}

