import { describe, it, expect } from 'vitest';
import { getRevealTransition, getHoverLift, getOrbAnimation } from '../../lib/homepage-motion-config';

describe('getRevealTransition', () => {
  it('returns a slide-up fade-in transition when motion is allowed', () => {
    const t = getRevealTransition(false);
    expect(t).toEqual({ opacity: [0, 1], y: [16, 0], duration: 0.5, easing: [0.16, 1, 0.3, 1] });
  });

  it('returns an instant, motionless transition when reduced motion is requested', () => {
    const t = getRevealTransition(true);
    expect(t).toEqual({ opacity: [1, 1], y: [0, 0], duration: 0, easing: 'linear' });
  });
});

describe('getHoverLift', () => {
  it('returns a subtle lift when motion is allowed', () => {
    const t = getHoverLift(false);
    expect(t).toEqual({ scale: 1.015, y: -2, duration: 0.2 });
  });

  it('returns no movement when reduced motion is requested', () => {
    const t = getHoverLift(true);
    expect(t).toEqual({ scale: 1, y: 0, duration: 0 });
  });
});

describe('getOrbAnimation', () => {
  it('returns slow ambient rotation/pulse config when motion is allowed', () => {
    const t = getOrbAnimation(false);
    expect(t).toEqual({ rotateDurationSeconds: 18, pulseDurationSeconds: 4 });
  });

  it('returns null (no animation) when reduced motion is requested', () => {
    expect(getOrbAnimation(true)).toBeNull();
  });
});
