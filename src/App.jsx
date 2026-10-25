import { useState, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'
import './App.css'
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MeshGradient, Dithering } from '@paper-design/shaders-react';

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Observer } from "gsap/Observer";

import { projects } from './projects';
import About from './pages/About';
import Arrow from './components/Arrow';
import Cursor from './components/Cursor';
import ContactButton from './components/ContactButton';
import { ProjectContext } from './projectContext';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, MorphSVGPlugin, Observer);

// Page transition style: "drip" is the arched SVG wipe from the old site, "slides" is the two staggered panels
const SWIPE_STYLE = "drip";

const SLIDE_DURATION = 0.7;
const SLIDE_STAGGER = 0.15;
const SLIDE_EASE = "power4.inOut";
// Slides used by the swipe, bottom to top. Drop '.slide2' for a single-slide swipe.
const SLIDES = ['.slide1', '.slide2'];
// "y": opening a project brings the slides up from below, going back brings them down from the top.
// "x": opening sweeps left → right, going back sweeps right → left.
const SLIDE_AXIS = "y";
// Which transform the swipe animates, and which way "opening" travels along it
const SLIDE_PROP = SLIDE_AXIS === "y" ? "yPercent" : "xPercent";
const SLIDE_SIGN = SLIDE_AXIS === "y" ? -1 : 1; // y: upwards is negative

// Drip wipe (from the old site). One SVG shape stretched over the screen (0–100 on both axes),
// morphed through these outlines: it rises from the bottom with its top edge arched up,
// covers the screen, then pulls away off the top with its bottom edge arched the same way,
// so the middle leads all the way through and the sides trail.
const DRIP_COLOR = "#000000";
// Length of each of the four morph steps (so a full open or back is 4x this)
const DRIP_STEP_DURATION = 0.4;
// White fade under the wipe: the page fades to white just before the wipe comes in, and the
// new page fades up from white once the wipe has cleared
const WHITEOUT_DURATION = 0.5;
const WHITEOUT_EASE = "power1.inOut";

// "Open case study" hover (after the old site's Button): a dark fill with white text grows up from
// the bottom of the pill, the pill grows a touch and the arrow slides right. Hovering the project's
// video triggers it too.
const CASE_STUDY_HOVER = {
  fill: "#141414",
  text: "#ffffff",
  scale: 1.05,
  arrowShift: 6, // px
  // The fill is revealed by a circle growing from the bottom centre of the pill
  hidden: "circle(0% at 50% 100%)",
  shown: "circle(80% at 50% 100%)",
};
// The intro's About and Work buttons play the same hover, inverted for the dark background
const INTRO_BUTTON_HOVER = { fill: "#ffffff", text: "#141414" };

// Selecting a project: its card first sinks, shrinks and fades out to RETURN_FROM, then the page
// transition starts. Coming back plays the reverse: once the transition has finished, the card
// rises from RETURN_FROM into place.
const RETURN_FROM = { y: 70, scale: 0.94 };                   // the card's "away" state (plus autoAlpha 0)
const RETURN_TWEEN = { duration: 0.9, ease: "power3.out" };   // coming back in
// Then the cards above and below it fade in, top one first
const RETURN_NEIGHBOURS = { delay: 0.45, duration: 0.7, stagger: 0.15, ease: "power2.out" };
const SELECT_TWEEN = { duration: 0.5, ease: "power3.in" };    // going out when selected
const DRIP_STEPS = [
  "M 0 100 V 100 Q 50 100 100 100 V 100 z", // flat along the bottom (hidden)
  "M 0 100 V 50 Q 50 0 100 50 V 100 z",     // bottom half, top edge arched upwards
  "M 0 100 V 0 Q 50 0 100 0 V 100 z",       // covers the screen
  "M 0 0 V 50 Q 50 0 100 50 V 0 z",         // top half, bottom edge arched upwards (middle leads)
  "M 0 0 V 0 Q 50 0 100 0 V 0 z",           // flat along the top (hidden)
];

// Paper dithering shader behind the intro
const INTRO_SHADER = {
  colorBack: "#301c2a",
  colorFront: "#2d3553",
  shape: "warp",
  type: "2x2",
  size: 5.5,
  speed: 0.1,
  scale: 3.4,
};

// Paper mesh gradient behind the footer
const SHADER = {
  colors: ["#2189a6", "#dfa896", "#ff8c2e"],
  distortion: 0.4,
  swirl: 0.23,
  grainMixer: 0.2,
  grainOverlay: 0,
  speed: 0.64,
  offsetY: 0.06,
};

// Shared content width for the nav, intro, project cards and footer.
// 1100px matches the project pages (see components/Section.jsx).
const MAX_WIDTH = 1100;
const GUTTER = 20;

// Loading intro: the intro starts as a thin bar that fills as the page loads, then opens up
const INTRO_BAR_HEIGHT = 10;     // px, while loading
const INTRO_HEIGHT = "66vh";     // once loaded
// Small screens: text stacked above the image, so the intro opens to fit them instead of INTRO_HEIGHT.
// Same breakpoint as the project pages (components/Content.jsx).
const MOBILE_QUERY = "(max-width: 799px)";
const isMobileScreen = () => window.matchMedia(MOBILE_QUERY).matches;
const introHeight = () => (isMobileScreen() ? "auto" : INTRO_HEIGHT);
const INTRO_OPEN_DURATION = 1.1;
const INTRO_SPACE_BELOW = 80;    // px between the intro and the projects (same grey as the projects)
// Portrait image on the right of the intro. Put it in public/images/ and set its path here, e.g.
// "/images/intro.jpg"; until then a translucent placeholder shows in its place.
const INTRO_IMAGE = "/images/intro.jpg";
const INTRO_IMAGE_ASPECT = "3 / 4";
const INTRO_IMAGE_OVERFLOW = 64;   // px the image hangs below the bottom of the intro (desktop)
const MOBILE_INTRO_IMAGE_SPACE = 24; // px of shader showing below the image on small screens (no overhang there)
// The image is wiped in from the bottom: a clip that starts squashed against the bottom edge
const INTRO_IMAGE_HIDDEN = "inset(100% 0% 0% 0%)";
const INTRO_IMAGE_SHOWN = "inset(0% 0% 0% 0%)";
const INTRO_IMAGE_IN = { duration: 1.1, ease: "power4.inOut" };
const LOAD_TIMEOUT = 8000;       // ms: carry on even if something is still loading

// Intro heading word reveal
const INTRO_DURATION = 0.9; // per word
const INTRO_STAGGER = 0.06; // delay between words
const INTRO_EASE = "power4.out";

// Stepping: each scroll gesture on the homepage moves exactly one stop (intro, a card, the footer).
// Input is ignored while a step plays and for STEP_COOLDOWN after, so a big flick or trackpad
// momentum can't run through several cards.
const STEP_DURATION = 0.85;
const STEP_EASE = "power2.inOut";
const STEP_COOLDOWN = 0.1;
const GESTURE_GAP = 120;  // ms of no scroll input that marks the end of a gesture (see stepper)

// Project cards. The section pins, and the videos form a vertical strip: the current card sits in
// the middle with the previous one peeking in above and the next one below. Each scroll of one
// screen height moves the strip up by one card.
const NAV_HEIGHT = 56;
const NAV_LINKS_OFFSET = 20;         // px the nav links sit lower than centred in a NAV_HEIGHT bar
const NAV_BAR_HEIGHT = NAV_HEIGHT + NAV_LINKS_OFFSET; // the frosted bar's full height
// Small screens (MOBILE_QUERY): a slimmer bar with smaller text
const MOBILE_NAV_BAR_HEIGHT = 52;
const MOBILE_NAV_FONT_SIZE = 16;     // px (desktop: 20px, see navInner)
const navBarHeight = (mobile) => (mobile ? MOBILE_NAV_BAR_HEIGHT : NAV_BAR_HEIGHT);
const CARDS_DIRECTION = "vertical";  // "vertical": next card rises from below. "horizontal": from the right
const CARDS_SCRUB = 1;               // seconds the animation lags behind the scroll (smoothing); true = none
// Cards either side of the current one are shrunk and washed out towards white, so the current
// card stays the obvious one
const CARD_SIDE_SCALE = 0.88;
const CARD_SIDE_WHITE = 0.55;        // opacity of the white layer over a neighbouring card
// Hovering a video tips the part under the mouse towards you
const HOVER_TILT = 8;                 // degrees at the very edge of the video
const HOVER_PERSPECTIVE = 1000;
const HOVER_EASE = { duration: 0.6, ease: "power3.out" }; // how quickly it follows the mouse
const CARDS_TEXT_WIDTH = "22%";      // width of the fixed text column on the left
const CARDS_COLUMN_GAP = 40;         // px between the text column and the videos
const CARD_GAP = 60;                 // px between the current card's edge and a neighbour's (before the 3D tilt)
// The whole video column sits at a skewed 3D angle (reference: slanted, leaning-back panel).
// Read right to left: skew leans the sides, rotateX tilts the top away from you, rotateY turns
// the left side away, rotateZ turns the whole thing (positive = clockwise), perspective sets
// how strong the depth looks.
const CARDS_MEDIA_TRANSFORM = "perspective(1000px) rotateZ(-2deg) rotateY(-19deg) rotateX(7deg) skewX(-4.5deg) scale(1)";
const TEXT_OUT = { duration: 0.45, stagger: 0.03, ease: "power3.in" };  // current project's lines leaving
const TEXT_IN = { duration: 0.7, stagger: 0.05, ease: "power3.out" };   // next project's lines arriving
const CARD_TOP_SPACE = 0;            // px of space between the nav and the card area
const CARD_ASPECT = "1200 / 1100";    // video shape (width / height): matches the source videos, so nothing is cropped
const CARD_HEIGHT = "70%";           // of the space under the nav; the rest is where the neighbours peek in
const CARD_MAX_HEIGHT = 760;         // px; on taller screens the card stays this tall, centred in the space
// Small screens (MOBILE_QUERY): no pinning or stepping, the page just scrolls. The projects are a
// plain list, each video above its own text, and each video plays while it's on screen.
const MOBILE_VIDEO_PLAY = { start: "top 85%", end: "bottom 15%" }; // the stretch of screen a video plays in
const CARDS_BACKGROUND = "#ffffff"; // project section background; neighbouring cards wash towards it
const CARD_SHADOW = "20px 20px 39px rgba(0,0,0,0.3)";

// Mobile list: project i's video and text as rows of the one grid column, video first
const projectRows = (i) => ({ video: `${2 * i + 1} / 1`, text: `${2 * i + 2} / 1` });

function App() {
  // What's open over the homepage: a project's index, 'about', or null for the homepage itself
  const [activeProject, setActiveProject] = useState(null);
  // Which card the side indicator highlights, and whether the indicator is showing at all
  const [activeCard, setActiveCard] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isMobile, setIsMobile] = useState(isMobileScreen);

  const container = useRef(null);
  const projectView = useRef(null);
  const showNav = useRef(null);
  const navTrigger = useRef(null);
  const savedScroll = useRef(0);
  const isAnimating = useRef(false);
  const cardTriggers = useRef([]);
  const goToCardRef = useRef(() => {});
  const goToTopRef = useRef(() => {});
  const syncStepperRef = useRef(() => {});
  const projectOpen = useRef(false);
  const activeCardRef = useRef(0); // card in front, for the return-from-project animation
  const introInRef = useRef(() => {});
  const introOutRef = useRef((done) => done());
  const introClosed = useRef(false); // intro folded away on the way to About
  const loaded = useRef(false);      // the loading intro has played (see the rebuild in useGSAP)
  const dripSvg = useRef(null);
  const dripPath = useRef(null);
  const whiteout = useRef(null);

  // Built for one layout: crossing the mobile breakpoint (isMobile) reverts everything and builds
  // it again for the other one
  const { contextSafe } = useGSAP((context, contextSafe) => {
    const mobile = isMobile;
    // Slides wait just off screen, on the side the opening swipe comes from
    gsap.set(['.slide1', '.slide2'], { xPercent: 0, yPercent: 0, [SLIDE_PROP]: -100 * SLIDE_SIGN });

    // Nav starts hidden above the viewport, slides in once the projects reach the top
    const nav = document.querySelector('.navigation');
    gsap.set(nav, { yPercent: -100, autoAlpha: 0 });

    showNav.current = gsap.to(nav, {
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.3,
      ease: "power2.out",
      paused: true,
    });

    // (Mobile: as soon as they reach the bar, since the Work button stops the first card just under it)
    navTrigger.current = ScrollTrigger.create({
      trigger: '.projects',
      start: mobile ? `top ${MOBILE_NAV_BAR_HEIGHT + 1}px` : "top top",
      onEnter: () => showNav.current.play(),
      onLeaveBack: () => showNav.current.reverse(),
    });

    const wrappers = [...document.querySelectorAll('.projectWrapper')];
    const cards = wrappers.map((w) => w.querySelector('.projectCard'));
    const videos = wrappers.map((w) => w.querySelector('video'));
    const count = wrappers.length;
    const steps = Math.max(1, count - 1); // card changes, one screen of scroll each
    const offAxis = CARDS_DIRECTION === "horizontal" ? "xPercent" : "yPercent";

    // The strip (desktop): card i sits i spacings after the first (below, or to the right). The ones
    // beyond the neighbours are cut off by the section's overflow. A spacing is half the current card
    // plus half a shrunk neighbour plus CARD_GAP, as a % of the wrapper (what xPercent/yPercent
    // measure); measured rather than fixed since the card's size depends on the screen.
    const spacing = () => {
      const tilt = wrappers[0].querySelector('.projectTilt');
      const [card, frame] = offAxis === "yPercent"
        ? [tilt.offsetHeight, wrappers[0].offsetHeight]
        : [tilt.offsetWidth, wrappers[0].offsetWidth];
      return ((card * (1 + CARD_SIDE_SCALE)) / 2 + CARD_GAP) / frame * 100;
    };

    // Play only the card that's in front, and only while the section is on screen
    let current = 0;
    let onScreen = false;
    const syncVideos = () => videos.forEach((video, i) =>
      onScreen && i === current ? video.play().catch(() => {}) : video.pause());

    // Left-hand text: every project's block is split into masked lines. Only the current block is
    // visible; changing project slides the current lines up out of their masks and the next
    // project's lines up into theirs (reversed when scrolling back up).
    // (Mobile: every block shows, under its own video, so none of this applies.)
    const textPanel = mobile ? [] : document.querySelector('.cardsText');
    const blocks = [...document.querySelectorAll('.textBlock')];
    const splits = mobile ? [] : blocks.map((block) =>
      SplitText.create(block.querySelectorAll('p, h1'), { type: "lines", mask: "lines", linesClass: "line", autoSplit: true }));
    if (!mobile) blocks.forEach((block, i) => gsap.set(block, { autoAlpha: i === 0 ? 1 : 0 }));
    // Everything that animates in a block: its text lines, then the case study button
    const textTargets = (i) => (mobile ? [] : [...splits[i].lines, blocks[i].querySelector('.caseStudyButton')]);

    let textTl;
    const showText = contextSafe((from, to) => {
      textTl?.progress(1).kill(); // finish any change still playing, so `from` is fully showing
      const dir = to > from ? 1 : -1;
      textTl = gsap.timeline()
        .to(textTargets(from), { yPercent: -110 * dir, ...TEXT_OUT })
        .set(blocks[from], { autoAlpha: 0 })
        .set(blocks[to], { autoAlpha: 1 })
        .fromTo(textTargets(to), { yPercent: 110 * dir }, { yPercent: 0, ...TEXT_IN }, "-=0.15");
    });

    let pinTrigger = null;
    if (mobile) {
      // Each video plays while it's on screen, and starts over the next time it comes back
      wrappers.forEach((wrapper, i) => ScrollTrigger.create({
        trigger: wrapper,
        ...MOBILE_VIDEO_PLAY,
        onToggle: (self) => {
          if (self.isActive) videos[i].play().catch(() => {});
          else { videos[i].pause(); videos[i].currentTime = 0; }
        },
      }));
      // No white wash over the other cards: they're all at full strength in a list
      gsap.set(wrappers.map((w) => w.querySelector('.cardWhite')), { opacity: 0 });
      // Scroll position that puts card i just under the nav (for the Work button)
      cardTriggers.current = wrappers.map((wrapper) => ({
        get start() { return wrapper.getBoundingClientRect().top + window.scrollY - MOBILE_NAV_BAR_HEIGHT; },
      }));
    } else {
      // One timeline for the whole section: pinned for a screen height of scroll per card, and each
      // step moves the strip along one card, shrinking the current card back as the next one grows. The section unpins as soon
      // as the last card has arrived, so the footer follows straight on.
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: '.projects',
          pin: true,
          start: "top top",
          end: () => `+=${steps * 100}%`,
          scrub: CARDS_SCRUB,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Whichever card is more than halfway in counts as the current one
            const next = Math.round(self.progress * steps);
            if (next !== current) {
              showText(current, next);
              // Rewind the card being left, so it starts from the beginning when it's back in front
              videos[current].pause();
              videos[current].currentTime = 0;
              current = next;
              setActiveCard(next);
              activeCardRef.current = next;
              syncVideos();
            }
          },
        },
      });

      // White layer over each video: clear on the current card, part way to white on the others
      const whites = wrappers.map((w) => w.querySelector('.cardWhite'));
      gsap.set(wrappers, { xPercent: 0, yPercent: 0, [offAxis]: (i) => i * spacing() });
      whites.forEach((white, index) => gsap.set(white, { opacity: index === 0 ? 0 : CARD_SIDE_WHITE }));
      cards.forEach((card, index) => gsap.set(card, { scale: index === 0 ? 1 : CARD_SIDE_SCALE }));

      // One step per card change; the last card has no step of its own
      cards.slice(0, -1).forEach((card, index) => {
        // fromTo so a resize (invalidateOnRefresh) re-measures both ends, not just where it's heading
        timeline.fromTo(wrappers,
          { [offAxis]: (i) => (i - index) * spacing() },
          { [offAxis]: (i) => (i - index - 1) * spacing(), immediateRender: false });
        timeline.to(card, { scale: CARD_SIDE_SCALE }, "<");
        timeline.to(whites[index], { opacity: CARD_SIDE_WHITE }, "<");
        timeline.to(cards[index + 1], { scale: 1 }, "<");
        timeline.to(whites[index + 1], { opacity: 0 }, "<");
      });

      // Dots and snapping: scroll position where card i is fully in view
      pinTrigger = timeline.scrollTrigger;
      cardTriggers.current = wrappers.map((_, i) => ({
        // +1 so the first card sits just inside the pinned range, not on its edge (landing exactly on
        // the start would count as having left the section and hand scrolling back mid-step)
        get start() { return pinTrigger.start + (pinTrigger.end - pinTrigger.start) * (i / steps) + 1; },
      }));
    }

    // --- One stop per gesture -------------------------------------------------------------------
    // The homepage is a row of stops: the intro, each project card, then the footer. Wheel and
    // touch input are intercepted and each gesture animates the scroll to the next / previous stop.
    // Input is ignored until that finishes (plus a short cooldown), and then until the input has
    // paused, so a big flick or trackpad momentum only ever moves one stop.
    const stops = () => [
      0,                                                  // intro
      ...cardTriggers.current.map((card) => card.start),  // each card
      ScrollTrigger.maxScroll(window),                    // footer
    ];
    // Nearest stop to where the page actually is (so it stays right after keyboard/scrollbar scrolling)
    const nearestStop = () => {
      const y = window.scrollY;
      return stops().reduce((best, stop, i, all) => (Math.abs(stop - y) < Math.abs(all[best] - y) ? i : best), 0);
    };

    let stepping = false;
    let needGap = false;
    let lastInput = 0;
    let ready = false;  // off during the loading intro

    const stepTo = (stop) => {
      const all = stops();
      stepping = true;
      gsap.to(window, {
        scrollTo: all[Math.max(0, Math.min(all.length - 1, stop))],
        duration: STEP_DURATION,
        ease: STEP_EASE,
        overwrite: true,
        onComplete: () => gsap.delayedCall(STEP_COOLDOWN, () => { stepping = false; needGap = true; }),
      });
    };

    const onGesture = contextSafe((direction) => {
      const now = performance.now();
      const gap = now - lastInput;
      lastInput = now;
      if (stepping) return;
      if (needGap) {
        if (gap < GESTURE_GAP) return;
        needGap = false;
      }
      const from = nearestStop();
      const to = from + direction;
      if (to < 0 || to >= stops().length) return; // already at the top / bottom
      stepTo(to);
    });

    const stepper = Observer.create({
      target: window,
      type: "wheel,touch",
      wheelSpeed: -1,      // so scrolling down (and swiping up) counts as "next"
      tolerance: 10,       // ignore tiny accidental movements
      preventDefault: true,
      onUp: () => onGesture(1),
      onDown: () => onGesture(-1),
    });
    stepper.disable();

    // On once the site has loaded, and never while a project page is open (it scrolls on its own).
    // Never on mobile, where the page scrolls normally.
    const syncStepper = () => (ready && !projectOpen.current && !mobile ? stepper.enable() : stepper.disable());
    // Indicator dots: straight to card i (stop i + 1), even mid-step
    goToCardRef.current = contextSafe((index) => stepTo(index + 1));
    // Name in the nav: back up to the intro (stop 0)
    goToTopRef.current = contextSafe(() => stepTo(0));
    syncStepperRef.current = syncStepper;

    // The section is itself the pinned element, so "its bottom" has to be offset by how long it
    // stays pinned: it leaves the screen a full pin's worth of scroll later than its layout suggests
    // (Desktop only: on mobile each video handles its own playing, and there are no dots.)
    const section = document.querySelector('.projects');
    const pinnedFor = () => pinTrigger.end - pinTrigger.start;

    if (!mobile) {
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: () => `bottom+=${pinnedFor()} top`,
        onToggle: (self) => { onScreen = self.isActive; syncVideos(); },
      });

      // Indicator dots show while the cards fill the middle of the screen
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: () => `bottom+=${pinnedFor()} center`,
        onToggle: (self) => setShowIndicator(self.isActive),
      });
    }

    // Intro heading: each word rises up from behind its own mask. Plays on load and again whenever
    // the heading scrolls back into view. autoSplit re-splits if the layout changes (e.g. once the
    // heading font finishes loading), and returning the tween lets SplitText keep it in sync.
    let introSplit = null; // the heading's SplitText, once created
    const revealIntroText = contextSafe(() => introSplit = SplitText.create('.introHeading', {
      type: "words",
      mask: "words",
      autoSplit: true,
      onSplit: (self) => gsap.from(self.words, {
        yPercent: 110,
        duration: INTRO_DURATION,
        stagger: INTRO_STAGGER,
        ease: INTRO_EASE,
        scrollTrigger: {
          trigger: '.introHeading',
          start: "top bottom",
          end: "bottom top",
          toggleActions: "restart none restart none", // replay on the way down and on the way back up
        },
      }),
    }));

    // --- Hover tilt ------------------------------------------------------------------------------
    // Mouse position over a video (-1..1 from its centre) tips that side towards the viewer:
    // right of centre → right edge comes forward (negative rotationY), above centre → top comes
    // forward (negative rotationX). Eases back flat when the mouse leaves. Mouse only, not touch.
    const tiltCleanups = wrappers.map((wrapper) => {
      const tilt = wrapper.querySelector('.projectTilt');
      gsap.set(tilt, { transformPerspective: HOVER_PERSPECTIVE });
      const toX = gsap.quickTo(tilt, "rotationX", HOVER_EASE);
      const toY = gsap.quickTo(tilt, "rotationY", HOVER_EASE);

      const onMove = (e) => {
        if (e.pointerType !== 'mouse') return;
        const box = tilt.getBoundingClientRect();
        const nx = ((e.clientX - box.left) / box.width) * 2 - 1;
        const ny = ((e.clientY - box.top) / box.height) * 2 - 1;
        toX(ny * HOVER_TILT);
        toY(-nx * HOVER_TILT);
      };
      const onLeave = () => { toX(0); toY(0); };

      tilt.addEventListener('pointermove', onMove);
      tilt.addEventListener('pointerleave', onLeave);
      return () => {
        tilt.removeEventListener('pointermove', onMove);
        tilt.removeEventListener('pointerleave', onLeave);
      };
    });

    // --- Pill button hover -----------------------------------------------------------------------
    // "Open case study" and the intro's About / Work: the fill grows up from the bottom of the pill,
    // the pill grows a touch and the arrow nudges the way it points. `triggers` are the elements
    // whose hover plays it (a project's video plays its "Open case study" too).
    const addPillHover = (button, triggers) => {
      const fill = button.querySelector('.caseStudyFill');
      const arrows = button.querySelectorAll('.caseStudyArrow'); // the one on the pill and the one on the fill
      const axis = button.dataset.arrow === "down" ? "y" : "x";

      const enter = contextSafe((e) => {
        if (e.pointerType !== 'mouse') return;
        gsap.to(fill, { clipPath: CASE_STUDY_HOVER.shown, duration: 0.4, ease: "power2.out", overwrite: "auto" });
        gsap.to(button, { scale: CASE_STUDY_HOVER.scale, duration: 0.2, ease: "power2.out", overwrite: "auto" });
        gsap.to(arrows, { [axis]: CASE_STUDY_HOVER.arrowShift, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      });
      const leave = contextSafe(() => {
        gsap.to(fill, { clipPath: CASE_STUDY_HOVER.hidden, duration: 0.3, ease: "power2.in", overwrite: "auto" });
        gsap.to(button, { scale: 1, duration: 0.2, ease: "power2.out", overwrite: "auto" });
        gsap.to(arrows, { [axis]: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      });

      triggers.forEach((el) => {
        el.addEventListener('pointerenter', enter);
        el.addEventListener('pointerleave', leave);
      });
      return () => triggers.forEach((el) => {
        el.removeEventListener('pointerenter', enter);
        el.removeEventListener('pointerleave', leave);
      });
    };
    const pillCleanups = [
      ...wrappers.map((wrapper, i) => {
        const button = blocks[i].querySelector('.caseStudyButton');
        return addPillHover(button, [button, wrapper.querySelector('.projectTilt')]);
      }),
      ...[...document.querySelectorAll('.introButtons button')].map((button) => addPillHover(button, [button])),
    ];

    // --- Loading sequence ---------------------------------------------------------------------
    // The intro starts as a thin bar whose blue fill tracks loading. Once everything's in, the bar
    // opens to full height, the heading words rise in, and the first card slides and fades in.
    const intro = document.querySelector('.intro');
    const fill = intro.querySelector('.introFill');
    let cancelled = false;

    // Hold the page at the top while the layout is still changing underneath (first load only)
    if (!loaded.current) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = 'hidden';
    }

    gsap.set(intro, { height: INTRO_BAR_HEIGHT });
    gsap.set(fill, { scaleX: 0, transformOrigin: "0% 50%" });
    gsap.set('.introHeading', { autoAlpha: 0 });
    gsap.set('.introButtons', { autoAlpha: 0, y: 16 });
    // The first card and the one peeking in below it (mobile: the first card and its text)
    const firstCards = mobile ? [wrappers[0], blocks[0]] : wrappers.slice(0, 2);
    gsap.set(firstCards, { autoAlpha: 0, y: 80 });
    gsap.set(textPanel, { autoAlpha: 0 });

    // What counts as "loaded": fonts, the page's own load event, and each card's preview video
    const once = (target, event) => new Promise((resolve) => target.addEventListener(event, resolve, { once: true }));
    const tasks = [
      document.fonts.ready,
      document.readyState === 'complete' ? Promise.resolve() : once(window, 'load'),
      ...videos.map((video) => (video.readyState >= 1 ? Promise.resolve() : once(video, 'loadedmetadata'))),
    ];

    let done = 0;
    const setProgress = contextSafe((amount) => {
      gsap.to(fill, { scaleX: amount, duration: 0.4, ease: "power2.out", overwrite: true });
    });
    tasks.forEach((task) => task.then(() => { if (!cancelled) setProgress(++done / tasks.length); }));

    // Intro in: opens to full height, heading words rise, buttons fade up, and the first project's
    // video and text come in. On load (fromBar) the loading bar finishes filling first; coming back
    // from About the intro just unfolds, no bar.
    const introIn = contextSafe(({ fromBar = false } = {}) => {
      ready = false; syncStepper();
      document.documentElement.style.overflow = 'hidden';
      return gsap.timeline({
        onComplete: () => {
          document.documentElement.style.overflow = '';
          ScrollTrigger.refresh(); // the intro changed height, so every trigger below it moved
          loaded.current = true;
          ready = true;
          syncStepper();
        },
      })
        .to(fill, { scaleX: 1, duration: fromBar ? 0.4 : 0, ease: "power2.out", overwrite: true })
        .to(intro, { height: introHeight(), duration: INTRO_OPEN_DURATION, ease: "power3.inOut" })
        // Words start rising while the intro is still opening (the first time this also splits them)
        .call(() => {
          gsap.set('.introHeading', { autoAlpha: 1 });
          if (!introSplit) revealIntroText();
          else gsap.fromTo(introSplit.words, { yPercent: 110 }, { yPercent: 0, duration: INTRO_DURATION, stagger: INTRO_STAGGER, ease: INTRO_EASE });
        }, null, "<0.4")
        .addLabel("words", "<")
        .to('.introButtons', { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, "words+=0.5")
        .fromTo('.introImage', { clipPath: INTRO_IMAGE_HIDDEN }, { clipPath: INTRO_IMAGE_SHOWN, ...INTRO_IMAGE_IN }, "words+=0.1")
        .to(firstCards, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }, "words+=0.2")
        // First project's text rises in alongside its video
        .set(textPanel, { autoAlpha: 1 }, "<")
        .fromTo(textTargets(0), { yPercent: 110 }, { yPercent: 0, ...TEXT_IN }, "<0.1");
    });

    // Intro out: the same in reverse (first project and buttons go, words sink, the intro folds
    // closed), then onDone. Used when opening About from the intro. No loading bar here.
    const introOut = contextSafe((onDone) => {
      ready = false; syncStepper();
      gsap.timeline({ onComplete: onDone })
        .to(textTargets(0), { yPercent: 110, ...TEXT_OUT })
        .to(firstCards, { autoAlpha: 0, y: 80, duration: 0.6, ease: "power3.in" }, "<")
        .to('.introButtons', { autoAlpha: 0, y: 16, duration: 0.5, ease: "power3.in" }, "<")
        .to('.introImage', { clipPath: INTRO_IMAGE_HIDDEN, duration: 0.6, ease: "power3.in" }, "<")
        .to(introSplit ? introSplit.words : [], { yPercent: 110, duration: 0.5, stagger: INTRO_STAGGER / 2, ease: "power3.in" }, "<0.1")
        .to(intro, { height: 0, duration: INTRO_OPEN_DURATION, ease: "power3.inOut" }, "-=0.2");
    });
    introInRef.current = introIn;
    introOutRef.current = introOut;

    if (loaded.current) {
      // Rebuilt for the other layout after crossing the breakpoint: no loading bar, straight to
      // the end state (the intro open, or still folded away if About was opened from it)
      if (introClosed.current) gsap.set(intro, { height: 0 });
      else introIn().progress(1);
      if (projectOpen.current) {
        document.documentElement.style.overflow = 'hidden'; // the homepage stays frozen under the page
        showNav.current.progress(1); // and the back button stays put
      }
    } else {
      const open = contextSafe(() => { if (!cancelled) introIn({ fromBar: true }); });
      Promise.race([
        Promise.all(tasks),
        new Promise((resolve) => setTimeout(resolve, LOAD_TIMEOUT)),
      ]).then(open);
    }

    return () => {
      cancelled = true;
      document.documentElement.style.overflow = '';
      tiltCleanups.forEach((cleanup) => cleanup());
      pillCleanups.forEach((cleanup) => cleanup());
    };
  }, { scope: container, dependencies: [isMobile], revertOnUpdate: true });

  // Track the mobile breakpoint; changing it rebuilds the homepage animations above
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Dev only: when a style change hot-reloads, the page layout shifts but ScrollTrigger keeps
  // the positions it measured on load. Re-measure after every update so nothing drifts.
  useEffect(() => {
    if (!import.meta.hot) return;
    const refresh = () => ScrollTrigger.refresh();
    import.meta.hot.on('vite:afterUpdate', refresh);
    return () => import.meta.hot.off('vite:afterUpdate', refresh);
  }, []);

  // Images and videos in a project load after its ScrollTriggers have measured the page,
  // which pushes everything below them down. Re-measure the project's triggers as media arrives.
  useEffect(() => {
    const view = projectView.current;
    let frame;

    const refreshProjectTriggers = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        ScrollTrigger.getAll()
          .filter((st) => st.scroller === view)
          .forEach((st) => st.refresh());
      });
    };

    // Media load events don't bubble, so listen in the capture phase
    view.addEventListener('load', refreshProjectTriggers, true);
    view.addEventListener('loadedmetadata', refreshProjectTriggers, true);
    return () => {
      cancelAnimationFrame(frame);
      view.removeEventListener('load', refreshProjectTriggers, true);
      view.removeEventListener('loadedmetadata', refreshProjectTriggers, true);
    };
  }, []);

  // Covers the screen, swaps the content underneath, then uncovers it.
  // direction 1 = opening a project, -1 = going back (runs the wipe the opposite way)
  // onReveal (optional) runs once the transition has fully finished
  // wipe: false skips the drip / slides, so it's just a fade to white and back (used for About)
  const swipe = (direction, swapContent, onReveal, { wipe = true } = {}) => {
    isAnimating.current = true;
    // Firefox can draw videos above everything else, z-index or not, so hide them while the
    // wipe is moving (see .is-swiping in index.css)
    document.documentElement.classList.add('is-swiping');

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
        document.documentElement.classList.remove('is-swiping');
      },
    });

    // Fade to white first; the wipe steps below are appended after this
    tl.fromTo(whiteout.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: WHITEOUT_DURATION, ease: WHITEOUT_EASE });

    if (!wipe) {
      tl.call(swapContent);
    } else if (SWIPE_STYLE === "drip") {
      const path = dripPath.current;
      tl
        // Going back, flip the whole shape so it drips down from the top and leaves off the bottom
        .set(dripSvg.current, { display: "block", scaleY: direction === 1 ? 1 : -1 })
        .set(path, { morphSVG: DRIP_STEPS[0] })
        .to(path, { morphSVG: DRIP_STEPS[1], duration: DRIP_STEP_DURATION, ease: "none" })
        .to(path, { morphSVG: DRIP_STEPS[2], duration: DRIP_STEP_DURATION, ease: "power1.out" })
        .call(swapContent)
        // Uncover mirrors the cover: same distances and durations, eases reversed
        .to(path, { morphSVG: DRIP_STEPS[3], duration: DRIP_STEP_DURATION, ease: "power1.in" })
        .to(path, { morphSVG: DRIP_STEPS[4], duration: DRIP_STEP_DURATION, ease: "none" })
        .set(dripSvg.current, { display: "none" });
    } else {
      // Slides sweep in (staggered), then keep going in the same direction to reveal
      const from = -100 * direction * SLIDE_SIGN;
      const to = 100 * direction * SLIDE_SIGN;

      tl
        .fromTo(SLIDES, { [SLIDE_PROP]: from }, {
          [SLIDE_PROP]: 0,
          duration: SLIDE_DURATION,
          ease: SLIDE_EASE,
          stagger: SLIDE_STAGGER,
        })
        .call(swapContent)
        // Top slide leaves first so the bottom one is revealed before the content
        .to([...SLIDES].reverse(), {
          [SLIDE_PROP]: to,
          duration: SLIDE_DURATION,
          ease: SLIDE_EASE,
          stagger: SLIDE_STAGGER,
        });
    }

    // Wipe has cleared: fade the new page up from white
    tl.to(whiteout.current, { autoAlpha: 0, duration: WHITEOUT_DURATION, ease: WHITEOUT_EASE });
    // Everything has cleared: anything that should animate in on the new page starts now
    if (onReveal) tl.call(onReveal);
  };

  // Opens a project (by index) or the About page ('about') with the page transition
  const openProject = contextSafe((index) => {
    if (isAnimating.current || index === activeProject) return;

    const transition = () => swipe(1, () => {
      savedScroll.current = window.scrollY;
      flushSync(() => setActiveProject(index));
      projectOpen.current = true;
      syncStepperRef.current(); // let the project page scroll normally

      // Freeze the homepage where it is; the project scrolls inside its own layer
      document.documentElement.style.overflow = 'hidden';
      projectView.current.scrollTop = 0;
      projectView.current.focus({ preventScroll: true });

      // Make sure the back button is visible even if the nav hadn't appeared yet
      showNav.current.play();
    }, undefined, { wipe: index !== 'about' });

    // About from the intro (intro on screen): fold the intro away first, the reverse of how it
    // opens on load. It opens again when you come back (see closeProject).
    const introOnScreen = window.scrollY < document.querySelector('.intro').offsetHeight;
    if (index === 'about' && !projectOpen.current && introOnScreen) {
      isAnimating.current = true;
      introClosed.current = true;
      introOutRef.current(transition);
      return;
    }

    // Already on a page ("More Projects", or About from a project), or About from further down:
    // no card to animate out, go straight to the transition
    if (projectOpen.current || index === 'about') {
      transition();
      return;
    }

    // Mobile has no "card in front", so remember the one tapped for the way back (see closeProject)
    if (isMobileScreen()) activeCardRef.current = index;

    // From the homepage: the selected card goes out first (the reverse of it coming back), then
    // the transition. Locked meanwhile so a second click can't start another.
    isAnimating.current = true;
    const card = document.querySelectorAll('.projectWrapper')[index];
    gsap.to(card, { autoAlpha: 0, ...RETURN_FROM, ...SELECT_TWEEN, onComplete: transition });
  });

  const closeProject = contextSafe(() => {
    if (isAnimating.current) return;

    // The card for the project you came back from, hidden while the wipe covers the page and then
    // brought in as the page fades back up, as if it had just been picked
    const wrappers = document.querySelectorAll('.projectWrapper');
    const card = wrappers[activeCardRef.current];
    // The cards peeking in above and below it, which fade in after it, top one first
    const neighbours = [wrappers[activeCardRef.current - 1], wrappers[activeCardRef.current + 1]].filter(Boolean);
    // If the intro was folded away on the way to About, it opens back up instead
    const reopenIntro = introClosed.current;

    swipe(-1, () => {
      if (!reopenIntro) {
        gsap.set(card, { autoAlpha: 0, ...RETURN_FROM });
        gsap.set(neighbours, { autoAlpha: 0 });
      }
      flushSync(() => setActiveProject(null));
      projectOpen.current = false;
      syncStepperRef.current();

      document.documentElement.style.overflow = '';
      window.scrollTo(0, savedScroll.current);
      ScrollTrigger.update();

      // Put the nav back to whatever state matches the restored scroll position
      if (window.scrollY < navTrigger.current.start) {
        showNav.current.reverse();
      }
    }, () => {
      if (reopenIntro) {
        introClosed.current = false;
        introInRef.current();
      } else {
        gsap.to(card, { autoAlpha: 1, x: 0, y: 0, scale: 1, ...RETURN_TWEEN });
        gsap.to(neighbours, { autoAlpha: 1, ...RETURN_NEIGHBOURS });
      }
    }, { wipe: activeProject !== 'about' });
  });

  // Indicator dot click: scroll so that card sits at the top of the screen
  const scrollToCard = (index) => goToCardRef.current(index); // a dot click always goes

  // Used by "More Projects" inside a project page to swipe straight to another one
  const openProjectByLink = (link) => {
    const index = projects.findIndex((p) => p.link === link);
    if (index !== -1) openProject(index);
  };

  const projectContext = {
    scroller: projectView,
    openProject: openProjectByLink,
    links: projects.map((p) => p.link),
  };

  const ActiveProject =
    activeProject === 'about' ? About
    : activeProject !== null ? projects[activeProject].Component
    : null;

  return (
    <div ref={container}>
      <Cursor />
      <nav className="navigation" style={{ ...styles.navigation, ...(isMobile && styles.navigationMobile) }}>
        <div style={{ ...styles.navInner, ...(isMobile && styles.navInnerMobile) }}>
          {activeProject !== null ? (
            <button onClick={closeProject} style={styles.backButton}>
              <Arrow direction="left" size={isMobile ? 20 : 26} />
              Back
            </button>
          ) : (
            <a
              href="#"
              style={styles.navLink}
              onClick={(e) => { e.preventDefault(); goToTopRef.current(); }}
            >
              Michael Lucas
            </a>
          )}
          {/* On the About page itself, a link to About is pointless: copy the email address instead */}
          {activeProject === 'about' ? (
            <ContactButton style={styles.navLink} />
          ) : (
            <a
              href="#about"
              style={styles.navLink}
              onClick={(e) => { e.preventDefault(); openProject('about'); }}
            >
              About
            </a>
          )}
        </div>
      </nav>

      {/* inert keeps the homepage from being clicked or tabbed into while a project is open */}
      <main inert={activeProject !== null} style={styles.main}>
        <section className="intro" style={styles.intro}>
          {/* Fill: a loading bar at first, then the intro's background (the dithering shader) */}
          <div className="introFill" style={styles.introFill}>
            <Dithering style={styles.shader} {...INTRO_SHADER} />
          </div>
          {/* Mobile: one column, text on top (column-reverse, since the image comes first) */}
          <div style={{ ...styles.contentWidth, ...styles.introContent, ...(isMobile && styles.introContentMobile) }}>
            {/* Left half: portrait image, wiped in from the bottom (see introIn) */}
            <div style={{ ...styles.introMedia, ...(isMobile && styles.introColumnMobile) }}>
              <div className="introImage" style={{ ...styles.introImage, ...(isMobile && styles.introImageMobile) }}>
                {INTRO_IMAGE && <img src={INTRO_IMAGE} alt="" style={styles.introImageImg} />}
              </div>
            </div>
            {/* Right half: heading at the top, buttons at the bottom */}
            <div style={{ ...styles.introText, ...(isMobile && styles.introColumnMobile) }}>
              {/* Name, then what I do underneath; the words of both rise in together (revealIntroText) */}
              <div className="introHeading" style={styles.introHeading}>
                <h1 style={styles.introHeader}>Hi, I'm Michael</h1>
                <h2 style={styles.introSubheader}>UX Engineer<br />B2B Enterprise Software<br />Based in Seattle</h2>
              </div>
              <div className="introButtons" style={styles.introButtons}>
                {/* Same hover as "Open case study" (see addPillHover), with a white fill */}
                <button type="button" data-arrow="right" style={styles.pillButton} onClick={() => openProject('about')}>
                  About
                  <span className="caseStudyArrow" style={styles.caseStudyArrow}><Arrow /></span>
                  <span className="caseStudyFill" style={{ ...styles.caseStudyFill, ...styles.introButtonFill }} aria-hidden="true">
                    About
                    <span className="caseStudyArrow" style={styles.caseStudyArrow}><Arrow /></span>
                  </span>
                </button>
                <button type="button" data-arrow="down" style={styles.pillButton} onClick={() => goToCardRef.current(0)}>
                  Work
                  <span className="caseStudyArrow" style={styles.caseStudyArrow}><Arrow direction="down" /></span>
                  <span className="caseStudyFill" style={{ ...styles.caseStudyFill, ...styles.introButtonFill }} aria-hidden="true">
                    Work
                    <span className="caseStudyArrow" style={styles.caseStudyArrow}><Arrow direction="down" /></span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop only: on mobile the page just scrolls through the list */}
        {!isMobile && <div
          style={{ ...styles.indicator, ...(showIndicator ? null : styles.indicatorHidden) }}
          aria-hidden={!showIndicator}
        >
          {projects.map((project, index) => (
            <button
              key={project.link}
              type="button"
              aria-label={`Go to ${project.title}`}
              aria-current={index === activeCard}
              tabIndex={showIndicator ? 0 : -1}
              onClick={() => scrollToCard(index)}
              style={{ ...styles.indicatorDot, ...(index === activeCard ? styles.indicatorDotActive : null) }}
            />
          ))}
        </div>}

        <section className="projects" style={styles.projects}>
          {/* Mobile: one grid column. The text and video columns step aside (display: contents), so
              each project's video and text become rows of it, video first (see projectRows) */}
          <div style={{ ...styles.cardsFrame, ...(isMobile && styles.cardsFrameMobile) }}>
            {/* Left: one text block per project, layered in the same spot; only the current one shows */}
            <div className="cardsText" style={{ ...styles.cardsText, ...(isMobile && styles.cardsTextMobile) }}>
              <div style={{ ...styles.textStack, ...(isMobile && styles.contentsMobile) }}>
                {projects.map((project, index) => (
                  <div key={project.link} className="textBlock" style={{ ...styles.textBlock, ...(isMobile && { ...styles.textBlockMobile, gridArea: projectRows(index).text }) }}>
                    <h1 className="cardTitle" style={styles.cardTitle} onClick={() => openProject(index)}>{project.title}</h1>
                    <p style={styles.cardDescription}>{project.description}</p>
                    {/* In its own mask so it slides in and out with the text lines */}
                    <div style={styles.caseStudyMask}>
                      <button type="button" className="caseStudyButton" style={styles.caseStudyButton} onClick={() => openProject(index)}>
                        Open case study
                        <span className="caseStudyArrow" style={styles.caseStudyArrow}><Arrow /></span>
                        {/* Hover fill with a white copy of the label, revealed from the bottom by a growing
                            clip (see the case study hover in useGSAP). Text is always the right colour
                            for what's behind it, since each copy only shows over its own background. */}
                        <span className="caseStudyFill" style={styles.caseStudyFill} aria-hidden="true">
                          Open case study
                          <span className="caseStudyArrow" style={styles.caseStudyArrow}><Arrow /></span>
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: the videos, layered; each scroll slides the next one up over the current */}
            <div style={{ ...styles.cardsMedia, ...(isMobile && styles.cardsMediaMobile) }}>
              {projects.map((project, index) => (
                <div key={project.link} className="projectWrapper" style={{ ...styles.projectWrapper, ...(isMobile && { ...styles.projectWrapperMobile, gridArea: projectRows(index).video }) }}>
                  {/* Hover tilt layer (its own element so it doesn't fight the scroll animation's rotation) */}
                  <div className="projectTilt" style={{ ...styles.projectTilt, ...(isMobile && styles.projectTiltMobile) }}>
                    <div
                      className="projectCard"
                      style={{ ...styles.projectCard, ...(isMobile && styles.projectCardMobile) }}
                      onClick={() => openProject(index)}
                    >
                      <video
                        src={project.video}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        style={styles.cardVideo}
                      />
                      <div className="cardWhite" style={styles.cardWhite} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.footer}>
          <MeshGradient style={styles.shader} {...SHADER} />
          {/* Footer content goes in here so it sits above the shader */}
          <div style={{ ...styles.contentWidth, ...styles.footerContent }}>
            <h1>Footer</h1>
          </div>
        </section>
      </main>

      <div
        ref={projectView}
        tabIndex={-1}
        style={{ ...styles.projectView, paddingTop: `${navBarHeight(isMobile)}px`, display: ActiveProject ? 'block' : 'none' }}
      >
        <ProjectContext.Provider value={projectContext}>
          {ActiveProject && <ActiveProject />}
        </ProjectContext.Provider>
      </div>

      {/* Fades the page to white under the wipe (see swipe) */}
      <div ref={whiteout} style={styles.whiteout} aria-hidden="true" />
      <svg ref={dripSvg} viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.drip} aria-hidden="true">
        <path ref={dripPath} fill={DRIP_COLOR} d={DRIP_STEPS[0]} />
      </svg>
      <div className="slide1" style={styles.slide1}></div>
      <div className="slide2" style={styles.slide2}></div>
    </div>
  )
}

export default App

const styles = {
  navigation: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: `${NAV_BAR_HEIGHT}px`,
    zIndex: 1000,
    // Frosted glass: translucent fill with whatever scrolls underneath blurred through it
    background: "rgba(234, 234, 234, 0.55)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(16px) saturate(160%)",
    WebkitBackdropFilter: "blur(16px) saturate(160%)", // Safari
    paddingTop: `${NAV_LINKS_OFFSET}px`, // links sit this much lower within the bar
    boxSizing: "border-box",
    visibility: "hidden", // avoids a flash before GSAP takes over
    paddingBottom: "20px",
  },
  // Same 36px row for the links, with less bar above and below it
  navigationMobile: {
    height: `${MOBILE_NAV_BAR_HEIGHT}px`,
    paddingTop: "10px",
    paddingBottom: "6px",
  },
  // Centred column every homepage section lines up to: MAX_WIDTH of content plus a gutter each side
  contentWidth: {
    width: "100%",
    maxWidth: `${MAX_WIDTH + GUTTER * 2}px`,
    margin: "0 auto",
    padding: `0 ${GUTTER}px`,
    boxSizing: "border-box",
  },
  navInner: {
    width: "100%",
    maxWidth: `${MAX_WIDTH + GUTTER * 2}px`,
    height: "100%",
    margin: "0 auto",
    padding: `0 ${GUTTER}px`,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "var(--heading)", // same font as the headings
    fontSize: "20px", // name/Back and About; the back button inherits this
    fontWeight: 600,
    textTransform: "uppercase",
  },
  navInnerMobile: {
    fontSize: `${MOBILE_NAV_FONT_SIZE}px`,
  },
  navLink: {
    pointerEvents: "auto",
    color: "inherit",
    textDecoration: "none",
    cursor: "pointer",
  },
  backButton: {
    pointerEvents: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textTransform: "inherit",
    background: "none",
    border: "none",
    padding: 0,
    font: "inherit",
    cursor: "pointer",
  },
  // Homepage background: the projects' grey, so the gap under the intro and the intro's rounded
  // corners blend into the projects section
  main: {
    background: CARDS_BACKGROUND,
  },
  // Not clipped, so the image can hang out over the projects below (zIndex keeps it on top of them).
  // Painted in the projects' grey itself, so the gap below the shader and the space behind its
  // rounded corners always match the projects.
  intro: {
    position: "relative",
    zIndex: 1,
    background: CARDS_BACKGROUND,
    paddingBottom: `${INTRO_SPACE_BELOW}px`, // the gap before the projects
    height: `${INTRO_BAR_HEIGHT}px`, // opened to INTRO_HEIGHT once the site has loaded
    fontSize: "60px",
    boxSizing: "content-box", // height is the shader's; the gap is added below it
  },
  introFill: {
    position: "absolute",
    inset: `0 0 ${INTRO_SPACE_BELOW}px 0`, // stops above the gap
    overflow: "hidden", // keeps the shader inside the fill
    background: "#1b88a6",
    transform: "scaleX(0)",
    transformOrigin: "0% 50%",
  },
  // Fills the intro: image on the left half, text on the right half
  introContent: {
    position: "relative", // above the fill
    height: "100%",
    display: "flex",
    gap: `${CARDS_COLUMN_GAP}px`,
  },
  introText: {
    flex: "1 1 50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  // Image sits against the right edge of the content column, as tall as the intro allows
  // Image runs from the very top of the intro to INTRO_IMAGE_OVERFLOW past its bottom
  introMedia: {
    flex: "1 1 50%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start", // against the left edge of the content column
  },
  introImage: {
    height: `calc(100% + ${INTRO_IMAGE_OVERFLOW}px)`,
    aspectRatio: INTRO_IMAGE_ASPECT,
    overflow: "hidden",
    background: "rgba(255, 255, 255, 0.25)", // placeholder until INTRO_IMAGE is set
    clipPath: INTRO_IMAGE_HIDDEN,
  },
  introContentMobile: {
    flexDirection: "column-reverse",
    gap: 0, // the buttons' bottom padding already spaces them from the image
    paddingBottom: `${MOBILE_INTRO_IMAGE_SPACE}px`, // the shader carries on past the image
  },
  introColumnMobile: {
    flex: "none",
  },
  // Full width at its own aspect ratio, inside the shader rather than hanging below it, so the
  // full INTRO_SPACE_BELOW shows between the intro and the first project
  introImageMobile: {
    width: "100%",
    height: "auto",
  },
  introImageImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  introButtons: {
    display: "flex",
    flexDirection: "column", // About above Work, bottom left of the intro
    alignItems: "flex-start",
    gap: "12px",
    paddingBottom: "32px",
  },
  pillButton: {
    position: "relative",
    overflow: "hidden", // clips the hover fill as it rises in
    textTransform: "uppercase",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 22px",
    borderRadius: "999px",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    background: "transparent",
    color: "white",
    font: "inherit",
    fontSize: "16px", // the intro's 60px would otherwise carry through
    lineHeight: 1,
    cursor: "pointer",
  },
  introHeading: {
    padding: "32px 0",
  },
  introHeader: {
    fontWeight: 650, // heavier than the default heading weight (500)
    margin: "0 0 16px",
    color: "white",
  },
  introSubheader: {
    fontSize: "32px",
    lineHeight: 1.2,
    fontWeight: 500,
    margin: 0,
    color: "rgba(255, 255, 255, 0.85)",
  },
  projects: {
    boxSizing: "border-box",
    background: CARDS_BACKGROUND, // the videos fade towards this too (cardWhite)
    overflow: "hidden", // hides the cards waiting off screen
    maxWidth: "11200px",
  },
  // One screen tall; the cards are layered inside it, later ones on top
  // One screen tall: text column on the left, video column on the right
  cardsFrame: {
    position: "relative",
    height: "100vh",
    display: "flex",
    gap: `${CARDS_COLUMN_GAP}px`,
    // Same column as the nav and footer: MAX_WIDTH wide, centred, keeping GUTTER from the screen
    // edges on narrower screens. No padding, so its edges line up with theirs.
    width: `calc(100% - ${GUTTER * 2}px)`,
    maxWidth: `${MAX_WIDTH}px`,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  cardsFrameMobile: {
    display: "grid",
    gridTemplateColumns: "100%",
    height: "auto",
    gap: 0,
    paddingBottom: "40px",
  },
  // Takes a wrapper out of the layout so its children sit straight in the grid above
  contentsMobile: {
    display: "contents",
  },
  cardsText: {
    flex: `0 0 ${CARDS_TEXT_WIDTH}`,
    display: "flex",
    alignItems: "center",
    paddingTop: `${NAV_HEIGHT}px`,
    boxSizing: "border-box",
  },
  cardsTextMobile: {
    display: "contents",
  },
  // Every text block sits in the same grid cell, so the stack is as tall as the longest one
  textStack: {
    display: "grid",
    width: "100%",
  },
  textBlock: {
    gridArea: "1 / 1",
  },
  // Under its video, with room before the next project
  textBlockMobile: {
    padding: "20px 0 64px",
  },
  cardsMedia: {
    position: "relative",
    flex: "1 1 auto",
    transform: CARDS_MEDIA_TRANSFORM,
  },
  cardsMediaMobile: {
    display: "contents",
    transform: "none",
  },
  // Full-height layer per video within the right column; the video card sits under the nav
  projectWrapper: {
    position: "absolute",
    inset: 0,
    padding: `${NAV_HEIGHT + CARD_TOP_SPACE}px 0 20px`, // top clears the nav
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center", // centres the card in the space under the nav
    justifyContent: "center",
  },
  // Fixed shape: CARD_HEIGHT tall, width from CARD_ASPECT (never wider than the video column)
  projectTilt: {
    height: CARD_HEIGHT,
    maxHeight: `${CARD_MAX_HEIGHT}px`,
    aspectRatio: CARD_ASPECT,
    maxWidth: "100%",
  },
  // Full width on a phone, height from CARD_ASPECT
  projectTiltMobile: {
    width: "100%",
    height: "auto",
    maxHeight: "none",
  },
  // In the list rather than layered on top of each other
  projectWrapperMobile: {
    position: "relative",
    inset: "auto",
    padding: 0,
  },
  // Flat in the mobile list: no drop shadow
  projectCardMobile: {
    boxShadow: "none",
  },
  projectCard: {
    background: "#fffffe",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
    overflow: "hidden",
    position: "relative", // for the white layer
    boxShadow: CARD_SHADOW,
    borderRadius: "8px",
  },
  // Column of dots centred in the gutter to the right of the cards
  indicator: {
    position: "fixed",
    top: "50%",
    right: `${GUTTER}px`,
    transform: "translate(50%, -50%)",
    zIndex: 100, // under the nav and the open project page
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    transition: "opacity 0.3s ease",
  },
  indicatorHidden: {
    opacity: 0,
    pointerEvents: "none",
  },
  indicatorDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    border: "1px solid #141414",
    background: "transparent",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    transition: "background-color 0.25s ease, transform 0.25s ease",
  },
  indicatorDotActive: {
    background: "#141414",
    transform: "scale(1.2)",
  },
  cardTitle: {
    margin: "4px 0 12px",
    cursor: "pointer",
  },
  cardDescription: {
    margin: 0,
    fontSize: "18px",
  },
  // Clips the button for the text animation. The padding (cancelled by the negative margins, so
  // nothing moves) leaves room for the button to grow on hover without being cut off.
  caseStudyMask: {
    overflow: "clip",
    padding: "2px 8px", // growing to 1.05 needs ~5px each side but only ~1px top and bottom; more
    margin: "26px -8px -2px", // vertical room would show a sliver of the hidden button mid-animation
  },
  // Same padding and gap as the button, so its white label lines up exactly with the dark one
  caseStudyFill: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 22px",
    borderRadius: "999px",
    background: CASE_STUDY_HOVER.fill,
    color: CASE_STUDY_HOVER.text,
    clipPath: CASE_STUDY_HOVER.hidden,
  },
  caseStudyArrow: {
    display: "inline-flex",
  },
  introButtonFill: {
    background: INTRO_BUTTON_HOVER.fill,
    color: INTRO_BUTTON_HOVER.text,
  },
  caseStudyButton: {
    position: "relative",
    overflow: "hidden", // clips the fill as it rises in
    textTransform: "uppercase",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 22px",
    borderRadius: "999px",
    border: "1px solid #141414",
    background: "transparent",
    color: "#141414",
    font: "inherit",
    fontSize: "16px",
    lineHeight: 1,
    cursor: "pointer",
  },
  // Fades the video to / from white as it leaves / arrives (see the cards timeline)
  cardWhite: {
    position: "absolute",
    inset: 0,
    background: CARDS_BACKGROUND,
    pointerEvents: "none",
  },
  cardVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  footer: {
    position: "relative",
    overflow: "hidden",
    height: "40vh",
    boxSizing: "border-box",
  },
  // Shader fills the whole intro / footer behind its content
  shader: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
  footerContent: {
    position: "relative",
    height: "100%",
  },
  // Full-screen layer with its own scrollbar, so the homepage scroll position is untouched
  projectView: {
    position: "fixed",
    inset: 0,
    zIndex: 500,
    overflowY: "auto",
    overscrollBehavior: "contain",
    background: "white",
    paddingTop: `${NAV_BAR_HEIGHT}px`, // start below the nav bar
    boxSizing: "border-box",
    outline: "none",
  },
  // Full-screen white layer between the page (and nav) and the wipe
  whiteout: {
    position: "fixed",
    inset: 0,
    zIndex: 1500,
    background: "#ffffff",
    pointerEvents: "none",
    visibility: "hidden",
    opacity: 0,
  },
  // Stretched to fill the screen (preserveAspectRatio="none"), so the path's 0–100 units map to the viewport
  drip: {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 2000,
    pointerEvents: "none",
    display: "none",
  },
  slide1: {
    height: "100vh",
    width: "100vw",
    background: "#dea694",
    position: "fixed",
    top: "0",
    left: "0",
    zIndex: 2000,
  },
  slide2: {
    height: "100vh",
    width: "100vw",
    background: "#ff8d2f",
    position: "fixed",
    top: "0",
    left: "0",
    zIndex: 2000,
  },
}
