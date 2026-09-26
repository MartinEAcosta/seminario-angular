import { Component, ElementRef, EventEmitter, HostListener, Output, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-publish-status-menu',
  imports: [],
  templateUrl: './publish-status-menu.component.html',
  styleUrl: './publish-status-menu.component.scss'
})
export class PublishStatusMenuComponent {

  private elementRef = inject(ElementRef);

  isHidden = input.required<boolean>();
  publishedLabel = input('Publicada');
  draftLabel = input('Borrador');
  entityLabel = input('elemento');
  showDelete = input(false);

  @Output()
  toggleVisibility = new EventEmitter<void>();

  @Output()
  edit = new EventEmitter<void>();

  @Output()
  deleteItem = new EventEmitter<void>();

  isMenuOpen = signal(false);

  toggleMenu = () => {
    this.isMenuOpen.set( !this.isMenuOpen() );
  }

  closeMenu = () => {
    this.isMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick ( event : MouseEvent ) : void {
    if( this.isMenuOpen() && !this.elementRef.nativeElement.contains(event.target as Node) ){
      this.closeMenu();
    }
  }

}
