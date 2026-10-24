import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Content from '../components/Content';
import { Section } from "../components/Section";
import { project } from "../data/projects";
import  ImageCarousel from "../components/ImageCarousel";
// import Lenis from 'lenis';

export default function InsellerateMarketing() {    
    const data = project.find((p) => p.link === "#inselleratemarketing");

    if (!data) return null;

    return (
        <>
        <Section>
            <Content 
                content="intro"
                iconUrl={data.icon}
                heroUrl={data.image3}
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
                content="imageText"
                imgUrl={data.image2}
                imgDescription={data.image2Description}
                header={data.detail8.header} 
                text={data.detail8.text}
                />  
            <Content 
                content="headerText"
                align="left"
                title={data.detail5.header} 
                text={data.detail5.text}
                />
            <Content 
                content="image"
                imgUrl={data.image11}
                imgDescription={data.image11Description}
            />
            <Content 
                content="image"
                imgUrl={data.image14}
                imgDescription={data.image14Description}
            />
            <Content 
                content="image"
                imgUrl={data.image12}
                imgDescription={data.image12Description}
            />
            <Content 
                content="imageText"
                imgUrl={data.image13}
                imgDescription={data.image13Description}
                header={data.detail2.header} 
                text={data.detail2.text}
            />
            <Content 
                content="headerText"
                align="left"
                title={data.detail5.header} 
                text={data.detail5.text}
                />
            <Content 
                content="image"
                imgUrl={data.image22}
                imgDescription={data.image22Description}
                />
            <Content 
                content="imageText"
                imgUrl={data.image23}
                imgDescription={data.image23Description}
                header={data.detail2.header} 
                text={data.detail2.text}
                />
        </Section>
        <Section>
            <Content 
                content="headerText"
                align="left"
                title={data.detail4.header} 
                text={data.detail4.text}
            />
            <ImageCarousel
                images={[data.image18, data.image16, data.image17, ]}
            />
        </Section>
        <Section>
            <Content // Marketing Blog
                content="headerText"
                align="left"
                title={data.detail6.header} 
                text={data.detail6.text}
                />
            {/* <Content 
                content="imageText"
                imgUrl={data.image20}
                imgDescription={data.image20Description}
                header={data.detail6.header} 
                text={data.detail6.text}
            /> */}
            <Content 
                content="image"
                imgUrl={data.image15}
                imgDescription={data.image15Description}
            />
            <Content 
                content="image"
                imgUrl={data.image21}
                imgDescription={data.image20Description}
            />
            <Content // Digital Lending Workshop
                content="headerText"
                align="left"
                title={data.detail7.header} 
                text={data.detail7.text}
            />
            <Content 
                content="image"
                imgUrl={data.image24}
                imgDescription={data.image24Description}
            />
            <Content 
                content="image"
                imgUrl={data.image25}
                imgDescription={data.image25Description}
            />
            <Content // Release V4 Swag
                content="headerText"
                align="left"
                title={data.detail3.header} 
                text={data.detail3.text}
            />
           <Content 
                content="imageText"
                align="left"
                imgUrl={data.image5}
                imgDescription={data.image5Description}
                // header={data.detail3.header} 
                // text={data.detail3.text}
                />
            <Content 
                content="image"
                imgUrl={data.image4}
                imgDescription={data.image4Description}
                />
            <Content 
                content="headerText"
                align="left"
                title={data.detail1.header} 
                text={data.detail1.text}
                />
           <Content 
                content="imageText"
                align="left"
                imgUrl={data.image1}
                imgDescription={data.image1Description}
                // header={data.detail1.header} 
                // text={data.detail1.text}
                />

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