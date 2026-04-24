import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import { Toaster } from 'react-hot-toast';
import EditorPage from './Pages/EditorPage';

function App() {
  return (
    <>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              iconTheme: {
                primary: '#4fc3ff',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}> </Route>
          <Route path='/editor/:roomId' element={<EditorPage />}> </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
