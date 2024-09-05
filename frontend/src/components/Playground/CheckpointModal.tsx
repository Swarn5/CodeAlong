  import React, { useEffect, useRef, useState } from "react";
  import { Checkpoint } from "../../types";
  import CodeMirror from "codemirror";

  const CheckpointModal = ({
    setShowModal,
    checkpoint,
  }: {
    setShowModal: (value: boolean) => void;
    checkpoint: Checkpoint;
  }) => {

    const textareaRef = useRef<HTMLTextAreaElement | null>(null); // Separate ref for the textarea
    const editorRef = useRef<CodeMirror.EditorFromTextArea | null>(null);
    const language = checkpoint.language;

    useEffect(() => {
      if(!textareaRef.current) return;
      const editor = CodeMirror.fromTextArea(textareaRef.current, {
        mode: language === "c" ? "text/x-csrc" : language === "cpp" ? "text/x-c++src" : language === "java" ? "text/x-java" : "text/x-python",
        lineNumbers: true,
        lineWrapping: true,
        lineWiseCopyCut: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        theme: "dracula",
        readOnly: true
      });

      editor.setSize(null, "100%");
      editorRef.current = editor;

      editorRef.current.setValue(checkpoint.code);

      return () => {
        editorRef.current?.toTextArea();
        editorRef.current = null;
      };
    },[checkpoint.code]);


    return (
      <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{checkpoint.name}</h3>
          <p className="text-gray-500 text-sm">{checkpoint.createdBy.username}</p>
          <div className="m-4 mx-0 h-80 rounded-xl shadow-sm bg-zinc-900 shadow-gray-950 overflow-hidden">
            <textarea
              ref={textareaRef} // Use the new textareaRef here
              id="editor"
              className="w-full h-full border border-gray-500 bg-zinc-900 rounded-xl resize-none "
            ></textarea>
          </div>
          <div className="modal-action">
            <button className="btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default CheckpointModal;
