import { FormGroup } from "@angular/forms";
import { ModuleListResponse , ModulePopulatedListResponse, ModuleUniqueResponse } from "../shared/models/api.interface";
import { Module, ModulePopulated } from "../module/models/module.interfaces";

export class ModuleMapper {


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


    static mapResponseToModulePopulated = ( response : ModulePopulated ) : ModulePopulated  => {
        return {
            id        : response.id,
            id_course : response.id_course,
            title : response.title,
            lessons : response.lessons.map( lesson => {
                return {
                    title: lesson.title,
                    id: lesson.id
                }
            }) || [],
            unit : response.unit,
        };
    }

    static mapResponseToModulePopulatedArray = ( response : ModulePopulatedListResponse ) : ModulePopulated[] => {
        return response.data.map( this.mapResponseToModulePopulated );
    }

}