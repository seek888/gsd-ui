import { useEffect, useRef, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export function MonacoEditor({ value, onChange, onSave }: MonacoEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    setIsMounted(true);

    // Add Cmd+S / Ctrl+S keyboard shortcut
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        onSave();
      }
    );
  };

  // Handle resize with ResizeObserver
  useEffect(() => {
    if (!containerRef.current || !isMounted) return;

    const observer = new ResizeObserver(() => {
      editorRef.current?.layout();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isMounted]);

  return (
    <div ref={containerRef} className="h-full">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        theme="vs-dark"
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          fontSize: 14,
          lineHeight: 22,
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
