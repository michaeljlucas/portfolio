import { project as projectData } from '../data/projects'
import Create3 from './Create3'
import Newsource from './Newsource'
import Insellerate from './Insellerate'
import ThreeSixtyEstates from './ThreeSixtyEstates'
import InsellerateMarketing from './InsellerateMarketing'

// Same order as the old site. Each entry's `link` matches its record in data/projects.js,
// which is where the title, company and copy come from.
const pages = [
  { link: '#create3', Component: Create3 },
  { link: '#newsource', Component: Newsource },
  { link: '#insellerate', Component: Insellerate },
  { link: '#threesixtyestates', Component: ThreeSixtyEstates },
  { link: '#inselleratemarketing', Component: InsellerateMarketing },
]

export const projects = pages.map(({ link, Component }) => {
  const data = projectData.find((p) => p.link === link)
  return {
    link,
    title: data.title,
    company: data.company,
    description: data.preview,
    video: data.video,
    Component,
  }
})
