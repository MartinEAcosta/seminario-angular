import { ParamMap, Params } from "@angular/router";

export interface QueryParamsMapper<T> {
    fromQueryParams( params : ParamMap ) : T;
    toQueryParams( query : T ) : Params; 
}