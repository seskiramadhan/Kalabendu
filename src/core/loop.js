export const STEP = 1 / 60;
const MAX_STEPS = 5;

// Fixed 60 Hz logic, render once per animation frame.
export function startLoop({ update, render, isPaused }) {
  let last = performance.now();
  let acc = 0;
  let frames = 0;
  let fpsTime = 0;
  const stats = { fps: 0 };

  function frame(now) {
    const elapsed = Math.min((now - last) / 1000, 0.25);
    last = now;
    acc = isPaused() ? 0 : acc + elapsed;
    let steps = 0;
    while (acc >= STEP && steps < MAX_STEPS) {
      update(STEP);
      acc -= STEP;
      steps++;
    }
    if (steps === MAX_STEPS) acc = 0;
    render(now / 1000, elapsed);

    frames++;
    fpsTime += elapsed;
    if (fpsTime >= 0.5) {
      stats.fps = Math.round(frames / fpsTime);
      frames = 0;
      fpsTime = 0;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    stats,
    resetClock() {
      last = performance.now();
      acc = 0;
    },
  };
}
