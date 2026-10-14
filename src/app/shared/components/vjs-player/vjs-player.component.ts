import {Component, ElementRef, input, OnDestroy, OnInit, viewChild, ViewEncapsulation} from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

@Component({
  selector: 'app-vjs-player',
  templateUrl: './vjs-player.component.html',
  styleUrls: [ './vjs-player.component.scss' ],
  encapsulation: ViewEncapsulation.None,
})

export class VjsPlayerComponent implements OnInit, OnDestroy {
  target = viewChild.required<ElementRef>('target');

  // See options: https://videojs.com/guides/options
  options = input.required<{
      fluid: boolean,
      aspectRatio: string,
      autoplay: boolean,
      sources: {
          src: string,
          type: string,
      }[],
      language: string,
  }>();

  player!: Player;

  constructor(
    private elementRef: ElementRef,
  ) {  }

  // Instantiate a Video.js player OnInit
  ngOnInit() {
    this.player = videojs(this.target().nativeElement, this.options(), function onPlayerReady() {
      console.log('onPlayerReady', this);
    });
  }

  // Dispose the player OnDestroy
  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
}