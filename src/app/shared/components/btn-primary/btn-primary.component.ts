import { NgClass } from '@angular/common';
import { Component, input,  } from '@angular/core';

@Component({
    selector: 'app-btn-primary',
    templateUrl: './btn-primary.component.html',
    styleUrl: './btn-primary.component.scss',
    imports : [ NgClass ]
})
export class BtnPrimaryComponent {

    isNotAvailable = input.required<boolean>();


}
