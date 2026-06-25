import EditorModule from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-jsx'

// Interop guard: react-simple-code-editor is a CJS module (exports.default).
// Depending on how Vite/esbuild resolves it, the default import can come back as
// the component itself OR as a { default } wrapper object. Unwrap to the actual
// component so <Editor/> is always a valid element type.
const Editor =
  typeof EditorModule === 'function' ? EditorModule : EditorModule.default

/**
 * A small, syntax-highlighted, editable code box.
 *
 * react-simple-code-editor is a tiny controlled <textarea> layered over a
 * highlighted <pre>; we hand it a Prism-based highlighter for JSX. It handles
 * Tab-to-indent and keeps the caret in sync with the highlight layer for us.
 * Token colors are themed in index.css under `.code-editor`.
 */
const highlight = (code) => Prism.highlight(code, Prism.languages.jsx, 'jsx')

export default function CodeEditor({ value, onChange, readOnly = false, minHeight = 260 }) {
  return (
    <div className="h-full overflow-auto bg-[#0b0b12]">
      <Editor
        value={value}
        onValueChange={(next) => {
          if (!readOnly) onChange(next)
        }}
        disabled={readOnly}
        highlight={highlight}
        padding={16}
        tabSize={2}
        insertSpaces
        className="code-editor"
        textareaClassName="code-editor__textarea"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          minHeight,
        }}
      />
    </div>
  )
}
