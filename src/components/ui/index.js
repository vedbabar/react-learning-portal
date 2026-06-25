// Barrel file: re-export every UI primitive from one place so module pages can
// import them in a single tidy line:
//   import { Panel, Callout, CodeBlock } from '../../components/ui'
export { default as Panel } from './Panel'
export { default as Pill } from './Pill'
export { default as Callout } from './Callout'
export { default as CodeBlock } from './CodeBlock'
export { default as RevealCard } from './RevealCard'
export { default as CheckpointCard } from './CheckpointCard'
export { default as Playground } from './Playground'
export { default as ModuleHeader } from './ModuleHeader'
export { default as SectionHeading } from './SectionHeading'
export { default as LiveSandbox } from './LiveSandbox'
