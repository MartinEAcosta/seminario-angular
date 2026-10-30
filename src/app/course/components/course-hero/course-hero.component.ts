import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CoursePopulated } from '@course/models/course.interfaces';
import { ModulePopulated } from '@module/models/module.interfaces';
import { CourseInstructorComponent } from '@course/components/course-instructor/course-instructor.component';
import { computeModuleStats, formatDuration } from '@utils/module-stats';

// Hero de /course/:id. Los módulos llegan ya cargados desde course-page (una
// sola fuente, no cada componente con su propio fetch) para que estos badges
// y los de list-of-content muestren siempre el mismo conteo.
@Component({
  selector: 'app-course-hero',
  imports: [RouterLink, CourseInstructorComponent],
  templateUrl: './course-hero.component.html',
  styleUrl: './course-hero.component.scss'
})
export class CourseHeroComponent {

  course = input.required<CoursePopulated>();
  modules = input<ModulePopulated[]>([]);

  stats = computed( () => computeModuleStats( this.modules() ) );
  durationLabel = computed( () => formatDuration( this.stats().totalDurationMinutes ) );

  // Sólo se usa en mobile: ahí la portada sube al hero porque el panel de
  // compra se convierte en la barra fija de abajo, que no la muestra.
  hasThumbnail = computed( () => !!this.course().thumbnail_url );
}
