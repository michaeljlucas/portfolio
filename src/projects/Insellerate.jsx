import Content from '../components/Content';
import { Section } from "../components/Section";
import { project } from "../data/projects";
import ImageCarousel from "../components/ImageCarousel";

export default function Insellerate() {
    const data = project.find((p) => p.link === "#insellerate");

    if (!data) return null;

    return (
        <>
        <Section>
            <Content 
                content="intro"
                iconUrl={data.icon}
                heroUrl="/images/insellerate/Insellerate_Mock_Mac_2.jpg"
                company={data.company}
                title={data.title}
                overview={data.overview}
                roles={data.roles}
                platforms={data.platforms}
                year={data.year}
            />
        </Section>
        <Section>
            <Content // The design system i wrote...
                content="headerText"
                title={data.detail1.header} 
                text={data.detail1.text}
            />
            <Content
                content="movie"
                videoUrl={data.video2}
                videoDescription={data.video2Description}
            />
            <Content 
                content="image"
                imgUrl={data.image3}
                imgDescription={data.image3Description}
            />
            <Content 
                content="image"
                imgUrl={data.image4}
                imgDescription={data.image4Description}
            />
            {/* <Content // An Interface Needing...
                content="headerText"
                title={data.detail2.header} 
                text={data.detail2.text}
            />
            <Content 
                content="image"
                imgUrl={data.image1}
                imgDescription={data.image1Description}
            /> */}

            {/* <Content // Prototyping a borrower messenger... 
                content="headerText"
                title={data.detail4.header} 
                text={data.detail4.text}
            /> */}

        </Section>
        <Section>
            <Content // Redesigned Status Bar
                content="headerText"
                title={data.detail7.header} 
                text={data.detail7.text}
            />
            <Content 
                content="image"
                imgUrl={data.image30}
                imgDescription={data.image30Description}
            />
            <Content // Twelve Icons that Replaced a Dropown... 
                content="headerText"
                title={data.detail6.header} 
                text={data.detail6.text}
            />
            <Content
                content="movie"
                videoUrl={data.video4}
                videoDescription={data.video4Description}
            />
            <Content 
                content="image"
                imgUrl={data.image12}
                imgDescription={data.image12Description}
            />
            <Content // A Messenger for Mortgages
                content="headerText"
                title={data.detail4.header} 
                text={data.detail4.text}
            />
            <Content
                content="movie"
                videoUrl={data.video1}
                videoDescription={data.video1Description}
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
                imgUrl={data.image29}
                imgDescription={data.image29Description}
            />
        </Section>
        <ImageCarousel
            images={[data.image18, data.image14, data.image15, data.image16, data.image17]}
            title={data.detail10.header} 
            text={data.detail10.text}
        />
        <Section>
            {/* <Content 
                content="image"
                imgUrl={data.image18}
                imgDescription={data.image18Description}
            />
            <Content 
                content="image"
                imgUrl={data.image14}
                imgDescription={data.image14Description}
            />
            <Content 
                content="image"
                imgUrl={data.image15}
                imgDescription={data.image15Description}
            />
            <Content 
                content="image"
                imgUrl={data.image16}
                imgDescription={data.image16Description}
            />
            <Content 
                content="image"
                imgUrl={data.image17}
                imgDescription={data.image17Description}
            /> */}

            {/* <Content // Manager Tools
                content="headerText"
                // Note: Check Content.jsx to see if you use "header" or "title" prop
                title={data.detail14.header} 
                text={data.detail14.text}
            />
            <Content 
                content="image"
                imgUrl={data.image19}
                imgDescription={data.image16Description}
            />
            <Content 
                content="image"
                imgUrl={data.image20}
                imgDescription={data.image17Description}
            />
            <Content 
                content="image"
                imgUrl={data.image21}
                imgDescription={data.image17Description}
            /> */}

            <Content // The system applied across the rest of the product
                content="headerText"
                title={data.detail15.header} 
                text={data.detail15.text}
            />
            <Content 
                content="image"
                imgUrl={data.image25}
                imgDescription={data.image25Description}
            />
            <Content 
                content="image"
                imgUrl={data.image23}
                imgDescription={data.image23Description}
            />
            <Content 
                content="image"
                imgUrl={data.image24}
                imgDescription={data.image24Description}
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