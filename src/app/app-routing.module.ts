import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UdemixAboutComponent } from './udemix-about/udemix-about.component';

const routes: Routes = [
  { path : '' , component: UdemixAboutComponent  },
  { path : 'about' , component: UdemixAboutComponent  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
