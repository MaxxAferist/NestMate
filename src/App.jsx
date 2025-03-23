import { useState, useContext } from 'react'
import Header from './components/Header/Header'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignInWindow from './components/SignInWindow/SignInWindow.jsx'
import LoginWindow from './components/LoginWindow/LoginWindow.jsx'
import HomePage from './components/HomePage/HomePage.jsx'
import { LoginContext } from './components/contexts/LoginContext.jsx'
import ProfilePage from './components/ProfilePage/ProfilePage.jsx'

function App() {
    const { user } = useContext(LoginContext);
  return (
      <BrowserRouter>
              <Header/>
              <Routes>
                  <Route path={'/'} element={<HomePage/>}/>
                  <Route path={'/SignIn'} element={<SignInWindow/>}/>
                  <Route path={'/LogIn'} element={<LoginWindow/>}/>
                  <Route path={'/Profile'} element={<ProfilePage/>}/>
              </Routes>
      </BrowserRouter>
  );
}

export default App
