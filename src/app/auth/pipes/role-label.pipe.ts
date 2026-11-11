import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'roleLabel'
})

export class RoleLabelPipe implements PipeTransform {
    transform(value: any, ...args: any[]): any {
        const roleLabels: Record<string, string> = {
            student: 'Estudiante',
            teacher: 'Profesor',
            admin: 'Administrador'
        };
        return roleLabels[value] || value;
    }
}