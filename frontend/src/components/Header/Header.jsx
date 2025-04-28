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
                        <h2 className={s.siteName} onClick={()=> navigate('/')}>
                            NestMate
                        </h2>
                    </div>
                    <div className={s.rightSection}>
                        <button className={s.comparisonButton} onClick={()=>navigate('/Comparison')}>
                            Сравнение
                        </button>
                        <button className={s.favoritesButton} onClick={()=> navigate('/Favorites')}>
                            Избранное
                        </button>
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
