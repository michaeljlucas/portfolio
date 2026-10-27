// Photography page: every image in src/assets/photography/, in equal-width columns (three, or two on
// small screens). Each photo keeps its own aspect ratio, so the columns stack like a masonry wall.
// Hovering a photo darkens it; clicking opens it full size in a modal. Opened from the About page.
//
// To add or remove photos, drop them into (or delete them from) src/assets/photography/. They're
// picked up automatically and shown in filename order, so prefix names with numbers
// (01-…, 02-…) to choose the order.
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

// Vite lists the folder at build time and hands back each file's URL
const files = import.meta.glob('../assets/photography/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
});
const PHOTOS = Object.keys(files)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((path) => ({ src: files[path], name: path.split('/').pop() }));

const COLUMNS = 3;
const MOBILE_COLUMNS = 2;
const MOBILE_QUERY = "(max-width: 799px)"; // same breakpoint as the rest of the site
const GAP = 16; // px, between the columns and between photos in a column
const HOVER_DARKEN = 0.3; // opacity of the black layer over a hovered photo
const MODAL_IN = { duration: 0.35, ease: "power2.out" };
const MODAL_OUT = { duration: 0.25, ease: "power2.in" };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

function Photography() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(null); // index of the photo in the modal, or null
  const opener = useRef(null); // the photo that was clicked, to hand focus back to on close

  const openPhoto = (index, e) => {
    opener.current = e.currentTarget;
    setOpen(index);
  };
  const closePhoto = () => {
    setOpen(null);
    opener.current?.focus({ preventScroll: true });
  };

  return (
    <article style={styles.page}>
      <h1 style={styles.heading}>Photography</h1>
      {PHOTOS.length > 0 ? (
        // CSS columns fill top to bottom, column by column, and balance the columns' heights
        <div style={{ ...styles.columns, columnCount: isMobile ? MOBILE_COLUMNS : COLUMNS }}>
          {PHOTOS.map(({ src, name }, index) => (
            <Photo key={name} src={src} onOpen={(e) => openPhoto(index, e)} />
          ))}
        </div>
      ) : (
        <p style={styles.empty}>No photos yet. Add some to src/assets/photography/.</p>
      )}
      {open !== null && <PhotoModal src={PHOTOS[open].src} onClose={closePhoto} />}
    </article>
  );
}

export default Photography;

// One photo in the columns: a button, so it can be clicked or tabbed to and opened with Enter
function Photo({ src, onOpen }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      style={styles.photoButton}
      onClick={onOpen}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      aria-label="View photo"
    >
      <img src={src} alt="" loading="lazy" style={styles.photo} />
      <span style={{ ...styles.darken, opacity: hovered ? HOVER_DARKEN : 0 }} aria-hidden="true" />
    </button>
  );
}

// Full-size view over everything (portalled into <body>, above the nav). Closes with the ×, Escape,
// or a click on the dark backdrop around the photo.
function PhotoModal({ src, onClose }) {
  const backdrop = useRef(null);
  const image = useRef(null);
  const closeButton = useRef(null);
  const closing = useRef(false);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    gsap.to(image.current, { scale: 0.96, ...MODAL_OUT });
    gsap.to(backdrop.current, { opacity: 0, ...MODAL_OUT, onComplete: onClose });
  };

  useEffect(() => {
    // Opacity only (not autoAlpha): a visibility: hidden modal couldn't take focus straight away
    gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, ...MODAL_IN });
    gsap.fromTo(image.current, { scale: 0.96 }, { scale: 1, ...MODAL_IN });
    closeButton.current.focus({ preventScroll: true });

    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      ref={backdrop}
      style={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Photo"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <img ref={image} src={src} alt="" style={styles.modalImage} />
      <button ref={closeButton} type="button" style={styles.closeButton} onClick={close} aria-label="Close">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>
    </div>,
    document.body,
  );
}

const styles = {
  // Same column as the About page
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 20px 120px",
    boxSizing: "border-box",
  },
  heading: {
    margin: "0 0 40px",
  },
  columns: {
    columnGap: `${GAP}px`,
  },
  photoButton: {
    position: "relative", // for the darkening layer
    display: "block",
    width: "100%",
    padding: 0,
    margin: `0 0 ${GAP}px`, // same as columnGap
    border: "none",
    background: "none",
    cursor: "pointer",
    breakInside: "avoid", // never split a photo across two columns
  },
  photo: {
    display: "block",
    width: "100%",
    height: "auto",
  },
  darken: {
    position: "absolute",
    inset: 0,
    background: "#000",
    transition: "opacity 0.3s ease",
    pointerEvents: "none",
  },
  empty: {
    color: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 2000, // above the nav (1000) and the page transition layers; the cursor (10000) stays on top
    background: "rgba(10, 10, 10, 0.92)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 20px", // room for the × above the photo
    boxSizing: "border-box",
    opacity: 0, // until it fades in
  },
  // As large as fits the screen, never cropped or stretched
  modalImage: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    border: "none",
    background: "none",
    color: "#ffffff",
    cursor: "pointer",
  },
};
