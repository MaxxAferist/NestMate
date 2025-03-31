import { useState, useContext } from 'react'
import Header from './components/Header/Header'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignInWindow from './components/SignInWindow/SignInWindow.jsx'
import LoginWindow from './components/LoginWindow/LoginWindow.jsx'
import HomePage from './components/HomePage/HomePage.jsx'
import { LoginContext } from './components/contexts/LoginContext.jsx'
import ProfilePage from './components/ProfilePage/ProfilePage.jsx'
import FlatPage from "./components/FlatPage/FlatPage.jsx";

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
                  <Route path={'/FlatPage/:id'} element={<FlatPage/>}/>
              </Routes>
      </BrowserRouter>
  );
}
/*git init
git add *
git commit -m "Initial commit"
git branch -M main
git remote add origin <repo url>
git push -f origin main*/
export default App
