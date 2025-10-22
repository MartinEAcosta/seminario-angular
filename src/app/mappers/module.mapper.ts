import { FormGroup } from "@angular/forms";
import { ModuleListResponse , ModuleUniqueResponse } from "../shared/models/api.interface";
import { Module } from "../module/models/module.interfaces";

export class ModuleMapper {

    // static mapToCreateModuleDto = ( form : FormGroup ) : SaveModuleDto => {
    //     return {
    //         title : form.get('title')?.value,
    //         description : form.get('description')?.value,
    //         unit : form.get('unit')?.value ?? 0,
    //         chapter : form.get('chapter')?.value ?? 0,
    //     };
    // };

    static mapResponseToModule = ( response : ModuleUniqueResponse ) : Module => {
        return {
            id        : response.id,
            id_course : response.id_course,
            title : response.title,
            lessons : response.lessons,
            unit : response.unit,
        };
    }

    static mapResponseToModuleArray = ( response : ModuleListResponse ) : Module[] => {
        return response.data.map( this.mapResponseToModule );
    }

}