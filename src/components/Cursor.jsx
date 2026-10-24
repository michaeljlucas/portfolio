// Custom cursor: a small dot right on the pointer and a larger, fainter one that trails behind it and
// settles back around it when the mouse stops. The small one shows whatever is underneath it inverted
// in pure black or white (black over light things, white over dark ones); the large one brightens it (overlay), keeping its colours instead of
// greying them the way a faint inversion does. Over anything clickable the small dot grows a bit
// past the large dot's size.
// Mouse only: on touch screens nothing is drawn and the normal cursor is left alone.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

const DOT_SIZE = 16;        // px, the small dot
const RING_SIZE = 46;       // px, the large dot
const HOVER_SIZE = RING_SIZE * 1.25; // px, the small dot over anything clickable
const DOT_FILTER = "grayscale(1) invert(1) contrast(1000)";
const RING_OPACITY = 0.6;   // how strongly the large dot brightens what's under it
const DOT_FOLLOW = 0.08;    // s the small dot takes to catch up (near instant)
const RING_FOLLOW = 0.5;    // s the large dot takes to catch up (the lag)
// What counts as clickable. The project cards' videos and titles open the project but aren't links.
const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, .projectCard, .cardTitle';
const HOVER_GROW = { duration: 0.3, ease: "power3.out" };

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  // Only for a real mouse; checked once on load
  const [enabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  useEffect(() => {
    if (!enabled) return;
    // Hides the system cursor everywhere (see .has-custom-cursor in index.css)
    document.documentElement.classList.add('has-custom-cursor');

    const els = [dot.current, ring.current];
    gsap.set(els, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const dotX = gsap.quickTo(dot.current, "x", { duration: DOT_FOLLOW, ease: "power3.out" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: DOT_FOLLOW, ease: "power3.out" });
    const ringX = gsap.quickTo(ring.current, "x", { duration: RING_FOLLOW, ease: "power3.out" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: RING_FOLLOW, ease: "power3.out" });

    let shown = false;
    let overInteractive = false;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      // Grow the small dot to HOVER_SIZE over anything clickable, shrink it back off it
      const over = !!e.target.closest?.(INTERACTIVE);
      if (over !== overInteractive) {
        overInteractive = over;
        gsap.to(dot.current, { scale: over ? HOVER_SIZE / DOT_SIZE : 1, ...HOVER_GROW, overwrite: "auto" });
      }
      if (!shown) {
        // First movement (or back in the window): start both dots on the pointer, not sliding in from the corner
        gsap.set(els, { x: e.clientX, y: e.clientY });
        gsap.to(dot.current, { autoAlpha: 1, duration: 0.2 });
        gsap.to(ring.current, { autoAlpha: RING_OPACITY, duration: 0.2 });
        shown = true;
      }
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    };
    const onLeave = () => {
      gsap.to(els, { autoAlpha: 0, duration: 0.2 });
      shown = false;
    };

    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  // Straight into <body> so nothing on the page puts them in its own stacking context (which would
  // stop the inverting from seeing what's behind them)
  return createPortal(
    <>
      <div ref={ring} style={{ ...styles.base, ...styles.ring }} aria-hidden="true" />
      <div ref={dot} style={{ ...styles.base, ...styles.dot }} aria-hidden="true" />
    </>,
    document.body,
  );
}

const styles = {
  base: {
    position: "fixed",
    top: 0,
    left: 0,
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 10000, // above the nav, the project pages and the page transition
  },
  // Filters what's behind it: drop the colour, invert it, then push every pixel to black or white
  dot: {
    width: `${DOT_SIZE}px`,
    height: `${DOT_SIZE}px`,
    backdropFilter: DOT_FILTER,
    WebkitBackdropFilter: DOT_FILTER, // Safari
  },
  ring: {
    background: "white",
    mixBlendMode: "overlay",
    width: `${RING_SIZE}px`,
    height: `${RING_SIZE}px`, // faded to RING_OPACITY once the mouse moves
  },
};
