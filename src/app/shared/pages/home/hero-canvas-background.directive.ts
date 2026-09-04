import { AfterViewInit, Directive, ElementRef, inject, OnDestroy } from '@angular/core';

/**
 * Dibuja el fondo animado del hero ("Noise + Spotlight": grano sutil + halo radial
 * en movimiento) sobre el <canvas> al que se aplica. Ver specs/04-hero-background-noise-spotlight.md.
 *
 * En mobile (<768px) o con `prefers-reduced-motion: reduce` dibuja un único frame estático
 * en vez de animar.
 */
@Directive({
  selector: 'canvas[appHeroCanvasBackground]',
  standalone: true,
})
export class HeroCanvasBackgroundDirective implements AfterViewInit, OnDestroy {

  private static readonly BG_COLOR = '#161616';
  private static readonly ACCENT_RGB = '0,120,140';
  private static readonly NOISE_RGB = '233,233,233';
  private static readonly NOISE_TILE_SIZE = 72;
  private static readonly NOISE_TILE_COUNT = 3;
  private static readonly NOISE_SWAP_MS = 140;
  private static readonly MOBILE_QUERY = '(max-width: 768px)';
  private static readonly REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

  private readonly elementRef = inject<ElementRef<HTMLCanvasElement>>(ElementRef);

  private ctx?: CanvasRenderingContext2D;
  private noiseTiles: HTMLCanvasElement[] = [];
  private noiseTileIndex = 0;
  private lastNoiseSwap = 0;
  private canvasSize = { w: 0, h: 0 };
  private resizeObserver?: ResizeObserver;
  private animationFrameId?: number;
  private reducedMotion = false;

  ngAfterViewInit(): void {
    const canvas = this.elementRef.nativeElement;
    this.ctx = canvas.getContext('2d') ?? undefined;
    if (!this.ctx) {
      return;
    }

    this.noiseTiles = Array.from(
      { length: HeroCanvasBackgroundDirective.NOISE_TILE_COUNT },
      () => this.createNoiseTile(HeroCanvasBackgroundDirective.NOISE_TILE_SIZE),
    );

    this.resizeCanvas();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
      this.resizeObserver.observe(canvas.parentElement ?? canvas);
    } else {
      window.addEventListener('resize', this.resizeCanvas);
    }

    this.reducedMotion = window.matchMedia?.(HeroCanvasBackgroundDirective.REDUCED_MOTION_QUERY).matches ?? false;

    if (this.reducedMotion || this.isMobileViewport()) {
      this.drawFrame(0);
      return;
    }

    const loop = (timestamp: number) => {
      this.drawFrame(timestamp);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    } else {
      window.removeEventListener('resize', this.resizeCanvas);
    }
  }

  private isMobileViewport(): boolean {
    return window.matchMedia?.(HeroCanvasBackgroundDirective.MOBILE_QUERY).matches ?? false;
  }

  private resizeCanvas = (): void => {
    const canvas = this.elementRef.nativeElement;
    if (!this.ctx) {
      return;
    }

    const rect = (canvas.parentElement ?? canvas).getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    this.canvasSize = { w: width, h: height };
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (this.reducedMotion || this.isMobileViewport()) {
      this.drawFrame(0);
    }
  };

  private createNoiseTile(size: number): HTMLCanvasElement {
    const tile = document.createElement('canvas');
    tile.width = size;
    tile.height = size;
    const ctx = tile.getContext('2d');
    if (!ctx) {
      return tile;
    }

    const [r, g, b] = HeroCanvasBackgroundDirective.NOISE_RGB.split(',').map(Number);
    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = r;
      imageData.data[i + 1] = g;
      imageData.data[i + 2] = b;
      imageData.data[i + 3] = Math.random() * 16;
    }
    ctx.putImageData(imageData, 0, 0);
    return tile;
  }

  private drawFrame(timestamp: number): void {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }

    const { w, h } = this.canvasSize;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = HeroCanvasBackgroundDirective.BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    const animated = !this.reducedMotion && !this.isMobileViewport();
    const cx = animated ? w / 2 + Math.sin(timestamp * 0.00028) * w * 0.3 : w / 2;
    const cy = animated ? h / 2 + Math.cos(timestamp * 0.00021) * h * 0.32 : h / 2;
    const radius = Math.max(w, h) * 0.55;

    const spotlight = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    spotlight.addColorStop(0, `rgba(${HeroCanvasBackgroundDirective.ACCENT_RGB},0.28)`);
    spotlight.addColorStop(0.6, `rgba(${HeroCanvasBackgroundDirective.ACCENT_RGB},0.08)`);
    spotlight.addColorStop(1, `rgba(${HeroCanvasBackgroundDirective.ACCENT_RGB},0)`);
    ctx.fillStyle = spotlight;
    ctx.fillRect(0, 0, w, h);

    if (animated && timestamp - this.lastNoiseSwap > HeroCanvasBackgroundDirective.NOISE_SWAP_MS) {
      this.noiseTileIndex = (this.noiseTileIndex + 1) % this.noiseTiles.length;
      this.lastNoiseSwap = timestamp;
    }

    const activeTile = this.noiseTiles[this.noiseTileIndex];
    if (activeTile) {
      const pattern = ctx.createPattern(activeTile, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      }
    }
  }

}
