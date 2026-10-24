import { useRef, useState, useEffect, useContext } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { project as allProjects } from "../data/projects";
import { ProjectContext } from "../projectContext";


gsap.registerPlugin(ScrollTrigger, SplitText);

export default function Content(props) {
    const mainContainer = useRef();
    const revealRef = useRef();
    const titleRef = useRef();
    const introRef = useRef();
    const iconRef = useRef();

    const headerRef = useRef();
    const subtextRef = useRef();
    const textRef = useRef();
    const lineRef = useRef();

    // Project pages scroll inside their own layer, not the window, so ScrollTriggers need to be told
    const { scroller, openProject, links } = useContext(ProjectContext);


    // 1. RESPONSIVE STATE
    // Measured on the first render, not after it: the text animations split their lines on mount,
    // so they need to see the mobile layout from the start
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 800);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 800);
        checkMobile(); // Check on mount
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 2. IMAGE REVEAL LOGIC
    useGSAP(() => {
        if (!revealRef.current) return;
        const image = revealRef.current.querySelector("img, video");

        // These pages remount fresh on every page transition, so an image
        // already within the "top 85%" trigger zone the moment it mounts
        // can't use the scroll-triggered tween below — ScrollTrigger would
        // fire it immediately, fighting the App-level slide transition
        // that's still playing. Instead fade it in on a fixed delay long
        // enough for that slide (~0.9s, see App.jsx) to have settled, so it
        // reads as "arriving on the page" rather than colliding with the
        // transition. Only genuinely below-the-fold images use the
        // scroll-triggered version, the first time the user scrolls to them.
        if (revealRef.current.getBoundingClientRect().top <= window.innerHeight * 0.85) {
            gsap.set(revealRef.current, { autoAlpha: 1 });
            gsap.fromTo(image,
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 1, delay: 1, ease: "power1.out" }
            );
            return;
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: revealRef.current,
                scroller: scroller.current,
                start: "top 85%", // Slightly later start for mobile comfort
                toggleActions: "play none play none",
                // markers: true,
            }
        });

        tl.set(revealRef.current, { autoAlpha: 1 })
          .from(image, {
              duration: 1,
              autoAlpha: 0,
            ease: "linear"
          });

        
    }, { scope: mainContainer, dependencies: [props.content, props.imgUrl, props.videoUrl] });

    // 3. INTRO: ICON + TEXT SPLIT LOGIC
    // The intro is always at the top of the page, so it's in view the moment the page mounts.
    // Like the image reveal above, it plays on a fixed delay rather than a ScrollTrigger, so it
    // lands once the App-level slide transition (~0.9s, see App.jsx) has settled rather than
    // fighting it. Icon spins in, the title's letters rise in after it, then the
    // overview's lines rise in.
    useGSAP(() => {
        if (props.content !== "intro" || !titleRef.current) return;
        const titleSplit = new SplitText(titleRef.current, { type: "chars, words" });
        const introSplit = new SplitText(introRef.current, { type: "lines" });
        // Once it has played, back to plain text: split lines are fixed, so they'd stop re-wrapping
        // when the width changes (resizing, turning a phone, DevTools device mode)
        const tl = gsap.timeline({ delay: 1, onComplete: () => { titleSplit.revert(); introSplit.revert(); } });

        if (iconRef.current) {
            tl.from(iconRef.current, {
                autoAlpha: 0,
                scale: 0,
                rotation: -90,
                duration: 0.8,
                ease: "back.out(1.7)",
            });
        }
        // 2D only: a 3D flip (rotationX) has the browser draw each letter as a flattened bitmap
        // mid-flip, then snap back to real text at the end, which reads as the font changing.
        // clearProps hands each letter back to normal text rendering once it lands.
        tl.from(titleSplit.chars, {
            duration: 0.8,
            opacity: 0,
            y: 40,
            stagger: 0.04,
            ease: "power3.out",
            clearProps: "transform",
        }, iconRef.current ? "-=0.5" : 0) // overlap the icon when there is one
        .from(introSplit.lines, {
            duration: 0.8,
            opacity: 0,
            y: 30,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.4");

        return () => {
            titleSplit.revert();
            introSplit.revert();
        };
    }, { scope: mainContainer, dependencies: [props.content, props.title, props.overview, props.iconUrl] });

    useGSAP(() => {
        if (props.content !== "headerText" || !headerRef.current) return;

        // Same "already in view on mount" situation as the image reveal
        // logic above: these pages remount fresh on every page transition,
        // and a headerText block already above the 75% trigger line the
        // moment it mounts can't use the scroll-triggered version below —
        // ScrollTrigger would fire it immediately, fighting the App-level
        // slide transition that's still playing. Fade it in on the same
        // fixed delay instead, timed to land after that slide (~0.9s, see
        // App.jsx) has settled. Only genuinely below-the-fold blocks use the
        // scroll-triggered version, the first time the user scrolls to them.
        if (headerRef.current.getBoundingClientRect().top <= window.innerHeight * 0.75) {
            const headerSplit = new SplitText(headerRef.current, { type: "words" });
            const textSplit = new SplitText(textRef.current, { type: "lines" });

            // Back to plain text once played, so the paragraph keeps re-wrapping to the full width
            const tl = gsap.timeline({ delay: 1, onComplete: () => { headerSplit.revert(); textSplit.revert(); } });

            tl.from(lineRef.current, {
                scaleX: 0,
                ease: "sine.out",
                duration: 1,
            })
            .from(headerSplit.words, {
                duration: .8,
                y: 40,
                autoAlpha: 0,
                stagger: 0.1,
                ease: "power2.out",
            }, "-=0.6")
            .from(textSplit.lines, {
                duration: 0.8,
                opacity: 0,
                y: 20,
                stagger: 0.05,
                ease: "power2.out",
            }, "-=0.6");

            return () => {
                headerSplit.revert();
                textSplit.revert();
            };
        }

        const headerSplit = new SplitText(headerRef.current, { type: "words, chars" });
        const textSplit = new SplitText(textRef.current, { type: "lines" });

        const tl = gsap.timeline({
            onComplete: () => { headerSplit.revert(); textSplit.revert(); }, // as above: plain text once played
            scrollTrigger: {
                trigger: headerRef.current,
                scroller: scroller.current,
                start: "top 75%",
                end: "bottom center",
                toggleActions: "play none play none",
                // markers: true, // Turn on to debug placement
            }
        });

        tl.from(lineRef.current, {
            scaleX: 0,
            ease: "sine.out",
            duration: 1.2,
        })
        .from(headerSplit.words, {
            duration: .8,
            y: 40,
            autoAlpha: 0,
            stagger: 0.2,
            ease:"power2.out",
        }, "-=0.9")
        .from(textSplit.lines, {
            duration: 0.8,
            opacity: 0,
            y: 20,
            stagger: 0.05,
            ease: "power2.out",
        }, "-=0.6");

        return () => {
            headerSplit.revert();
            textSplit.revert();
        };
    }, {
        scope: mainContainer,
        dependencies: [props.content, props.title, props.text]
    });


    // DYNAMIC STYLES BASED ON STATE
    const responsiveRow = {
        ...styles.row,
        flexDirection: isMobile ? "column" : "row",
    };


    // Other projects to preview, excluding whichever one is currently being viewed
    const otherProjects = allProjects.filter((item, i, arr) =>
        item.link !== props.currentLink &&
        links.includes(item.link) &&
        arr.findIndex((p) => p.link === item.link) === i
    );

    return (
        <div ref={mainContainer} style={{ ...responsiveRow, backgroundColor: props.rowBackground }}>
            
            {props.content === "intro" && (
                <>
                    <div style={styles.introOuter}>
                        <h1 style={{ ...styles.introTitleName, fontSize: isMobile ? "3rem" : "90px" }}>
                            {props.iconUrl && (
                                <img ref={iconRef} src={props.iconUrl} alt="" style={styles.introIcon} />
                            )}
                            {/* Own element so SplitText only splits the name, not the icon */}
                            <span ref={titleRef}>{props.title}</span>
                        </h1>
                        {props.heroUrl && (
                            <img src={props.heroUrl} alt={props.heroAlt ?? props.title} style={styles.heroImage} />
                        )}
                        {/* About across the top, then role, platform and year side by side beneath it
                            (stacked on small screens) */}
                        <div style={styles.overviewPanel}>
                            <div style={styles.overviewAbout}>
                                <h2>About</h2>
                                <p ref={introRef} style={styles.introOverview}>{props.overview}</p>
                            </div>
                            <div style={{ ...styles.overviewSpecs, flexDirection: isMobile ? "column" : "row" }}>
                                <div style={styles.overviewColumn}>
                                    <SpecGroup title="Role" items={props.roles} />
                                </div>
                                <div style={styles.overviewColumn}>
                                    <SpecGroup title="Platform" items={props.platforms} />
                                </div>
                                <div style={styles.overviewColumn}>
                                    <SpecGroup title="Year" items={[props.year]} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {props.content === "headerText" && (
                <div 
                    style={{...styles.headerTextContainer, 
                        justifyContent: 
                            props.align == "left" ? "flex-start" : 
                            props.align == "center" ? "center" :
                            props.align == "right" ? "flex-end" : "flex-start" ,
                        //  width: 
                        //     props.align == "left" ? "50%" : 
                        //     props.align == "center" ? "%100" :
                        //     props.align == "right" ? "50%" : "100%",
                        ...(isMobile && styles.headerTextContainerMobile),
                        }}
                        >
                    <div style={{ ...styles.headerTextWrap, ...(isMobile && styles.headerTextWrapMobile) }}>
                        {props.title != null && (
                            <div style={styles.headerWrap}>
                                <h2 ref={headerRef} style={styles.header}>{props.title}</h2>
                            </div>
                        )}
                        {props.text != null && (
                            <>
                                <div ref={lineRef} style={styles.line}></div>
                                <div style={styles.textWrap}>                            
                                {props.subtext != null && (
                                    <p ref={subtextRef} style={styles.subtext}>{props.subtext}</p>
                                )}
                                <p ref={textRef} style={{ ...styles.text, ...(isMobile && styles.textMobile) }}>{props.text}</p>
                            </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {props.content === "image" && (
                <div style={styles.fullWidth}>
                    <div ref={revealRef} style={styles.reveal}>
                        <img src={props.imgUrl} alt={props.imgDescription} style={styles.image} />
                    </div>
                    <p style={styles.imageDescription}>{props.imgDescription}</p>
                </div>
            )}

            {props.content === "movie" && (
                <div style={styles.fullWidth}>
                    <div ref={revealRef} style={styles.reveal}>
                        <video
                            src={props.videoUrl}
                            aria-label={props.videoDescription}
                            style={styles.image}
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    </div>
                    <p style={styles.imageDescription}>{props.videoDescription}</p>
                </div>
            )}

            {props.content === "imageText" && (
                <div style={{
                    ...styles.row,
                    flexDirection: isMobile ? "column" : (props.align === "right" ? "row-reverse" : "row"),
                }}>
                    <div style={{...styles.imageTextImage, width: isMobile ? "100%" : "60%"}}>
                        <div ref={revealRef} style={styles.reveal}>
                            <img src={props.imgUrl} alt={props.imgDescription} style={styles.image} />
                        </div>
                        <p style={styles.imageDescription}>{props.imgDescription}</p>
                    </div>
                    <div style={{...styles.imageTextText, width: isMobile ? "100%" : "35%", marginTop: isMobile ? "20px" : "0"}}>
                        <h2 style={styles.header}>{props.header}</h2>
                        <p style={styles.text}>{props.text}</p>
                    </div>
                </div>
            )}

            {/* Same layout as imageText, with a looping video (same settings as "movie") in place of the image */}
            {props.content === "videoText" && (
                <div style={{
                    ...styles.row,
                    flexDirection: isMobile ? "column" : (props.align === "right" ? "row-reverse" : "row"),
                }}>
                    <div style={{...styles.imageTextImage, width: isMobile ? "100%" : "60%"}}>
                        <div ref={revealRef} style={styles.reveal}>
                            <video
                                src={props.videoUrl}
                                aria-label={props.videoDescription}
                                style={styles.image}
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        </div>
                        <p style={styles.imageDescription}>{props.videoDescription}</p>
                    </div>
                    <div style={{...styles.imageTextText, width: isMobile ? "100%" : "35%", marginTop: isMobile ? "20px" : "0"}}>
                        <h2 style={styles.header}>{props.header}</h2>
                        <p style={styles.text}>{props.text}</p>
                    </div>
                </div>
            )}

            {props.content ==="stat" && (
                <>
                    <div style={styles.statContainer}>                        
                        {props.stat1 != null && (
                            <div style={styles.statWrap}>
                                <p style={styles.stat}>{props.stat1}</p>
                                {props.stat1Title != null && (<h2 style={styles.statTitle}>{props.stat1Title}</h2>)}
                            </div> 
                        )}
                        {props.stat2 != null && (
                            <div style={styles.statWrap}>
                                <p style={styles.stat}>{props.stat2}</p>
                                {props.stat2Title != null && (<h2 style={styles.statTitle}>{props.stat2Title}</h2>)}
                            </div> 
                        )}
                    </div> 
                </>
            )}

            {props.content == "comment" && (
                <div>
                    <h1>(props.comment)</h1>
                    <p>(props.user)</p>
                </div>
            )}

            {props.content === "projects" && (
                <div style={styles.otherProjectsSection}>
                    <h2 style={styles.otherProjectsHeading}>More Projects</h2>
                    <div style={styles.otherProjectsGrid}>
                        {otherProjects.map((item) => (
                            <a
                                key={item.link}
                                href={item.link}
                                style={styles.otherProjectCard}
                                onClick={(e) => { e.preventDefault(); openProject(item.link); }}
                            >
                                <div style={styles.otherProjectImageWrap}>
                                    <img src={item.image1} alt={item.title} style={styles.otherProjectImage} />
                                </div>
                                <h3 style={styles.otherProjectTitle}>{item.title}</h3>
                                <p style={styles.otherProjectCompany}>{item.company}</p>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SpecGroup({ title, items }) {
    return (
        <div style={styles.specsWrap}>
            <h3 style={styles.specsTitle}>{title}</h3>
            {items?.map((item, index) => (
                <p style={styles.spec} key={index}>{item}</p>
            ))}
        </div>
    );
}

const styles = {
    row: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        // marginBottom: "60px",
        boxSizing: "border-box"
    },
    introTitleName: {
        width: "100%",
        display: "flex",
        margin: "20px 0 8px 0",
        lineHeight: 0.8, // font size set inline: 90px on desktop, 3rem on small screens
        alignItems: "center",
    },
    // Sized in em so it tracks the title's font size on desktop and mobile
    introIcon: {
        height: "0.8em",
        width: "auto",
        marginRight: "0.2em",
        flexShrink: 0,
    },
    introOuter: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        paddingTop: "40px", // space between the nav and the project title
        //padding: "0 20px",
    },
    // Fixed at the bottom of the viewport (left offset set inline above)
    // rather than flowing inline at the top of the page.
    backButton: {
        position: "fixed",
        bottom: "32px",
        margin: 0,
        zIndex: 50,
    },
    intro: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        color: "#141414",
        padding: "12px 20px",
        borderRadius: "12px",
    },
    introWrap: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        paddingTop: "20px",
        color: "#141414",
    },
    introTitle: {
        fontFamily: 'var(--heading)',
        margin: "0",
        fontWeight: 700,
        // backgroundImage: "linear-gradient(77deg, #7608f4 2%, #3200f0 40%, #adaed7 60%, #ff43c7 80%, #fa005c 100%)",
        // WebkitBackgroundClip: "text",
        // WebkitTextFillColor: "transparent",
    },
    introCompany: {
        fontFamily: 'var(--heading)',
        fontWeight: 400,
        fontSize: "1rem",
        margin: "10px 0"
    },
    introOverview: {
        fontFamily: 'var(--body)',
        fontSize: "1.1rem",
        // maxWidth: "600px"
    },
    heroImage: {
        display: "block",
        width: "100%",
        borderRadius: "20px",
        margin: "24px 0 0",
    },
    // Grey panel under the hero: About on top, then Role / Platform / Year in a row
    overviewPanel: {
        marginTop: "24px",
        padding: "32px",
        background: "#f2f2f2",
        borderRadius: "20px",
        boxSizing: "border-box",
    },
    overviewAbout: {
        paddingBottom: "24px",
    },
    overviewSpecs: {
        display: "flex",
        gap: "32px",
    },
    overviewColumn: {
        flex: "1 1 0",
        minWidth: 0,
    },
    specsWrap: {
        paddingBottom: "20px",
    },
    specsTitle: {
        color: 'rgba(0, 0, 0, 0.55)',
        fontSize: "0.8rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1px",
    },
    spec: {
        margin: "4px 0 0 0",
        fontSize: "1.1rem",
        fontFamily: 'var(--body)',
    },
    fullWidth: {
        width: "100%"
    },
    imageTextImage: {
        // dynamic width via props
    },
    imageTextText: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    headerTextContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        boxSizing: "border-box",
        marginBottom: "40px",
        padding: "0 60px",
        // margin: "20px 60px",
        margin: "40px 0 80px",
    },
    headerTextWrap: {
        width: "100%",
        // maxWidth: "550px",
        display: "block",
        paddingLeft: "18px",
    },
    // Small screens: no side padding, so the text lines up with the images (the Section's 20px
    // gutter is the only margin), and a little less space above and below
    headerTextContainerMobile: {
        padding: 0,
        margin: "32px 0 64px",
    },
    headerTextWrapMobile: {
        paddingLeft: 0,
    },
    headerWrap: {
        overflow: "hidden",
    },
    header: {
        fontFamily: 'var(--heading)',
        // fontWeight: 400,
        fontWeight: "600",
        fontSize: '1.8rem',
        lineHeight: 1.07,
        color: "#1a1a1a",
        padding: "0",
        margin: "0",
    },
    textWrap: {
        display: "flex",
        flexDirection: "row",
    },
    line: {
        width: "100%",
        height: "1px",
        background: "rgba(0, 0, 0, 0.2)",
        margin: "30px 0 8px",
        transformOrigin: "left center",
    },
    subtext: {
        textTransform: "uppercase",
        fontWeight: "400",
        fontSize: "9px",
        color: "rgba(0, 0, 0, 0.5)",
        margin: "6px 16px 0 0"
    },
    text: {
        fontFamily: 'var(--body)',
        fontSize: '1.1rem',
        margin: "0",
    },
    textMobile: {
        fontSize: "1rem",
    },
    image: {
        width: "100%",
        display: "block",
        boxSizing: "border-box",
        background: "#f4f4f2",
        borderRadius: "12px",
    },
    imageDescription: {
        fontFamily: 'var(--body)',
        fontWeight: 400,
        color: "rgba(0, 0, 0, 0.45)",
        fontSize: "1rem",
        marginTop: "6px",
        textAlign: "center"
    },
    reveal: {
        visibility: "hidden", 
        position: "relative", 
        width: "100%",        
        overflow: "hidden"
    },
    statContainer: {
        display: "flex",
        width: "100%",
        boxSizing:  "border-box",
        marginBottom: "12px",
        padding: "0px 4px"
    },
    statWrap: {
        margin: '8px',
        width: "100%",
        borderRadius: "8px",
        backgroundColor: "rgba(0, 0, 0, 0.06)",
        border: "1px solid rgba(0, 0, 0, 0.12)",
        padding: "12px",
    },
    stat: {
        fontSize: "2rem",
        color: "#141414",
        padding: "0",
        margin: "0",
        fontWeight: "400"
    },
    statTitle: {
        fontSize: "1.1rem",
        color: "rgba(0, 0, 0, 0.75)",
        padding: "0",
        margin: "0 0 0 2px",
        fontWeight: "300"
    },
    otherProjectsSection: {
        width: "100%",
    },
    otherProjectsHeading: {
        fontFamily: 'var(--heading)',
        fontWeight: 600,
        fontSize: "1.8rem",
        color: "#141414",
        margin: "0 0 24px 0",
    },
    otherProjectsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "24px",
        width: "100%",
    },
    otherProjectCard: {
        display: "block",
        textDecoration: "none",
        color: "#141414",
    },
    otherProjectImageWrap: {
        width: "100%",
        height: "220px",
        borderRadius: "18px",
        overflow: "hidden",
        background: "#f4f4f2",
    },
    otherProjectImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    otherProjectTitle: {
        fontFamily: 'var(--heading)',
        fontWeight: 600,
        fontSize: "1.2rem",
        color: "#141414",
        margin: "14px 0 4px 0",
    },
    otherProjectCompany: {
        fontFamily: 'var(--body)',
        fontWeight: 400,
        fontSize: "1rem",
        color: "#666666",
        margin: "0",
    },
};