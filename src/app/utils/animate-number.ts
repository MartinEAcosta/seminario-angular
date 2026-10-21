// Tween numérico vía rAF con ease-out cúbico. Usado para que el total del carrito
// "cuente" hacia el nuevo valor en vez de saltar, al cambiar cantidad o cupón.
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const animateNumber = (
  from: number,
  to: number,
  onUpdate: (value: number) => void,
  duration = 450,
): void => {
  if (from === to) {
    onUpdate(to);
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    onUpdate(to);
    return;
  }

  const start = performance.now();

  const step = (now: number): void => {
    const progress = Math.min((now - start) / duration, 1);
    onUpdate(from + (to - from) * easeOutCubic(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};
