// About page: photo, bio, and links. Opened from the nav's "About" with the same page transition
// as the projects (see openProject in App.jsx).
import { useContext } from 'react';
import { ProjectContext } from '../projectContext';

// Put your photo in public/images/ and set its path here, e.g. "/images/about.jpg".
// Until then a grey placeholder shows in its place.
const PHOTO = "/images/about.jpg";

// Bio from the previous version of the site. Each string is its own paragraph.
const BIO = [
  "I can remember the first time I played with legos. At age 5, it was a revelation. I am a tinkerer at heart. I tinker for work and after work, I swap my laptop for a pair of workshop gloves. Thinking through designs keeps me up at night.",
];

// Fill in the real addresses. The résumé can be a PDF dropped into public/, e.g. "/resume.pdf".
const LINKS = [
  { label: "Résumé", href: "/resume.pdf", icon: <ResumeIcon /> },
  { label: "Instagram", href: "https://www.instagram.com/", icon: <InstagramIcon /> },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: <LinkedInIcon /> },
];

function About() {
  const { openProject } = useContext(ProjectContext);

  return (
    <article style={styles.page}>
      {PHOTO ? (
        <img src={PHOTO} alt="Michael Lucas" style={styles.photo} />
      ) : (
        <div style={{ ...styles.photo, ...styles.photoPlaceholder }}>Photo</div>
      )}

      <div style={styles.body}>
        <h1 style={styles.heading}>About</h1>
        <div style={styles.bio}>
          {BIO.map((paragraph, i) => (
            <p key={i} style={styles.paragraph}>
              {paragraph}
              {/* After the last paragraph's text: the way to the Photography page */}
              {i === BIO.length - 1 && (
                <>
                  {" "}
                  <a
                    href="#photography"
                    style={styles.inlineLink}
                    onClick={(e) => { e.preventDefault(); openProject('#photography'); }}
                  >
                    Check out my photography
                  </a>
                </>
              )}
            </p>
          ))}
        </div>

        <ul style={styles.links}>
          {LINKS.map(({ label, href, icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} style={styles.link}>
                {icon}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export default About

function ResumeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.6 4.78 6v5.55h-4v-4.92c0-1.17-.02-2.68-1.66-2.68-1.66 0-1.91 1.3-1.91 2.6v5h-4z" />
    </svg>
  )
}

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 20px 120px",
    boxSizing: "border-box",
  },
  photo: {
    display: "block",
    width: "100%",
    aspectRatio: "16 / 9",
    objectFit: "cover",
  },
  photoPlaceholder: {
    background: "#e5e5e5",
    color: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    maxWidth: "680px",
    marginTop: "56px",
  },
  heading: {
    margin: "0 0 24px",
  },
  bio: {
    fontSize: "22px",
    color: "rgba(0, 0, 0, 0.8)",
  },
  paragraph: {
    margin: "0 0 16px",
  },
  inlineLink: {
    color: "#141414",
    textDecoration: "underline",
    textUnderlineOffset: "4px",
  },
  links: {
    listStyle: "none",
    display: "flex",
    gap: "12px",
    margin: "40px 0 0",
    padding: 0,
  },
  link: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    color: "#141414",
  },
}
