import { useState } from 'react'
import s from './Header.module.css'


export default function Header({ tab, setTab }){
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        console.log('Поиск:', searchQuery);
    };

    function handleButtonLoginClick(){
        setTab('login');
    }
    return (
        <>
            <header>
                <div className={s.container}>
                    <div className={s.leftSection}>
                        <h2 className={s.siteName}>
                            NestMate
                        </h2>
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
                        <button className={s.mainButton} onClick={() => console.log('Переход на главную')}>
                            На главную
                        </button>
                        <button className={s.signInButton}  onClick={handleButtonLoginClick}>
                            Вход или регистрация
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
};
