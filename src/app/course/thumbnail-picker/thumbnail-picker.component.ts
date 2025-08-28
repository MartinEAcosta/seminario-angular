import { Component, inject, signal } from '@angular/core';
import { FileService } from 'src/app/shared/services/file/file.service';

@Component({
  selector: 'app-thumbnail-picker',
  imports: [],
  templateUrl: './thumbnail-picker.component.html',
  styleUrl: './thumbnail-picker.component.scss'
})
export class ThumbnailPickerComponent {

  private fileService = inject(FileService);

  onThumbnailChanged = ( event : Event ) => {
    const thumbnailChanged = ( event.target as HTMLInputElement ).files;
    if( !thumbnailChanged ) return;

    // En caso de que el el fileList no sea undefined o vacio, permite generar url para utilizar de forma local
    const imageUrl = Array.from( thumbnailChanged ?? [ ] )
                                                  .map( 
                                                        (file) => URL.createObjectURL(file)
                                                  );

    this.fileService.tempThumbnail.set( imageUrl.shift() );
    this.fileService.thumbnailFile = thumbnailChanged[0];
  }

}
