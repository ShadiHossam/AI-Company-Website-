export type RevealTransition = {
  opacity: [number, number];
  y: [number, number];
  duration: number;
  easing: [number, number, number, number] | 'linear';
};

export function getRevealTransition(prefersReducedMotion: boolean): RevealTransition {
  if (prefersReducedMotion) {
    return { opacity: [1, 1], y: [0, 0], duration: 0, easing: 'linear' };
  }
  return { opacity: [0, 1], y: [16, 0], duration: 0.5, easing: [0.16, 1, 0.3, 1] };
}

export type HoverLift = {
  scale: number;
  y: number;
  duration: number;
};

export function getHoverLift(prefersReducedMotion: boolean): HoverLift {
  if (prefersReducedMotion) {
    return { scale: 1, y: 0, duration: 0 };
  }
  return { scale: 1.015, y: -2, duration: 0.2 };
}

export type OrbAnimation = {
  rotateDurationSeconds: number;
  pulseDurationSeconds: number;
};

export function getOrbAnimation(prefersReducedMotion: boolean): OrbAnimation | null {
  if (prefersReducedMotion) {
    return null;
  }
  return { rotateDurationSeconds: 18, pulseDurationSeconds: 4 };
}
