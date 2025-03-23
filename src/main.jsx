import ReactDOM from 'react-dom/client'
import React from "react";
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import { LoginProvider } from './components/contexts/LoginContext.jsx'

const root = document.getElementById('root')

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <LoginProvider>
            <App />
        </LoginProvider>
    </React.StrictMode>
);
