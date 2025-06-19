/*
  Path:PORT/course/create
  Path:PORT/course/update/:id
*/
import { Component, inject  } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course/course.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { FormCourseComponent } from "../../course/form-course/form-course.component";

@Component({
    selector: 'app-course-create',
    templateUrl: './course-handler-page.html',
    styleUrl: './course-handler-page.scss',
    imports: [HeaderComponent, ReactiveFormsModule, FooterComponent, FormCourseComponent]
})
export class CourseCreateComponent {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  courseService = inject(CourseService);
  authService = inject(AuthService);

  courseId = this.activatedRoute.snapshot.params['id'] || '';
  
  courseResource = rxResource({
    request : ( ) => ( { id : this.courseId } ),
    loader : ({ request } ) => {

      if( request.id === '' ) return of();
        
      return this.courseService.getById( request.id );
    },
  });

  
    // tempMedia = signal<string[]>([]); 
    // mediaFileList : FileList | undefined =  undefined;

  // onFileChanged = ( event : Event ) => {
  //   const fileList = ( event.target as HTMLInputElement ).files;
  //   this.mediaFileList = fileList ?? undefined;

  //   // En caso de que el el fileList no sea undefined o vacio, permite generar url para utilizar de forma local
  //   const imageUrls = Array.from( fileList ?? [ ] ).map( 
  //     (file) => URL.createObjectURL(file)
  //   );
  //   this.tempMedia.set(imageUrls);
  //   console.log(this.tempMedia());
  // }

}
