import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { AuthService } from '@auth/services/auth.service';
import { EnrollmentService } from '@enrollment/services/enrollment.service';


@Injectable({
  providedIn: 'root'
})
export class EnrollmentState {

  private enrollmentService = inject(EnrollmentService);
  private authService = inject(AuthService);

  // Devolver `undefined` es la única forma de que el resource NO dispare la petición.
  // Con `null` el resource considera el parámetro válido y pega a /enrollments/null.
  private requestedEnrollmentId = signal<string | undefined>(undefined);

  enrollmentListResource = rxResource({
    params: () => this.authService.authStatus() === 'authenticated'
      ? this.authService.user()!.id
      : undefined,
    stream: ({ params: id }) => this.enrollmentService.getEnrollmentsByUserId(id),
  });

  enrollmentResource = rxResource({
    params: () => this.requestedEnrollmentId(),
    stream: ({ params: id }) => this.enrollmentService.getEnrollmentPopulatedById(id),
  });

  enrollmentList = computed(() => this.enrollmentListResource.value() ?? []);
  isLoadingList = computed(() => this.enrollmentListResource.isLoading());
  listError = computed(() => this.enrollmentListResource.error());
 
  selectedEnrollment = computed(() => this.enrollmentResource.value() ?? null);
  isLoading = computed(() => this.enrollmentResource.isLoading());
  error = computed(() => this.enrollmentResource.error());

  loadEnrollment(id: string) {
    this.requestedEnrollmentId.set(id);
  }

}
