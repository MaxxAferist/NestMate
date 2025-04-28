import Header from './components/Header/Header'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignInWindow from './components/SignInWindow/SignInWindow.jsx'
import LoginWindow from './components/LoginWindow/LoginWindow.jsx'
import HomePage from './components/HomePage/HomePage.jsx'
import ProfilePage from './components/ProfilePage/ProfilePage.jsx'
import FlatPage from "./components/FlatPage/FlatPage.jsx";
import FavoritesPage from './components/FavoritesPage/FavoritesPage.jsx'
import ComparisonPage from './components/ComparisonPage/ComparisonPage.jsx'
function App() {
  return (
      <BrowserRouter>
              <Header/>
              <Routes>
                  <Route path={'/'} element={<HomePage/>}/>
                  <Route path={'/SignIn'} element={<SignInWindow/>}/>
                  <Route path={'/LogIn'} element={<LoginWindow/>}/>
                  <Route path={'/Profile'} element={<ProfilePage/>}/>
                  <Route path={'/FlatPage/:id'} element={<FlatPage/>}/>
                  <Route path={'/Favorites'} element={<FavoritesPage/>}/>
                  <Route path={'/Comparison'} element={<ComparisonPage/>}/>
              </Routes>
      </BrowserRouter>
  );
}

export default App
