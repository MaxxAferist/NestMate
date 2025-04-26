import {useContext, useState} from 'react'
import s from './Header.module.css'
import { LoginContext } from '../contexts/LoginContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function Header(){
    const { user } = useContext(LoginContext);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        console.log('Поиск:', searchQuery);
    };

    function handleButtonLoginClick(){
        if(!user){
            navigate('/LogIn');
        }else{
            navigate('/Profile');
        }
    }

    function handleButtonOnMainClick(){
        navigate('/');
    }
    return (
        <>
            <header>
                <div className={s.container}>
                    <div className={s.leftSection}>
                        <a href='/' className={s.siteNameLink}>
                            <h2 className={s.siteName}>
                                NestMate
                            </h2>
                        </a>
                    </div>
                    <div className={s.centerSection}>
                        <div className={s.searchContainer}>
                            <input
                                className={s.searchInput}
                                type="text"
                                placeholder="Поиск..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className={s.searchButton} onClick={handleSearch}>
                                Найти
                            </button>
                        </div>
                    </div>
                    <div className={s.rightSection}>
                        <button className={s.mainButton} onClick={handleButtonOnMainClick}>
                            На главную
                        </button>
                        <button className={s.signInButton}  onClick={handleButtonLoginClick}>
                            {!user && "Вход или регистрация"}
                            {user && "Профиль"}
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
};
