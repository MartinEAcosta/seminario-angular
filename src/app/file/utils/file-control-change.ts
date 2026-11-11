import { FormControl } from '@angular/forms';
import { FilePreviewControl } from '@file/models/file-preview-control';
import { SelectedFile } from '@file/models/file.interfaces';

// El <input type="file"> no está bindeado por formControlName (los navegadores
// no permiten setear [value] en type="file"), así que dirty/touched del control
// hay que marcarlos a mano acá en vez de que lo haga el ControlValueAccessor.
export function applyFileControlChange( control : FormControl<File | null>, preview : FilePreviewControl, selected : SelectedFile ) : void {
  control.setValue( selected.file );
  control.markAsDirty();
  control.markAsTouched();
  preview.setPreview( selected.previewURL );
}

export function clearFileControlChange( control : FormControl<File | null>, preview : FilePreviewControl ) : void {
  control.setValue( null );
  control.markAsDirty();
  control.markAsTouched();
  preview.reset();
}
