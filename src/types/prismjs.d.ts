declare module 'prismjs' {
  interface PrismStatic {
    highlightElement: (element: Element) => void;
  }
  const Prism: PrismStatic;
  export default Prism;
}

declare module 'prismjs/components/*';