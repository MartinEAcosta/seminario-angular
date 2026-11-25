import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [NgClass],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {

  pages = input(0);
  currentPage = input<number>(1);
  // Avisa qué página se eligió; quién lo usa decide qué hacer (URL, estado local, etc).
  pageChange = output<number>();

  getPagesList = computed(() => Array.from({ length: this.pages() }, (_, i) => i + 1));

  hasPrev = computed(() => this.currentPage() > 1);
  hasNext = computed(() => this.currentPage() < this.pages());
  prevPage = computed(() => Math.max(1, this.currentPage() - 1));
  nextPage = computed(() => Math.min(this.pages(), this.currentPage() + 1));

  goTo = (page: number): void => {
    if (page !== this.currentPage()) this.pageChange.emit(page);
  }
}
