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
}
