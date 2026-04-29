import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/ThemeProvider";
import { boilerplates } from "@/lib/boilerplates";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  problemId?: string;
}

export function CodeEditor({ language, value, onChange, problemId }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  // Look up the specific boilerplate for this problem and language
  let editorValue = value;
  if (!editorValue && problemId && boilerplates[problemId]) {
    editorValue = boilerplates[problemId][language];
  }
  
  // Fallback to empty if not found
  if (!editorValue) {
    editorValue = boilerplates["two-sum"]?.[language] || "";
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border">
      <Editor
        height="100%"
        language={language === "cpp" ? "cpp" : language === "c" ? "c" : language}
        value={editorValue}
        onChange={onChange}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: "line",
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          padding: { top: 16, bottom: 16 },
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "off",
          contextmenu: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  );
}

export { boilerplates as defaultCode };
