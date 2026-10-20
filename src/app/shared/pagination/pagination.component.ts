import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-pagination',
  imports: [RouterLink, NgClass],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {

  pages = input(0);
  currentPage = input<number>(1);

  getPagesList = computed( () => {
    return Array.from({ length : this.pages() } , ( _, index ) => index +1 );
  })

  hasPrev = computed( () => this.currentPage() > 1 );
  hasNext = computed( () => this.currentPage() < this.pages() );
  prevPage = computed( () => Math.max( 1 , this.currentPage() - 1 ) );
  nextPage = computed( () => Math.min( this.pages() , this.currentPage() + 1 ) );
}
