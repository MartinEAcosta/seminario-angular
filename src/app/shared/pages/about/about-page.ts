import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type AboutSectionId = 'hero' | 'spotlight' | 'grid' | 'cta';

@Component({
    selector: 'app-about',
    templateUrl: './about-page.html',
    styleUrl: './about-page.scss',
    imports: [RouterLink]
})
export default class AboutComponent implements AfterViewInit, OnDestroy {

    @ViewChild('heroSection') heroSection!: ElementRef<HTMLElement>;
    @ViewChild('spotlightSection') spotlightSection!: ElementRef<HTMLElement>;
    @ViewChild('gridSection') gridSection!: ElementRef<HTMLElement>;
    @ViewChild('ctaSection') ctaSection!: ElementRef<HTMLElement>;

    visibleSections = signal<Set<AboutSectionId>>(new Set());

    private observer?: IntersectionObserver;

    ngAfterViewInit(): void {
        const sections: [AboutSectionId, ElementRef<HTMLElement>][] = [
            ['hero', this.heroSection],
            ['spotlight', this.spotlightSection],
            ['grid', this.gridSection],
            ['cta', this.ctaSection],
        ];

        this.observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;

                const id = sections.find(([, ref]) => ref.nativeElement === entry.target)?.[0];
                if (!id) continue;

                this.visibleSections.update(set => new Set(set).add(id));
                this.observer?.unobserve(entry.target);
            }
        }, { threshold: 0.15 });

        for (const [, ref] of sections) {
            this.observer.observe(ref.nativeElement);
        }
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }
}