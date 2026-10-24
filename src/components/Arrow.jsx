// The site's arrow. Drawn pointing right; `direction` rotates it. Uses the current text colour.
const ROTATION = { right: 0, down: 90, left: 180, up: 270 };

export default function Arrow({ direction = "right", size = 22, style }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0, transform: `rotate(${ROTATION[direction]}deg)`, ...style }}
    >
      <polygon points="26.5 16.5 18 25 16.6 23.6 22.7 17.5 5.5 17.5 5.5 15.5 22.7 15.5 16.6 9.4 18 8 26.5 16.5" />
    </svg>
  );
}
