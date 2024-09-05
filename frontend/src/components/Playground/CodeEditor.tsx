import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/mode/clike/clike"; // For C, C++, Java
import "codemirror/mode/javascript/javascript"; // For JavaScript
import "codemirror/mode/python/python"; // For Python

import { useSocket } from "../../socket/SocketContext";

interface CodeEditorProps {
  language: string;
  editorContent: string;
  roomId: string;
  setEditorContent: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  editorContent,
  setEditorContent,
  language,
  roomId,
}) => {
  const editorRef = useRef<CodeMirror.EditorFromTextArea | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // Separate ref for the textarea
  const { socket } = useSocket();
  
  useEffect(() => {
    if (!textareaRef.current) return;
  

    const editor = CodeMirror.fromTextArea(textareaRef.current, {
      mode: language === "c" ? "text/x-csrc" : language === "c++" ? "text/x-c++src" : language === "java" ? "text/x-java" : "text/x-python",
      lineNumbers: true,
      lineWrapping: true,
      lineWiseCopyCut: true,
      autoCloseTags: true,
      autoCloseBrackets: true,
      theme: "dracula",
    });

    editor.setSize(null, 609);
    editorRef.current = editor;
    editorRef.current.setValue(editorContent);

    editorRef.current.on("changes", (instance, changes) => {
      console.log("changes", changes);
      const { origin } = changes[0];
      const code = instance.getValue();
      setEditorContent(code);
     
      if (socket && origin !== "setValue") {
        socket.emit("codeChange", { code, roomId });
      }
    });

    return () => {
      editorRef.current?.toTextArea();
      editorRef.current = null;
    };
  }, [editorContent, socket, language]);

  useEffect(() => {
    if (!socket) return;
    console.log("socket", socket);
    socket.on(
      "settingInitialCode",
      ({ code, roomId }: { code: string; roomId: string }) => {
        console.log("setInitialCode here", code);
        socket.emit("codeChange", { code, roomId });
        editorRef.current?.setValue(code);
      }
    );

    socket.on("codeChange", ({ code }) => {
      
      if (editorRef.current && code !== null) {
        console.log("codeChange here", code); 
        editorRef.current.setValue(code);
      }
    });

    return () => {
      socket.off("settingInitialCode");
      socket.off("codeChange");
    };
  }, [socket]);

  return (
    <div className="h-full w-full">
      <textarea
        ref={textareaRef}
        id="editor"
        className="w-full h-full bg-white border border-gray-300 rounded-md p-2 resize-none"
      ></textarea>
    </div>
  );
};

export default CodeEditor;
