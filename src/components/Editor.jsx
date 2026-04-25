import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint";
import "codemirror/addon/hint/show-hint.css";

const Editor = React.memo(({ socketRef, roomId, onCodeChange, onReady, username }) => {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const cursorMarkersRef = useRef({});
  const usernameRef = useRef(username);
  const hasCalledOnReadyRef = useRef(false);

  // Update ref whenever username prop changes
  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // Initialize the CodeMirror editor
  useEffect(() => {
    if (!textareaRef.current) return;

    editorRef.current = CodeMirror.fromTextArea(textareaRef.current, {
      mode: "javascript",
      theme: "dracula",
      lineNumbers: true,
      autoCloseBrackets: true,
      autoCloseTags: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete",
      },
    });

    editorRef.current.on("inputRead", (instance, change) => {
      if (change.text[0] !== " ") {
        instance.showHint({
          completeSingle: false,
        });
      }
    });

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

    editorRef.current.on("cursorActivity", (instance) => {
      const cursor = instance.getCursor();
      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.CURSOR_CHANGE, {
          roomId,
          username: usernameRef.current,
          cursor,
        });
      }
    });

    // Cleanup CodeMirror on unmount
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = null;
      }
    };
  }, []); // roomId and socketRef are stable

  // Socket Listeners
  useEffect(() => {
    let disposed = false;

    const registerListener = () => {
      if (socketRef.current && editorRef.current) {
        // Code change listener
        socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
          if (code !== null && editorRef.current) {
            const currentCode = editorRef.current.getValue();
            if (code !== currentCode) {
              editorRef.current.setValue(code);
            }
          }
        });

        // Cursor change listener
        socketRef.current.on(ACTIONS.CURSOR_CHANGE, ({ socketId, cursor, username: remoteUsername }) => {
          if (!editorRef.current) return;

          // Clear existing marker for this user
          if (cursorMarkersRef.current[socketId]) {
            cursorMarkersRef.current[socketId].clear();
          }

          // Create custom cursor element
          const cursorEl = document.createElement("span");
          cursorEl.className = "remote-cursor";
          cursorEl.setAttribute("data-username", remoteUsername || "Anonymous");

          // Create the marker (bookmark)
          const marker = editorRef.current.setBookmark(cursor, {
            widget: cursorEl,
            insertLeft: true,
          });

          cursorMarkersRef.current[socketId] = marker;
        });

        return true;
      }
      return false;
    };

    const triggerReady = () => {
      if (!hasCalledOnReadyRef.current && onReady) {
        onReady();
        hasCalledOnReadyRef.current = true;
      }
    };

    // Polling to wait for socket and editor to be ready
    if (!registerListener()) {
      const interval = setInterval(() => {
        if (disposed) {
          clearInterval(interval);
          return;
        }
        if (registerListener()) {
          clearInterval(interval);
          triggerReady();
        }
      }, 100);
    } else {
      triggerReady();
    }

    return () => {
      disposed = true;
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
        socketRef.current.off(ACTIONS.CURSOR_CHANGE);
      }
    };
  }, [onReady, socketRef]);

  return <textarea ref={textareaRef} id="realtimeEditor"></textarea>;
});

export default Editor;