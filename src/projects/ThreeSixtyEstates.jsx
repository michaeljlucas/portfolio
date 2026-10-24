import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Content from '../components/Content';
import { Section } from "../components/Section";
import { project } from "../data/projects";
import  ImageCarousel from "../components/ImageCarousel";
// import Lenis from 'lenis';

export default function ThreeSixtyEstates() {
    // const lenis = new Lenis({
    //     lerp: 0.07
    // });

    // lenis.on('scroll', ScrollTrigger.update);

    // gsap.ticker.add((time)=>{
    //     lenis.raf(time * 1000)
    // })
    
    const data = project.find((p) => p.link === "#threesixtyestates");

    if (!data) return null;

    return (
        <>
        <Section>
            <Content 
                content="intro"
                iconUrl={data.icon}
                heroUrl={data.image1}
                company={data.company}
                title={data.title}
                overview={data.overview}
                roles={data.roles}
                platforms={data.platforms}
                year={data.year}
                />
        </Section>
        <Section>
            <Content // The DIY Camera Prototype
                content="headerText"
                align="left"
                title={data.detail1.header} 
                text={data.detail1.text}
                />
            <Content 
                content="image"
                imgUrl={data.image12}
                imgDescription={data.image12Description}
                />
            <Content // 360 Video : Inventing 360 Motion Graphics
                content="headerText"
                align="right"
                title={data.detail2.header} 
                text={data.detail2.text}
                />
            <Content
                content="movie"
                videoUrl={data.video3}
                videoDescription={data.video3Description}
            /> 
            <Content 
                content="image"
                imgUrl={data.image18}
                imgDescription={data.image18Description}
                />
            {/* <Content 
                content="image"
                imgUrl={data.image16}
                imgDescription={data.image16Description}
                /> */}
            <Content 
                content="image"
                imgUrl={data.image17}
                imgDescription={data.image17Description}
                />

            <Content // Branding : The House Headset
                content="headerText"
                align="center"
                text={data.detail3.text}
                title={data.detail3.header} 
                />
            <Content
                content="videoText"
                videoUrl={data.video2}
                videoDescription={data.video2Description}
                // header={data.detail3.header} 
                text={data.detail3.text}
            />
            <Content 
                content="image"
                imgUrl={data.image25}
                imgDescription={data.image25Description}
                />
            <Content // Website and Marketing
                content="headerText"
                title={data.detail4.header} 
                text={data.detail4.text}
                />
            <Content 
                content="image"
                imgUrl={data.image11}
                imgDescription={data.image11Description}
                />
            <Content 
                content="image"
                imgUrl={data.image8}
                imgDescription={data.image8Description}
                />
            <Content 
                content="image"
                imgUrl={data.image24}
                imgDescription={data.image24Description}
                />
            <Content 
                content="image"
                imgUrl={data.image7}
                imgDescription={data.image7Description}
            />
            <Content 
                content="headerText"
                title={data.detail6.header} 
                text={data.detail6.text}
                />
            {/* ... continue using data.image3, data.detail2, etc. ... */}
        </Section>
        <Section>
            <Content
                content="projects"
                currentLink={data.link}
            />
        </Section>
    </>
    );
}

const styles = {
    container: {

    }
}