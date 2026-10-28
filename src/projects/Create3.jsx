import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Content from '../components/Content';
import { Section } from "../components/Section";
import { project } from "../data/projects";
import  ImageCarousel from "../components/ImageCarousel";
// import Lenis from 'lenis';

export default function Create3() {
    // const lenis = new Lenis({
    //     lerp: 0.07
    // });

    // lenis.on('scroll', ScrollTrigger.update);

    // gsap.ticker.add((time)=>{
    //     lenis.raf(time * 1000)
    // })
    
    const data = project.find((p) => p.link === "#create3");

    if (!data) return null;

    return (
        <>
        <Section>
            <Content 
                content="intro"
                iconUrl={data.icon}
                heroUrl={data.image14}
                company={data.company}
                title={data.title}
                overview={data.overview}
                roles={data.roles}
                platforms={data.platforms}
                year={data.year}
                />
        </Section>
        <Section>
            <Content 
                content="headerText"
                align="left"
                title={data.detail1.header} 
                text={data.detail1.text}
            />
            <Content 
                content="image"
                imgUrl={data.image0}
                imgDescription={data.image0Description}
            />
            <Content 
                content="image"
                imgUrl={data.image1}
                imgDescription={data.image1Description}
            />
            <Content 
                content="image"
                imgUrl={data.image15}
                imgDescription={data.image15Description}
            />
            <Content 
                content="headerText"
                align="right"
                title={data.detail2.header} 
                text={data.detail2.text}
            />
            <Content 
                content="image"
                imgUrl={data.image26}
                imgDescription={data.image26Description}
            />
            <Content 
                content="image"
                imgUrl={data.image27}
                imgDescription={data.image27Description}
            />
            <Content 
                content="image"
                imgUrl={data.image28}
                imgDescription={data.image28Description}
            />
            <Content 
                content="image"
                imgUrl={data.image31}
                imgDescription={data.image31Description}
            />
            <Content 
                content="headerText"
                align="center"
                title={data.detail3.header} 
                text={data.detail3.text}
            />
        </Section>
        <ImageCarousel
            images={[data.image20, data.image21, data.image22, data.image23, data.image24]}
        />
        <Section>
            <Content 
                content="headerText"
                align="center"
                // Note: Check Content.jsx to see if you use "header" or "title" prop
                title={data.detail4.header} 
                // subtext="this is the subtext component"
                text={data.detail4.text}
                />
            <Content 
                content="image"
                imgUrl={data.image29}
                imgDescription={data.image29Description}
                />
            <Content 
                content="image"
                imgUrl={data.image30}
                imgDescription={data.image30Description}
                />
            <Content 
                content="headerText"
                title={data.detail5.header} 
                text={data.detail5.text}
                />
            <Content 
                content="image"
                imgUrl={data.image4}
                imgDescription={data.image4Description}
                />
            <Content 
                content="image"
                imgUrl={data.image5}
                imgDescription={data.image5Description}
                />
            <Content 
                content="headerText"
                title={data.detail6.header} 
                text={data.detail6.text}
                />
            {/* <Content
                content="stat" 
                stat1 ="15m"
                stat1Title="44% increase engagment in user interaction"
                stat2 ="16m"
                stat2Title="completed that"
            /> */}
            <Content
                content="stat" 
                stat1 ="121%"
                stat1Title="increase in completed forms"
            />
            {/* ... continue using data.image3, data.detail2, etc. ... */}
        </Section>
        {/* <Section background="rgb(28, 28, 28)">
            <Content
                content="projects"
                currentLink={data.link}
            />
        </Section> */}
    </>
    );
}

const styles = {
    container: {

    }
}