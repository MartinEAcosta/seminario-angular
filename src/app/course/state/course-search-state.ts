import { Injectable, linkedSignal } from "@angular/core";
import { CourseQueryMapper } from "@mappers/course-query.mapper";
import { CourseSearchQuery } from "@shared/search/models/course-search.model";
import { SearchState } from "@shared/search/state/search-state";

@Injectable()
export class CourseSearchState extends SearchState<CourseSearchQuery> {
    
    textParam = this.query().title ?? '';
    // LinkedSignal es utilizado para crear una señal que esta vinculada exactamente a otro estado.
    // En vez de pasar un valor por default se toma el mismo de una función computada.
    textSearch = linkedSignal(() => this.textParam);

    constructor() { super(CourseQueryMapper) }   
    
    reset(): void {
        this.textSearch.set('');
        this.textParam = '';
    }

}