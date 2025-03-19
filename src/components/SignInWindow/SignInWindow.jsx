import { useState } from 'react'
/*import { signInWindowStyles } from './signInWindowStyles.jsx'*/
import s from './SignInWindow.module.css'

export default function SignInWindow({ tab, setTab }){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = () => {
        if (password !== confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }
        console.log('Регистрация:', { name, email, password });
    };

    return (
        <div className={s.modalOverlay}>
            <div className={s.backgroundOverlay}></div>

            <div className={s.modal}>
                <button className={s.closeButton} onClick={() => {setTab('main')}}>
                    &times;
                </button>
                <h2 className={s.title}>Регистрация</h2>

                <input
                    className={s.input}
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className={s.input}
                    type="email"
                    placeholder="Электронная почта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />


                <input
                    className={s.input}
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    className={s.input}
                    type="password"
                    placeholder="Подтверждение пароля"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}

                />
                <button className={s.registerButton}onClick={handleRegister}>
                    Зарегистрироваться
                </button>
            </div>
        </div>
    )
}