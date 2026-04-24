import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";

const Editor = ({ socketRef, roomId, onCodeChange, onReady }) => {
  const editorRef = useRef(null);

  // Initialize the CodeMirror editor
  useEffect(() => {
    editorRef.current = CodeMirror.fromTextArea(
      document.getElementById("realtimeEditor"),
      {
        mode: "javascript",
        theme: "dracula",
        lineNumbers: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
      }
    );

    editorRef.current.on("change", (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();

      onCodeChange(code);

      if (origin !== "setValue") {
        socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        });
      }
    });
  }, []);

  // Separate effect to register the socket listener.
  // socketRef.current is null when Editor mounts (child effects run before
  // parent effects), so we poll until the socket becomes available.
  useEffect(() => {
    let disposed = false;

    const registerListener = () => {
      if (socketRef.current && editorRef.current) {
        socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
          if (code !== null) {
            editorRef.current.setValue(code);
          }
        });
        return true;
      }
      return false;
    };

    // Try immediately, then poll if not ready yet
    if (!registerListener()) {
      const interval = setInterval(() => {
        if (disposed) {
          clearInterval(interval);
          return;
        }
        if (registerListener()) {
          clearInterval(interval);
          if (onReady) onReady();
        }
      }, 100);
    } else {
      if (onReady) onReady();
    }

    return () => {
      disposed = true;
      socketRef.current?.off(ACTIONS.CODE_CHANGE);
    };
  }, []);

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;