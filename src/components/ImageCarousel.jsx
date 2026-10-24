import { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Content from './Content';
import Arrow from './Arrow';

export default function ImageCarousel({ images = [], title, subtext, text, align }) { 
    const [currentImage, setCurrentImage] = useState(0); 
    const container = useRef();
    const imageContainer = useRef();

    useGSAP(() => {
        gsap.to(imageContainer.current, {
            xPercent: -100 * currentImage,
            duration: 0.8,
            ease: "power2.inOut" // A bit snappier than sine
        });
    }, { scope: container, dependencies: [currentImage] });

    const nextSlide = () => {
        setCurrentImage((prev) => (prev + 1) % images.length);
    };

    const previousSlide = () => {
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div ref={container} style={styles.container}>
            {/* Optional header/text block, same props and behaviour as Content's "headerText" */}
            {(title != null || text != null) && (
                <div style={styles.innerContainer}>
                    <Content content="headerText" title={title} subtext={subtext} text={text} align={align} />
                </div>
            )}
            {/* The "Viewport" needs overflow hidden to hide the other images */}
            <div style={styles.innerContainer}>
                <div ref={imageContainer} style={styles.imageContainer}>
                    {images.map((src, index) => (
                        <div key={index} style={styles.imageWrap}>
                            <img src={src} alt={`Slide ${index}`} style={styles.image} />
                        </div>
                    ))}
                </div>
            </div>
            <div style={styles.indicatorContainer}>
                <CarouselButton direction="left" label="Previous slide" onClick={previousSlide} />
                <div style={{ display: 'flex', gap: '5px' }}>
                    {images.map((_, i) => (
                        <div 
                            key={i} 
                            style={{
                                ...styles.indicator,
                                background: i === currentImage ? '#141414' : '#ddd' // Visual active state
                            }} 
                        />
                    ))}
                </div>
                <CarouselButton direction="right" label="Next slide" onClick={nextSlide} />
            </div>
        </div>
    ) 
}

// Same look and hover as the homepage's "Open case study" pill (see addPillHover in App.jsx):
// black outline, and on hover a black fill grows from the bottom with a white arrow on top
const HOVER = {
    hidden: "circle(0% at 50% 100%)",
    shown: "circle(120% at 50% 100%)", // round button, so it needs a bit more than the pill's 80%
    scale: 1.05,
    arrowShift: 6, // px
};

function CarouselButton({ direction, label, onClick }) {
    const button = useRef();
    const { contextSafe } = useGSAP({ scope: button });
    const shift = direction === "left" ? -HOVER.arrowShift : HOVER.arrowShift;

    const enter = contextSafe((e) => {
        if (e.pointerType !== 'mouse') return;
        gsap.to(".carouselFill", { clipPath: HOVER.shown, duration: 0.4, ease: "power2.out", overwrite: "auto" });
        gsap.to(button.current, { scale: HOVER.scale, duration: 0.2, ease: "power2.out", overwrite: "auto" });
        gsap.to(".carouselArrow", { x: shift, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    });
    const leave = contextSafe(() => {
        gsap.to(".carouselFill", { clipPath: HOVER.hidden, duration: 0.3, ease: "power2.in", overwrite: "auto" });
        gsap.to(button.current, { scale: 1, duration: 0.2, ease: "power2.out", overwrite: "auto" });
        gsap.to(".carouselArrow", { x: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    });

    return (
        <button
            ref={button}
            type="button"
            aria-label={label}
            style={styles.button}
            onClick={onClick}
            onPointerEnter={enter}
            onPointerLeave={leave}
        >
            <span className="carouselArrow" style={styles.arrow}><Arrow direction={direction} /></span>
            <span className="carouselFill" style={styles.buttonFill} aria-hidden="true">
                <span className="carouselArrow" style={styles.arrow}><Arrow direction={direction} /></span>
            </span>
        </button>
    );
}

const styles = { 
    container: {
        margin: "0 auto",
        background: "linear-gradient(rgb(224, 226, 231), rgb(255, 255, 255))",
        overflow: "hidden",
        borderTopRightRadius: "40px",
        borderTopLeftRadius: "40px",
        boxSizing: "border-box",
        padding: "30px 0",
    },
    innerContainer: {
        width: '100%',
        maxWidth: "1100px",
        margin: "0 auto",
        // overflow: 'hidden',
    },
    imageContainer: {
        display: "flex",
    },
    imageWrap: {
        // minWidth: "100%",
        flexShrink: 0,  
        width: "calc(100% - 40px)",
        margin: "0 20px",
    },
    image: {
        width: "100%",  
        // height: "400px", 
        height: "600px",
        objectFit: "cover", 
        display: "block",
        boxSizing: "border-box",
        padding: "18px",
        borderRadius: "28px",
    },
    indicatorContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        padding: "15px",
    },
    indicator: {
        height: "8px",
        width: "8px",
        border: "inset 1px solid rgba(0,0,0,.04)",
        borderRadius: "50%",
        transition: "background-color 0.3s"
    },
    button: {
        position: "relative",
        overflow: "hidden", // clips the hover fill as it grows in
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "46px",
        height: "46px",
        padding: 0,
        borderRadius: "999px",
        border: "1px solid #141414",
        background: "transparent",
        color: "#141414",
        cursor: "pointer",
    },
    buttonFill: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "999px",
        background: "#141414",
        color: "#ffffff",
        clipPath: HOVER.hidden,
    },
    arrow: {
        display: "inline-flex",
    },
}