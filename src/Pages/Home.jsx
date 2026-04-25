import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success('Created new room');
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('Room ID & username is required');
      return;
    }

    // Redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className='homePagewrapper'>
        <div className='formWrapper'>
          <img className='logoImage' src="/logo.png" alt="codesync-logo" />
          <h4 className='mainLabel'>Paste invitation Room ID</h4>
          <div className='inputGroup'>
            <input 
              type="text" 
              className='inputBox' 
              placeholder='Room ID' 
              value={roomId} 
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleInputEnter}
            />
            <input 
              type="text" 
              className='inputBox' 
              placeholder='Username' 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleInputEnter}
            />
            <button className='btn joinBtn' onClick={joinRoom}>Join</button>
            <span className='createInfo'>create a new room
               <a onClick={createNewRoom} className='createNewBtn'>new room</a>
            </span>
          </div>
        </div>     
        <footer>
          <h4>
            Built by @uditainpixels || <a href="https://github.com/uditainpixels">Github</a>
          </h4>
        </footer>
    </div>
  )
}

export default Home
