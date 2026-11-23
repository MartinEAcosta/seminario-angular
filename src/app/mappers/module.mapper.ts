import { ApiResponse } from "@shared/models/api.response";
import { ModulePopulatedResponseDto, ModuleResponseDto } from "@module/models/module.response";
import { Module, ModuleDTO, ModulePopulated } from "@module/models/module.model";

export class ModuleMapper {

    static mapResponseToModule = ( response : ModuleResponseDto ) : Module => {
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

    static mapResponseToModuleArray = ( response : ApiResponse<ModuleResponseDto[]> ) : Module[] => {
        return response.data.map( this.mapResponseToModule );
    }

    static mapResponseToModulePopulated = ( response : ModulePopulatedResponseDto ) : ModulePopulated  => {
        return {
            id        : response.id,
            id_course : response.id_course,
            title : response.title,
            lessons : ( response.lessons ?? [] ).map( lesson => {
                return {
                    id: lesson.id,
                    title: lesson.title,
                    content_type: lesson.content_type ?? null,
                    duration_minutes: lesson.duration_minutes ?? null,
                }
            }),
            unit : response.unit,
        };
    }

    static mapResponseToModulePopulatedArray = ( response : ApiResponse<ModulePopulatedResponseDto[]> ) : ModulePopulated[] => {
        return response.data.map( this.mapResponseToModulePopulated );
    }

}