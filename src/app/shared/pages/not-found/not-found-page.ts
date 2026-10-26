import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found-page.html',
    styleUrl: './not-found-page.scss',
    imports: [RouterLink]
})
export default class NotFoundComponent { }
