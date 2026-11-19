import { Routes } from '@angular/router';

import { HomeComponent , ExplorePage } from '@shared/pages';

export const routes: Routes = [

  { 
    path : '' , 
    component: HomeComponent,
  },

  {
    path: 'course',
    loadChildren : () => 
      import('@course/course.routes'),
  },
    
  { 
    path : 'auth' ,
    loadChildren: () =>
      import('@auth/auth.routes'),
  },  
  
  { 
    path : 'about' , 
    loadComponent: () =>
      import('@shared/pages/about/about-page'),
  },
  
  {
    path : 'enrollment',
    loadChildren: () => 
      import('@enrollment/enrollment.routes'),
  },

  {
    path : 'payment',
    loadChildren: () => 
      import('@payment/payment.routes'),
  },

  {
    path : 'explore',
    component : ExplorePage,
  },

  {
    path : 'become-teacher',
    loadChildren : () =>
      import('@teacher-request/teacher-request.routes'),
  },

  {
    // Destino de la regla de ruteo del error: cualquier flujo de AuthService que
    // reciba un 5xx navega acá. El copy sale del `data`, nunca del error real —
    // un 5xx no trae texto para el usuario y puede filtrar detalle interno.
    path : 'error',
    loadComponent: () =>
      import('@shared/pages/error/error-page'),
    data : {
      code    : 500,
      eyebrow : 'Error del servidor',
      badge   : 'Error 500 · algo falló de nuestro lado',
      title   : 'Algo falló de nuestro lado',
      message : 'Ya estamos viéndolo. Probá de nuevo en unos minutos.',
    },
  },

  {
    // En caso de no hacer match con ningun path muestra la página de error 404
    path : '**',
    loadComponent: () =>
      import('@shared/pages/error/error-page'),
    data : {
      code    : 404,
      eyebrow : 'Página no encontrada',
      badge   : 'Error 404 · la ruta no existe',
      title   : 'Esta página no existe',
      message : 'Puede que el link esté mal escrito o que el curso ya no esté publicado.',
    },
  }
  
];

