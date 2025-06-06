import ReactDOM from 'react-dom/client'
import React from "react";
import App from './App.jsx'
import { LoginProvider } from './components/contexts/LoginContext.jsx'
import {ComparisonProvider} from './components/contexts/ComparisonContext.jsx'
import {FavoritesProvider} from './components/contexts/FavoritesContext.jsx'
const root = document.getElementById('root')

ReactDOM.createRoot(root).render(
    <LoginProvider>
        <ComparisonProvider>
            <FavoritesProvider>
                <App />
            </FavoritesProvider>
        </ComparisonProvider>
    </LoginProvider>
);
