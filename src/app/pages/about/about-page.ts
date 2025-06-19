/*
    Path:PORT/about
*/
import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
    selector: 'app-about',
    templateUrl: './about-page.html',
    styleUrl: './about-page.scss',
    imports: [HeaderComponent, FooterComponent]
})
export class AboutComponent {

}
