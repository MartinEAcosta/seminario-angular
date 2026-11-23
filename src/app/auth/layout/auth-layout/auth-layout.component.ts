import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  private router = inject(Router);
  private currentUrl = signal(this.router.url);

  isRegisterRoute = computed(() => this.currentUrl().includes('/register'));

  subtitle = computed(() =>
    this.isRegisterRoute()
      ? 'Creá tu cuenta gratis y empezá cuando quieras. Sin pasos de más.'
      : 'Ingresá para seguir donde lo dejaste, o creá tu cuenta en un minuto.'
  );

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.currentUrl.set(this.router.url));
  }

}
