import Content from '../components/Content';
import { Section } from "../components/Section";
import { project } from "../data/projects";

export default function Newsource() {
    const data = project.find((p) => p.link === "#newsource");

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
                <Content // Search as the interface 
                    content="headerText"
                    title={data.detail1.header} 
                    text={data.detail1.text}
                />
                <Content 
                    content="image"
                    imgUrl={data.image15}
                    imgDescription={data.image15Description}
                />
                <Content 
                    content="image"
                    imgUrl={data.image1}
                    imgDescription={data.image1Description}
                />

                <Content 
                    content="image"
                    imgUrl={data.image3}
                    imgDescription={data.image3Description}
                />

                {/* <Content // Saved Search
                    content="headerText"
                    title={data.detail2.header} 
                    text={data.detail2.text}
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
                    content="image"
                    imgUrl={data.image6}
                    imgDescription={data.image6Description}
                /> */}

                <Content // Saving Beats, not queries
                    content="headerText"
                    title={data.detail3.header} 
                    text={data.detail3.text}
                />
                <Content 
                    content="image"
                    imgUrl={data.image16}
                    imgDescription={data.image16Description}
                />
                {/* <Content 
                    content="image"
                    imgUrl={data.image5}
                    imgDescription={data.image5Description}
                /> */}
                <Content 
                    content="image"
                    imgUrl={data.image7}
                    imgDescription={data.image7Description}
                />
                <Content 
                    content="image"
                    imgUrl={data.image6}
                    imgDescription={data.image6Description}
                /> 

                {/* <Content 
                    content="headerText"
                    title={data.detail3.header} 
                    text={data.detail3.text}
                /> */}

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