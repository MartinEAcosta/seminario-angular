import { Component, computed, input } from '@angular/core';

// Avatar + nombre del profesor de un curso. Dos variantes: "inline" (hero,
// avatar chico) y "card" (sección "Tu profesor", agrega bio). Sin
// `avatarUrl`, el avatar cae a iniciales — mismo patrón que el resto de la
// app no tiene todavía resuelto en ningún otro lado.
@Component({
  selector: 'app-course-instructor',
  imports: [],
  templateUrl: './course-instructor.component.html',
  styleUrl: './course-instructor.component.scss'
})
export class CourseInstructorComponent {

  name = input<string | null>(null);
  avatarUrl = input<string | null>(null);
  bio = input<string | null>(null);
  variant = input<'inline' | 'card'>('inline');

  isCard = computed( () => this.variant() === 'card' );
  hasAvatarUrl = computed( () => !!this.avatarUrl() );
  displayName = computed( () => this.name()?.trim() || 'Profesor' );
  hasBio = computed( () => this.isCard() && !!this.bio()?.trim() );

  initials = computed( () => {
    const words = this.name()?.trim().split(/\s+/).filter(Boolean) ?? [];
    if ( words.length === 0 ) return '?';
    const first = words[0][0];
    const last = words.length > 1 ? words[words.length - 1][0] : '';
    return `${first}${last}`.toUpperCase();
  });
}
