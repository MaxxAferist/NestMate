import { useState } from 'react'
import s from './LoginWindow.module.css'

export default function LoginWindow({ tab, setTab }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Логика для входа пользователя
    console.log('Вход:', { email, password });
  };


  return (
    <div className={s.loginWindow} >
      <div className={s.windowForm}>
        <img className={s.img} src="https://img.freepik.com/free-photo/still-life-cozy-house-with-toys_23-2149718449.jpg?t=st=1742323134~exp=1742326734~hmac=4bf2879f522a7ee02ed7a6514c865405ce798cd7b05fd35ef670e907388dbc73&w=1060" />
        <div className={s.loginForm}>
          <h2 className={s.siteName}>NestMate</h2>
          <h2 className={s.title}>Вход</h2>
          <button className={s.closeButton} onClick={() => setTab('main')}>
            &times;
          </button>

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

          <button className={s.loginButton} onClick={handleLogin}>
            Войти
          </button>

          <hr/>
          <button className={s.registerButton} onClick={() => setTab('signIn')}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
};

// Стили для модального окна


