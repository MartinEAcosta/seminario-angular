import { Component, computed, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CartService } from '@cart/state/cart.service';
import { EnrollmentState } from '@enrollment/state/enrollment-state';
import { Order } from '@payment/models/order.interface';

@Component({
  selector: 'app-buy-confirmation-page',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './buy-confirmation-page.html',
  styleUrl: './buy-confirmation-page.scss'
})
export class BuyConfirmationPage implements OnInit {

  private cartService = inject(CartService);
  private enrollmentState = inject(EnrollmentState);

  // La orden se pasa por navegación (router.navigate state), no por query params, para no
  // dejar datos de pago en la URL. No sobrevive a un refresh: en ese caso queda null y
  // mostramos el estado "desconocido" en vez de asumir éxito o fracaso.
  public order : Order | null = history.state?.['order'] ?? null;

  // Sólo relevante en 'approved': los cursos recién inscriptos, con título/miniatura,
  // cruzando order.courseIds (la orden no trae esos datos) contra la lista de
  // inscripciones que ngOnInit() recarga.
  public enrolledCourses = computed(() => {
    const courseIds = this.order?.courseIds ?? [];
    if (courseIds.length === 0) return [];
    return this.enrollmentState.enrollmentList()
      .filter((enrollment) => courseIds.includes(enrollment.course.id_course));
  });

  ngOnInit() : void {
    // El backend ya generó las inscripciones cuando el pago quedó aprobado, así que el
    // carrito no tiene más razón de existir. Si quedó pendiente o rechazado se conserva
    // para que el usuario pueda reintentar sin volver a armarlo.
    if( this.order?.status === 'approved' ) {
      this.cartService.clearCart();
      this.enrollmentState.enrollmentListResource.reload();
    }
  }

}
