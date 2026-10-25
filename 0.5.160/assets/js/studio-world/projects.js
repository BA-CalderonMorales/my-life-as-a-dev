/* The notebook's places. Models, labels, and interactions share this map. */
export const places = [
  {
    id: "jarvis",
    number: "01",
    name: "The tool shed",
    project: "terminal-jarvis",
    x: -7.4,
    z: 3.4,
    color: "#537561",
    description: "A place to try coding tools and find what works for you.",
    note: "I kept trying new coding tools. I wanted one place to reach for them.",
    url: "https://github.com/BA-CalderonMorales/terminal-jarvis",
  },
  {
    id: "agent",
    number: "02",
    name: "Under the hood",
    project: "agent-harness",
    x: 6.2,
    z: -3.8,
    color: "#ae7854",
    description: "See the parts of a coding agent, and decide what it can do.",
    note: "Building one in Go helps me ask better questions about how agents work.",
    url: "https://github.com/BA-CalderonMorales/agent-harness",
  },
  {
    id: "algorithm",
    number: "03",
    name: "A little order",
    project: "algorithm-visual-learning",
    x: 7.1,
    z: 4.5,
    color: "#b1a267",
    description:
      "A small skyline you can put in order. Try the sorting experiment below.",
    note: "Some things are easier to understand when you can see the steps.",
    url: "https://github.com/BA-CalderonMorales/algorithm-visual-learning",
  },
  {
    id: "notebook",
    number: "04",
    name: "An open page",
    project: "my-life-as-a-dev",
    x: -7,
    z: -4.9,
    color: "#748b9b",
    description: "Family, field notes, and room for another idea.",
    note: "This is a place to keep learning in public. You can leave a little sketch below.",
    url: "https://github.com/BA-CalderonMorales/my-life-as-a-dev",
  },
];

// A fifth place to return to, separate from the four project discoveries.
export const home = {
  id: "home",
  number: "00",
  name: "Home base",
  project: "Start here",
  x: 0,
  z: 4.8,
};
