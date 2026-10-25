// Nav link that copies the email address. Reads "Contact", "Copy" while hovered (or focused), and
// "Email Copied" for COPIED_FOR once clicked.
import { useState, useRef, useEffect } from 'react';

const EMAIL = "michaeljlucas@gmail.com";
const COPIED_FOR = 2000; // ms "Email Copied" stays up

const LABELS = { idle: "Contact", hover: "Copy", copied: "Email Copied" };

// The Clipboard API only works on https and localhost; opening the dev server on a phone over the
// network is plain http, so fall back to the old select-and-copy there
async function copy(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  document.execCommand('copy');
  field.remove();
}

export default function ContactButton({ style }) {
  const [state, setState] = useState('idle');
  const reset = useRef(null);

  useEffect(() => () => clearTimeout(reset.current), []);

  const onClick = async () => {
    try {
      await copy(EMAIL);
    } catch {
      return; // copying was blocked; leave the label as it was
    }
    setState('copied');
    clearTimeout(reset.current);
    reset.current = setTimeout(() => setState('idle'), COPIED_FOR);
  };
  // Hovering only changes "Contact" to "Copy"; it never cuts "Email Copied" short
  const onEnter = (e) => { if (e.pointerType === 'mouse') setState((s) => (s === 'copied' ? s : 'hover')); };
  const onLeave = () => setState((s) => (s === 'copied' ? s : 'idle'));

  return (
    <button
      type="button"
      style={{ ...styles.button, ...style }}
      onClick={onClick}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={() => setState((s) => (s === 'copied' ? s : 'hover'))}
      onBlur={onLeave}
      aria-label={`Copy email address (${EMAIL})`}
    >
      {/* Announced to screen readers when it changes to "Email Copied" */}
      <span aria-live="polite">{LABELS[state]}</span>
    </button>
  );
}

const styles = {
  // Looks like the nav's other links: no button chrome, inherits the nav's font
  button: {
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    font: "inherit",
    textTransform: "inherit",
    color: "inherit",
    cursor: "pointer",
  },
};
