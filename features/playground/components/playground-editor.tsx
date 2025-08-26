"use client";
import React, { useRef, useEffect, useCallback } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import { TemplateFile } from "../lib/path-to-json";
import {
  configureMonaco,
  defaultEditorOptions,
  getEditorLanguage,
} from "../lib/editor-config";
import { Position } from "monaco-editor";

interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined;
  content: string;
  onContentChange: (value: string) => void;
  suggestion: string | null;
  suggestionLoading: boolean;
  suggestionPosition: { line: number; column: number } | null;
  onAcceptSuggestion: (editor: any, monaco: any) => void;
  onRejectSuggestion: (editor: any) => void;
  onTriggerSuggestion: (type: string, editor: any) => void;
}

const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
  suggestion,
  suggestionLoading,
  suggestionPosition,
  onAcceptSuggestion,
  onRejectSuggestion,
  onTriggerSuggestion,
}: PlaygroundEditorProps) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const inlineCompletionProviderRef = useRef<any>(null);
  const currentSuggestionRef = useRef<{
    text: string;
    id: string;
  } | null>(null);
  const isAcceptingSuggestionRef = useRef(false);
  const suggestionAcceptedRef = useRef(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tabCommandRef = useRef<any>(null);

  // Generate unique ID for each suggestion
  const generateSuggestionId = () =>
    `suggestion-${Date.now()}-${Math.random()}`;

  // Create inline completion provider
  const createInlineCompletionProvider = useCallback(
    (monaco: Monaco) => {
      return {
        provideInlineCompletions: async (position: any) => {
          // Don't provide completions if we're currently accepting or have already accepted
          if (
            isAcceptingSuggestionRef.current ||
            suggestionAcceptedRef.current ||
            !suggestion
          ) {
            return { items: [] };
          }

          const suggestionId = generateSuggestionId();
          currentSuggestionRef.current = {
            text: suggestion,
            id: suggestionId,
          };

          // Clean the suggestion text (remove \r characters)
          const cleanSuggestion = suggestion.replace(/\r/g, "");

          return {
            items: [
              {
                insertText: cleanSuggestion,
                range: new monaco.Range(
                  editorRef.current.getPosition().lineNumber,
                  editorRef.current.getPosition().column,
                  editorRef.current.getPosition().lineNumber,
                  editorRef.current.getPosition().column
                ),
                kind: monaco.languages.CompletionItemKind.Snippet,
                label: "AI Suggestion",
                detail: "AI-generated code suggestion",
                documentation: "Press Tab to accept",
                sortText: "0000", // High priority
                filterText: "",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.KeepWhitespace,
              },
            ],
          };
        },
        freeInlineCompletions: () => {},
      };
    },
    [suggestion]
  );

  // clear current suggestion
  const clearCurrentSuggestion = useCallback(() => {
    // console.log("Clearing current suggestion")
    currentSuggestionRef.current = null;
    suggestionAcceptedRef.current = false;
    if (editorRef.current) {
      editorRef.current.trigger("ai", "editor.action.inlineSuggest.hide", null);
    }
  }, []);

  // Accept current suggestion with double-acceptance prevention
  const acceptCurrentSuggestion = useCallback(() => {
    if (
      !editorRef.current ||
      !monacoRef.current ||
      !currentSuggestionRef.current
    ) {
      console.log("Cannot accept suggestion - missing refs");
      return false;
    }

    // CRITICAL: Prevent double acceptance with immediate flag setting
    if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
      console.log("BLOCKED: Already accepting/accepted suggestion, skipping");
      return false;
    }

    // Set flags IMMEDIATELY to prevent any race conditions
    isAcceptingSuggestionRef.current = true;
    suggestionAcceptedRef.current = true;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const currentSuggestion = currentSuggestionRef.current;

    try {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const cleanSuggestionText = currentSuggestionRef.current.text.replace(
        /\r/g,
        ""
      );
      const position = editor.getPosition();

      const modelTextAtCursor = editor
        .getModel()
        .getValueInRange(
          new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column + cleanSuggestionText.length
          )
        );

      if (modelTextAtCursor === cleanSuggestionText) {
        console.log("Suggestion already inserted at cursor");
        return false;
      }

      const range = new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
      );
      editor.executeEdits("ai-suggestion-accept", [
        {
          range,
          text: cleanSuggestionText,
          forceMoveMarkers: true,
        },
      ]);

      // Calculate new cursor position
      const lines = cleanSuggestionText.split("\n");
      const endLine = position.lineNumber + lines.length - 1;
      const endColumn =
        lines.length === 1
          ? position.column + cleanSuggestionText.length
          : lines[lines.length - 1].length + 1;

      // Move cursor to end of inserted text
      editor.setPosition({ lineNumber: endLine, column: endColumn });

      // Clear the suggestion
      clearCurrentSuggestion();

      // Call the parent's accept handler
      onAcceptSuggestion(editor, monaco);

      return true;
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      return false;
    } finally {
      // Reset accepting flag immediately
      isAcceptingSuggestionRef.current = false;

      // Keep accepted flag for longer to prevent immediate re-acceptance
      setTimeout(() => {
        suggestionAcceptedRef.current = false;
        console.log("Reset suggestionAcceptedRef flag");
      }, 1000); // Increased delay to 1 second
    }
  }, [clearCurrentSuggestion, onAcceptSuggestion]);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    // Dispose previous provider
    if (inlineCompletionProviderRef.current) {
      inlineCompletionProviderRef.current.dispose();
      // inlineCompletionProviderRef.current = null
    }

    // Clear current suggestion reference
    currentSuggestionRef.current = null;

    // Register new provider if we have a suggestion
    if (suggestion) {
      const language = getEditorLanguage(activeFile?.fileExtension || "");
      const provider = createInlineCompletionProvider(monacoRef.current);

      inlineCompletionProviderRef.current =
        monacoRef.current.languages.registerInlineCompletionsProvider(
          language,
          provider
        );

      // Small delay to ensure editor is ready, then trigger suggestions
      setTimeout(() => {
        editorRef.current?.trigger(
          "ai",
          "editor.action.inlineSuggest.trigger",
          null
        );
      }, 50);
    }

    return () => {
      if (inlineCompletionProviderRef.current) {
        inlineCompletionProviderRef.current.dispose();
        inlineCompletionProviderRef.current = null;
      }
    };
  }, [suggestion, activeFile, createInlineCompletionProvider]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    configureMonaco(monaco);

    editor.updateOptions({
      ...defaultEditorOptions,
      inlineSuggest: { enabled: true },
      suggest: { preview: false },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      cursorSmoothCaretAnimation: "on",
    });

    // CRITICAL: Override Tab key with high priority and prevent default Monaco behavior
    if (tabCommandRef.current) {
      tabCommandRef.current.dispose();
    }

    tabCommandRef.current = editor.addCommand(monaco.KeyCode.Tab, () => {
      if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
        editor.trigger("keyboard", "tab", null);
        return;
      }

      // If we have an active suggestion at the current position, try to accept it
      if (currentSuggestionRef.current) {
        const accepted = acceptCurrentSuggestion();
        if (accepted) return;
      }
      editor.trigger("keyboard", "tab", null);
    });

    // Escape to reject
    editor.addCommand(monaco.KeyCode.Escape, () => {
      // console.log("Escape pressed")
      if (currentSuggestionRef.current) {
        onRejectSuggestion(editor);
        clearCurrentSuggestion();
      }
    });

    // Listen for cursor position changes to hide suggestions when moving away
    editor.onDidChangeCursorPosition(() => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }

      // Trigger new suggestion if appropriate (simplified)
      if (
        !isAcceptingSuggestionRef.current &&
        !suggestionLoading &&
        !currentSuggestionRef.current
      ) {
        suggestionTimeoutRef.current = setTimeout(() => {
          onTriggerSuggestion("completion", editor);
        }, 300);
      }
    });

    // Listen for content changes to detect manual typing over suggestions
    editor.onDidChangeModelContent((e: any) => {
      if (isAcceptingSuggestionRef.current) return;

      // If user types while there's a suggestion, clear it (unless it's our insertion)
      if (
        currentSuggestionRef.current &&
        e.changes.length > 0 &&
        !suggestionAcceptedRef.current
      ) {
        const change = e.changes[0];

        // Check if this is our own suggestion insertion
        if (
          change.text === currentSuggestionRef.current.text ||
          change.text === currentSuggestionRef.current.text.replace(/\r/g, "")
        ) {
          // console.log("Our suggestion was inserted, not clearing")
          return;
        }

        // User typed something else, clear the suggestion
        // console.log("User typed while suggestion active, clearing")
        clearCurrentSuggestion();
      }

      const triggers = ["\n", "{", ".", "=", "(", ",", ":", ";"];
      if (e.changes.length > 0 && triggers.includes(e.changes[0].text)) {
        setTimeout(() => {
          if (
            editorRef.current &&
            !currentSuggestionRef.current &&
            !suggestionLoading
          ) {
            onTriggerSuggestion("completion", editorRef.current);
          }
        }, 100); // Small delay to let the change settle
      }
    });
    updateEditorLanguage();
  };

  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return;

    const language = getEditorLanguage(activeFile.fileExtension || "");
    try {
      monacoRef.current.editor.setModelLanguage(
        editorRef.current.getModel(),
        language
      );
    } catch (error) {
      console.warn("Failed to set editor language:", error);
    }
  };

  useEffect(() => {
    updateEditorLanguage();
  }, [activeFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      if (inlineCompletionProviderRef.current) {
        inlineCompletionProviderRef.current.dispose();
        // inlineCompletionProviderRef.current = null
      }
      if (tabCommandRef.current) {
        tabCommandRef.current.dispose();
        // tabCommandRef.current = null
      }
    };
  }, []);

  return (
    <div className="h-full relative">
      {/* Loading indicator */}
      {suggestionLoading && (
        <div className="absolute top-2 right-2 z-10 bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          AI thinking...
        </div>
      )}

      {/* Active suggestion indicator */}
      {currentSuggestionRef.current && !suggestionLoading && (
        <div className="absolute top-2 right-2 z-10 bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Press Tab to accept
        </div>
      )}

      <Editor
        height="100%"
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={
          activeFile
            ? getEditorLanguage(activeFile.fileExtension || "")
            : "plaintext"
        }
        //@ts-ignore
        options={defaultEditorOptions}
      />
    </div>
  );
};

export default PlaygroundEditor;
