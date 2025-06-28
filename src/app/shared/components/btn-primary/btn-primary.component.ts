import { Component, input } from '@angular/core';

@Component({
    selector: 'app-btn-primary',
    templateUrl: './btn-primary.component.html',
    styleUrl: './btn-primary.component.scss',
    imports : [  ]
})
export class BtnPrimaryComponent {

    isNotAvailable = input<boolean>();

}
