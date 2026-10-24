import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, useGSAP);
gsap.registerPlugin(SplitText);


export function Section(props) {
    return(
        <section style={{...styles.section, backgroundColor: props.background, position: props.grain ? "relative" : undefined, ...props.style}}>
            {props.grain && <span style={styles.grain}></span>}
            <div style={styles.innerSection}>
                {props.children}
            </div>
        </section>
    )
};


const styles = {
    section: {
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        width: "100%",
        // paddingTop: "80px",
        paddingBottom: "80px",
    },
    innerSection: {
        // maxWidth: "1200px",
        maxWidth: "1100px",
        padding: "0 20px",
        width: "100%",
        minWidth: 0,
    },
    grain: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        filter: "contrast(280%) brightness(150%)",
        opacity: 0.25,
        mixBlendMode: "overlay",
        pointerEvents: "none",
    },
}

