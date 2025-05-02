import { useState, useContext } from 'react'
import s from './LoginWindow.module.css'
import { LoginContext }  from '../contexts/LoginContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function LoginWindow(){
  const navigate = useNavigate();
  const { login } = useContext( LoginContext );

  const [userData, setUserData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // очищаем ошибку
  };


  const validateFields = () => { // валидация полей
    const newErrors = {};


    if (!userData.email.trim()) { // проверка электронной почты
      newErrors.email = 'Обязательное поле';
    } else if (userData.email.length < 3 || userData.email.length > 256) {
      newErrors.email = 'Длина электронной почты должна быть от 3 до 256 символов';
    } else if (!userData.email.includes('@')) {
      newErrors.email = 'Электронная почта должна содержать символ @';
    }


    if (!userData.password.trim()) { // проверка пароля
      newErrors.password = 'Обязательное поле';
    } else if (userData.password.length < 1 || userData.password.length > 30) {
      newErrors.password = 'Пароль должен содержать от 1 до 30 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // возвращает true если ошибок нет
  };

  const handleExitClick = () =>{
    navigate('/');
  }

  const handleLogin = async(e) => {
    e.preventDefault();

    setMessage('');

    if (!validateFields()) {
      return; // если ошибки
    }
    try{
      const data = await login(userData);
      if(data.message === 'Login success'){
        setMessage('Успешный вход')
        navigate('/');
      }else{
        setMessage(data.message);
      }
    }catch(error){
      if(error.message === 'User not found'){
        setMessage("Пользователь с таким email не найден.");
      }else if(error.message === 'Invalid password'){
        setMessage('Неверный пароль.')
      } else{
        setMessage(error.message)
      }
      console.log(error)
    }
  };

  const isFormValid = () => { //проверка полей
    return (
        userData.email.trim() &&
        userData.password.trim() &&
        Object.keys(errors).length === 0
    );
  }

  return (
    <div className={s.loginWindow} >
      <div className={s.windowForm}>
        <img className={s.img} src="https://img.freepik.com/free-photo/still-life-cozy-house-with-toys_23-2149718490.jpg?t=st=1742573666~exp=1742577266~hmac=5f72295e09639da5d510a28567b9c2073271861021792bf9e988667669cda36e&w=1060"
        alt = "Игрушечный домик"/>
        <div className={s.loginForm}>
          <h2 className={s.siteName}>NestMate</h2>
          <h2 className={s.title}>Вход</h2>
          <button className={s.closeButton} onClick={handleExitClick}>
            &times;
          </button>
          <div className={s.inputGroup}>
            <input
                className={`${s.input} ${errors.email ? s.inputError : ''}`}
                name="email"
                type="email"
                placeholder="Электронная почта"
                value={userData.email}
                onChange={handleOnChange}
                required
            />
            {errors.email && <span className={s.errorText}>{errors.email}</span>}
          </div>

          <div className={s.inputGroup}>
            <input
                className={`${s.input} ${errors.password ? s.inputError : ''}`}
                name="password"
                type="password"
                placeholder="Пароль"
                value={userData.password}
                onChange={handleOnChange}
                required
            />
            {errors.password && <span className={s.errorText}>{errors.password}</span>}
          </div>

          <button
              className={`${s.loginButton} ${isFormValid() ? s.loginButtonActive : ''}`}
              onClick={handleLogin}
          >
            Войти
          </button>
          <hr/>
          <button className={s.registerButton} onClick={() => navigate('/SignIn')}>
            Зарегистрироваться
          </button>
          {message && <p className={s.messageText} >{message}</p>}
        </div>
      </div>
    </div>
  );
};



