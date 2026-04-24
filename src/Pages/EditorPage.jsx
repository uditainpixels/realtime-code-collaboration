import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ACTIONS } from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../Socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';


const EditorPage = () => {

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate(); //react navigator hook to navigate between pages
  const { roomId } = useParams(); //yaha se roomId milta hai url se, jise hum socket connection me use karenge
  //useparams- react router ka hook hai jise hum url se parameters ko access karne ke liye use karte hain, yaha pe hum roomId ko url se access kar rahe hain

  useEffect(() => {
      const init = async () => {
        socketRef.current = initSocket();
        socketRef.current.on('connect_error', (err) => handleErrors(err)); //websocket error handling - connection error
        socketRef.current.on('connect_failed', (err) => handleErrors(err)); //websocket error handling - connection failed

        function handleErrors(e) {
          console.log('socket error', e);
          toast.error('Socket connection failed, trying to reconnect...');
          // Let socket.io handle reconnections instead of immediately navigating away
          // navigate('/'); 
        } 
          

        // We delay the JOIN emit until the Editor component is fully mounted
        // and has attached its CODE_CHANGE socket listener.
        // This is handled by the onReady callback on the Editor component.

        socketRef.current.on(
          ACTIONS.JOINED,
          ({ clients, username, socketId }) => {
            // Compare socket IDs instead of usernames to ensure unique identification
            if (socketId !== socketRef.current.id) {
              toast.success(`${username} joined the room.`);
              console.log(`${username} joined`);
              
              // Only existing users should send their code to the new user.
              // If the new user sends it to themselves, they might overwrite 
              // the code with their initial empty editor state.
              socketRef.current.emit(ACTIONS.SYNC_CODE, {
                code: codeRef.current,
                socketId,
              });
            }
            setClients(clients);
      });

        socketRef.current.on(
          ACTIONS.DISCONNECTED,
          ({ socketId, username }) => {
            toast.success(`${username} left the room.`);
            setClients((prev) =>
              prev.filter((client) => client.socketId !== socketId)
            );
          }
        );
        
      };
      init();

      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current.off(ACTIONS.JOINED);
          socketRef.current.off(ACTIONS.DISCONNECTED);
        }
      };
  },[])

  const [clients, setClients] = useState([
   
  ]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard!');

    } catch (err) {
      toast.error('Failed to copy Room ID.');
      console.error(err);
    }
  };

  function leaveRoom() {
    navigate('/'); 
  }

  //logic to handle if username nhi milta h toh usse home page pe le jana
  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className='mainWrap'>
      <div className='aside'>
        <div className='asideInner'>
          <div className='logo'>
            <img className='logoImage' src="/logo.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className='clientsList'>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        {/* Room ID ko clipboard par copy karne ke liye button */}
        <button className='btn copyBtn' onClick={copyRoomId}>
          Copy ROOM ID
        </button>

        <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>

      </div>
      <div className='editorWrap'>
        <Editor 
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
                codeRef.current = code;
            }}
            onReady={() => {
                // Now we are sure the editor listener is registered, we can join.
                if (socketRef.current) {
                    socketRef.current.emit(ACTIONS.JOIN, {
                        roomId,
                        username: location.state?.username,
                    });
                }
            }}
        />
      </div>
    </div>
  )
}
export default EditorPage