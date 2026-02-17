"use client";

import { useRef, useState, useEffect } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

// Pin Monaco CDN version
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
  },
});

interface CodeEditorProps {
  code: string;
  onChange?: (value: string) => void;
  language?: string;
}

const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  minimap: { enabled: false },
  padding: { top: 16 },
  lineNumbers: "on",
  roundedSelection: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: "on",
  bracketPairColorization: { enabled: true },
};

export default function CodeEditor({ code, onChange, language = "html" }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [ready, setReady] = useState(false);

  // Pre-check Monaco can load
  useEffect(() => {
    loader.init()
      .then(() => setReady(true))
      .catch(() => setLoadError(true));
  }, []);

  const handleMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
  };

  // Fallback textarea if Monaco fails to load
  if (loadError) {
    return (
      <div className="w-full h-full min-h-[300px] sm:min-h-[400px] rounded-[16px] overflow-hidden">
        <textarea
          value={code}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={!onChange}
          className="w-full h-full bg-[#1e1e1e] text-gray-200 p-4 font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="w-full h-full min-h-[300px] sm:min-h-[400px] rounded-[16px] overflow-hidden flex items-center justify-center bg-[#1e1e1e] text-gray-500 text-sm">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] sm:min-h-[400px] rounded-[16px] overflow-hidden" aria-label="Code editor" role="textbox" aria-multiline="true">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={onChange ? (val) => onChange(val || "") : undefined}
        onMount={handleMount}
        theme="vs-dark"
        options={{ ...EDITOR_OPTIONS, readOnly: !onChange }}
      />
    </div>
  );
}
