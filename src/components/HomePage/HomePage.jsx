import {useState} from "react";
import Header from "../Header/Header.jsx";
import {Route, Routes} from "react-router-dom";
import SignInWindow from "../SignInWindow/SignInWindow.jsx";
import LoginWindow from "../LoginWindow/LoginWindow.jsx";


export default function HomePage() {
    const [tab, setTab] = useState('main');
    return (
        <>
            {tab == 'login' && <LoginWindow/>}
            <p>
                Главная страница
            </p>
        </>
    )
}