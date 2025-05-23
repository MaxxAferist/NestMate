import { useState, useContext } from 'react'
import s from './SignInWindow.module.css'
import { LoginContext } from '../contexts/LoginContext.jsx'
import { useNavigate, Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from "react-icons/fa";


export default function SignInWindow(){
    const navigate = useNavigate();
    const { register } = useContext(LoginContext)

    const [userData, setUserData]=useState({
        firstName: '',
        email: '',
        password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [isRegistered, setIsRegistered] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateFields = () => {
        const newErrors = {}


        if (!userData.firstName.trim()) { // проверка имени
            newErrors.firstName = 'Обязательное поле';
        } else if (userData.firstName.length < 1 || userData.firstName.length > 30) {
            newErrors.firstName = 'Длина имени должна быть от 1 до 30 символов';
        }


        if (!userData.email.trim()) { // проверка электронной почты
            newErrors.email = 'Обязательное поле';
        } else if (userData.email.length < 3 || userData.email.length > 256) {
            newErrors.email = 'Длина электронной почты должна быть от 3 до 256 символов';
        } else if (!userData.email.includes('@')) {
            newErrors.email = 'Электронная почта должна содержать символ @';
        }


        if (!userData.password.trim()) {  /*проверка пароля*/
            newErrors.password = 'Обязательное поле';
        } else if (userData.password.length < 1 || userData.password.length > 30) {
            newErrors.password = 'Длина пароля должна быть от 1 до 30 символов';
        }


        if (!confirmPassword.trim()) {  // проверка подтверждения пароля
            newErrors.confirmPassword = 'Обязательное поле';
        } else if (userData.password !== confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // возвращает true если ошибок нет
    }

    const handleChange = (e) => {
        const {name, value} = e.target;
        setUserData({ ...userData, [name]: value});
        setErrors({ ...errors, [name]: '' }); // сброс ошибки
    }

    const handleRegister = async(e) => {
        setMessage('');

        if (!validateFields()) {
            return;
        }

        if (userData.password !== confirmPassword) {
            setMessage("Пароли не совпадают");
            return;
        }

        try {
            const data = await register(userData);

            if(data.message === 'User registered'){
                setMessage('Профиль успешно создан!');
                setIsRegistered(true);
            } else {
                setMessage(data.message || 'Успешная регистрация');
            }
        } catch(err) {
            setMessage(
                (err.message === 'Email already exists' ? "Пользователь с таким email уже существует" : "Ошибка регистрации")
            );
        }
    };


    const isFormValid = () => { // проверка заполнения
        return (
            userData.firstName.trim() &&
            userData.email.trim() &&
            userData.password.trim() &&
            confirmPassword.trim() &&
            Object.keys(errors).length === 0
        );
    }

    return (
        <div className={s.modalOverlay}>
            <div className={s.backgroundOverlay}></div>

            <div className={s.modal}>
                <button className={s.closeButton} onClick={() => navigate('/') }>
                    &times;
                </button>
                <h2 className={s.title}>Регистрация</h2>
                <div className={s.inputGroup}>
                    <input
                        className={`${s.input} ${errors.firstName ? s.inputError: ''}  `}
                        name="firstName"
                        type="text"
                        placeholder="Имя"
                        value={userData.firstName}
                        onChange={handleChange}
                        disabled={isRegistered}
                    />
                    {errors.firstName && <span className={s.errorText} > {errors.firstName}</span>}
                </div>

                <div className={s.inputGroup}>
                    <input
                        className={`${s.input} ${errors.email ? s.inputError : ''}`}
                        name="email"
                        type="email"
                        placeholder="Электронная почта"
                        value={userData.email}
                        onChange={handleChange}
                        disabled={isRegistered}
                    />
                    {errors.email && <span className={s.errorText}>{errors.email}</span>}
                </div>

                <div className={s.inputGroup}>
                    <div className={s.passwordInputContainer}>
                        <input
                            className={`${s.input} ${errors.password ? s.inputError : ''}`}
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Пароль"
                            value={userData.password}
                            onChange={handleChange}
                            disabled={isRegistered}
                        />
                        <button
                            type="button"
                            className={s.showPasswordChange}
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isRegistered}
                        >
                            {showPassword ? (<FaEyeSlash />) : (<FaEye />)}
                        </button>
                    </div>
                    {errors.password && <span className={s.errorText}>{errors.password}</span>}
                </div>

                <div className={s.inputGroup}>
                    <div className={s.passwordInputContainer}>
                        <input
                            className={`${s.input} ${errors.confirmPassword ? s.inputError : ''}`}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Подтверждение пароля"
                            value={confirmPassword}
                            disabled={isRegistered}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className={s.showPasswordChange}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isRegistered}
                        >
                            {showConfirmPassword ? (<FaEyeSlash />) : (<FaEye />)}
                        </button>
                    </div>
                    {errors.confirmPassword && <span className={s.errorText}>{errors.confirmPassword}</span>}
                </div>
                <button
                    className={`${s.registerButton} ${isFormValid() ? s.registerButtonActive : ''}`}
                    onClick={handleRegister} disabled={isRegistered} >
                    Зарегистрироваться
                </button>
                {message && <p className={s.messageText}>{message}</p>}
                {isRegistered && <div className={s.linksField}>
                        <p><Link to={'/'} className={s.link}><span>На главную</span></Link></p>
                        <p><Link to={'/Profile'} className={s.link}><span>Перейти к заполнению профиля</span></Link></p>
                </div>}
            </div>
        </div>
    )
}