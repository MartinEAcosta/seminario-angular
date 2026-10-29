import { ModuleListResponse , ModulePopulatedListResponse, ModuleUniqueResponse } from "@shared/models/api.interfaces";
import { Module, ModuleDTO, ModulePopulated } from "@module/models/module.interfaces";

export class ModuleMapper {

    static mapResponseToModule = ( response : ModuleUniqueResponse ) : Module => {
        console.log( response )
        return {
            id        : response.id,
            id_course : response.id_course,
            title : response.title,
            lessons : response.lessons ?? [],
            unit : response.unit,
        };
    }

    static mapToModuleDto = ( formValues : ModuleDTO ) : ModuleDTO => {
        return {
            id : formValues.id ?? undefined,
            // Tecnicamente no es del formulario pero es injectada a el.
            id_course : formValues.id_course,
            title : formValues.title,
            unit : formValues.unit,
        }
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
                    id: lesson.id,
                    title: lesson.title,
                    content_type: lesson.content_type ?? null,
                    duration_minutes: lesson.duration_minutes ?? null,
                }
            }) || [],
            unit : response.unit,
        };
    }

    static mapResponseToModulePopulatedArray = ( response : ModulePopulatedListResponse ) : ModulePopulated[] => {
        return response.data.map( this.mapResponseToModulePopulated );
    }

}