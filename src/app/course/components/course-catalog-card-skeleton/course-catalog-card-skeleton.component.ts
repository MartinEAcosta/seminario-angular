import { Component } from '@angular/core';

// Placeholder de carga de app-course-catalog-card: mismo contrato de tamaño
// (--catalog-card-width/height) para que ocupe exactamente la misma celda
// de grilla o del carrusel mientras se resuelve la petición real.
@Component({
  selector: 'app-course-catalog-card-skeleton',
  imports: [],
  templateUrl: './course-catalog-card-skeleton.component.html',
  styleUrl: './course-catalog-card-skeleton.component.scss'
})
export class CourseCatalogCardSkeletonComponent { }
