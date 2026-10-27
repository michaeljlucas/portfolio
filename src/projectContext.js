import { createContext } from 'react'

// Shared with everything rendered inside the open project page.
// - scroller: ref to the element the project scrolls inside (not the window), for ScrollTrigger
// - openProject(link): go to another project, e.g. from "More Projects", or to a page as "#about" /
//   "#photography"
// - links: links of projects that have a page here, so we only offer those
export const ProjectContext = createContext({
  scroller: { current: null },
  openProject: () => {},
  links: [],
})
