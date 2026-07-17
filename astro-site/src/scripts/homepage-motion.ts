import { animate, inView } from 'motion';
import { getRevealTransition, getHoverLift, getOrbAnimation } from '../lib/homepage-motion-config';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initScrollReveal() {
  const reduced = prefersReducedMotion();
  const targets = document.querySelectorAll<HTMLElement>(
    '.hp-hero-copy, .hp-hero-photo, .stat-band-item, .service-card, .testimonial-card'
  );
  const t = getRevealTransition(reduced);
  targets.forEach((el) => {
    el.style.opacity = String(t.opacity[0]);
    inView(
      el,
      () => {
        animate(el, { opacity: t.opacity, y: t.y }, { duration: t.duration, ease: t.easing });
      },
      { margin: '0px 0px -10% 0px' }
    );
  });
}

function initHoverLift() {
  const reduced = prefersReducedMotion();
  const lift = getHoverLift(reduced);
  if (lift.duration === 0) return;
  const targets = document.querySelectorAll<HTMLElement>('.btn-primary, .btn-outline, .service-card');
  targets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      animate(el, { scale: lift.scale, y: lift.y }, { duration: lift.duration });
    });
    el.addEventListener('mouseleave', () => {
      animate(el, { scale: 1, y: 0 }, { duration: lift.duration });
    });
  });
}

function initOrbAnimation() {
  const reduced = prefersReducedMotion();
  const orbConfig = getOrbAnimation(reduced);
  if (!orbConfig) return;
  const rotating = document.querySelectorAll<HTMLElement>('.hp-orb-a');
  rotating.forEach((el) => {
    animate(el, { rotate: 360 }, { duration: orbConfig.rotateDurationSeconds, repeat: Infinity, ease: 'linear' });
  });
  const pulsing = document.querySelectorAll<HTMLElement>('.hp-orb-b');
  pulsing.forEach((el) => {
    animate(
      el,
      { scale: [1, 1.12, 1] },
      { duration: orbConfig.pulseDurationSeconds, repeat: Infinity, ease: 'easeInOut' }
    );
  });
}

export function initHomepageMotion() {
  initScrollReveal();
  initHoverLift();
  initOrbAnimation();
}

initHomepageMotion();
