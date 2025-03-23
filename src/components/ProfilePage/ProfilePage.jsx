import { useState, useContext, useEffect } from 'react';
import { LoginContext } from "../contexts/LoginContext.jsx";
import s from './ProfilePage.module.css'
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(LoginContext);
    const [userData, setUserData] = useState({
        id: 'user.id',
        firstName: "user.userName",
        lastName: '-',
        middleName: '-',
        email: 'user.email',
        phoneNumber: '-',
        gender: '-',
        password: '********',
    });
    const [flatPreferences, setFlatPreferences] = useState({
        budgetMin: '-',
        budgetMax: '-',
        preferredDistrict: '-',
        apartmentType: '-',
        minArea: '-',
        maxArea: '-',
        numberOfRooms: '-',
        hasBalcony: false,
        minFloor: '-',
        maxFloor: '-',
        houseType: '-',
        infrastructure: '-',
        transportAccessibility: '-',
    });


    const [editingPersonalData, setEditingPersonalData] = useState(false);
    const [editingFlatData, setEditingFlatData] = useState(false);

    useEffect(() => {
        if (user) {
            setUserData({
                id: user.id,
                firstName: user.userName,
                lastName: '-',
                middleName: '-',
                email: user.email,
                phoneNumber: '-',
                gender: '-',
                password: user.password,
            });
        }
    }, [user]); // Зависимость от user


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFlatPreferences({
            ...flatPreferences,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleRoomChange = (e) => {
        const { value, checked } = e.target;
        setFlatPreferences((prev) => {
            const rooms = [...prev.numberOfRooms];
            if (checked) {
                rooms.push(value);
            } else {
                const index = rooms.indexOf(value);
                if (index !== -1) {
                    rooms.splice(index, 1);
                }
            }
            return { ...prev, numberOfRooms: rooms };
        });
    };

    const handlePersonalDataSubmit = (e) => {
        e.preventDefault();
        console.log('Личные данные обновлены:', userData);
        setEditingPersonalData(false);
    };

    const handleFlatDataSubmit = (e) => {
        e.preventDefault();
        console.log('Данные для подбора квартиры:', flatPreferences);
        setEditingFlatData(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        return <p>Загрузка данных пользователя...</p>;  // Индикатор загрузки
    }

    return (
        <div className={s.container}>
            <div className={s.section}>
                <h2>Личные данные</h2>
                {editingPersonalData ? (
                    <form onSubmit={handlePersonalDataSubmit} className={s.form}>
                        <div className={s.formGroup}>
                            <label>Имя:</label>
                            <input
                                type="text"
                                name="username"
                                value={userData.username}
                                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                                className={s.input}
                            />
                        </div>
                        <div className={s.formGroup}>
                            <label>Фамилия:</label>
                            <input
                                type="text"
                                name="lastName"
                                value={flatPreferences.lastName}
                                onChange={handleInputChange}
                                className={s.input}
                            />
                        </div>
                        <div className={s.formGroup}>
                            <label>Отчество:</label>
                            <input
                                type="text"
                                name="middleName"
                                value={flatPreferences.middleName}
                                onChange={handleInputChange}
                                className={s.input}
                            />
                        </div>
                        <div className={s.formGroup}>
                            <label>Номер телефона:</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={flatPreferences.phoneNumber}
                                onChange={handleInputChange}
                                className={s.input}
                            />
                        </div>
                        <div className={s.formGroup}>
                            <label>Пол:</label>
                            <select
                                name="gender"
                                value={flatPreferences.gender}
                                onChange={handleInputChange}
                                className={s.input}
                            >
                                <option value="">Выберите пол</option>
                                <option value="male">Мужской</option>
                                <option value="female">Женский</option>
                            </select>
                        </div>
                        <button type="submit" className={s.button}>
                            Сохранить
                        </button>
                    </form>
                ) : (
                    <div>
                        <p><strong>ID Профиля:</strong> {userData.id}</p>
                        <p><strong>Имя:</strong> {userData.firstName}</p>
                        <p><strong>Фамилия:</strong> {flatPreferences.lastName}</p>
                        <p><strong>Отчество:</strong> {flatPreferences.middleName}</p>
                        <p><strong>Номер телефона:</strong> {flatPreferences.phoneNumber}</p>
                        <p><strong>Пол:</strong> {flatPreferences.gender}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <button onClick={() => setEditingPersonalData(true)} className={s.button}>
                            Редактировать личные данные
                        </button>
                    </div>
                )}
            </div>

            <div className={s.section}>
                <h2>Данные для подбора квартиры</h2>
                {editingFlatData ? (
                    <form onSubmit={handleFlatDataSubmit} className={s.form}>
                        <div className={s.formGroup}>
                            <label>Бюджет:</label>
                            <div className={s.rangeFields}>
                                <input
                                    type="number"
                                    name="budgetMin"
                                    value={flatPreferences.budgetMin}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="от"
                                />
                                <input
                                    type="number"
                                    name="budgetMax"
                                    value={flatPreferences.budgetMax}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="до"
                                />
                            </div>
                        </div>
                        <div className={s.formGroup}>
                            <label>Предпочитаемый район:</label>
                            <input
                                type="text"
                                name="preferredDistrict"
                                value={flatPreferences.preferredDistrict}
                                onChange={handleInputChange}
                                className={s.input}
                            />
                        </div>
                        <div className={s.formGroup}>
                            <label>Тип квартиры:</label>
                            <select
                                name="apartmentType"
                                value={flatPreferences.apartmentType}
                                onChange={handleInputChange}
                                className={s.input}
                            >
                                <option value="">Выберите тип</option>
                                <option value="new">Новостройка</option>
                                <option value="secondary">Вторичка</option>
                            </select>
                        </div>
                        <div className={s.formGroup}>
                            <label>Площадь:</label>
                            <div className={s.rangeFields}>
                                <input
                                    type="number"
                                    name="minArea"
                                    value={flatPreferences.minArea}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="от"
                                />
                                <input
                                    type="number"
                                    name="maxArea"
                                    value={flatPreferences.maxArea}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="до"
                                />
                            </div>
                        </div>

                        <div className={s.formGroup}>
                            <label>Количество комнат:</label>
                            <div className={s.checkboxGroup}>
                                {['студия', '1', '2', '3', '4', 'Более'].map((room) => (
                                    <label key={room} className={s.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="numberOfRooms"
                                            value={room}
                                            checked={flatPreferences.numberOfRooms.includes(room)}
                                            onChange={handleRoomChange}
                                        />
                                        {room}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className={s.formGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="hasBalcony"
                                    checked={flatPreferences.hasBalcony}
                                    onChange={handleInputChange}
                                />
                                Наличие балкона/лоджии
                            </label>
                        </div>
                        <div className={s.formGroup}>
                            <label>Этаж:</label>
                            <div className={s.rangeFields}>
                                <input
                                    type="number"
                                    name="minFloor"
                                    value={flatPreferences.minFloor}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="от"
                                />
                                <input
                                    type="number"
                                    name="maxFloor"
                                    value={flatPreferences.maxFloor}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="до"
                                />
                            </div>
                        </div>
                        <div className={s.formGroup}>
                            <label>Тип дома:</label>
                            <select
                                name="houseType"
                                value={flatPreferences.houseType}
                                onChange={handleInputChange}
                                className={s.input}
                            >
                                <option value="">Выберите тип</option>
                                <option value="brick">Кирпичный</option>
                                <option value="panel">Панельный</option>
                                <option value="monolithic">Монолитный</option>
                            </select>
                        </div>
                        <div className={s.formGroup}>
                            <label>Инфраструктура района:</label>
                            <textarea
                                name="infrastructure"
                                value={flatPreferences.infrastructure}
                                onChange={handleInputChange}
                                className={s.input}
                            />
                        </div>
                        <div className={s.formGroup}>
                            <label>Транспортная доступность:</label>
                            <textarea
                                name="transportAccessibility"
                                value={flatPreferences.transportAccessibility}
                                onChange={handleInputChange}
                                className={s.input}
                            />
                        </div>
                        <button type="submit" className={s.button}>
                            Сохранить
                        </button>
                    </form>
                ) : (
                    <div>
                        <p><strong>Бюджет:</strong> {flatPreferences.budgetMin} - {flatPreferences.budgetMax}</p>
                        <p><strong>Предпочитаемый район:</strong> {flatPreferences.preferredDistrict}</p>
                        <p><strong>Тип квартиры:</strong> {flatPreferences.apartmentType}</p>
                        <p><strong>Площадь:</strong> {flatPreferences.minArea} - {flatPreferences.maxArea}</p>
                        <p><strong>Количество комнат:</strong> {flatPreferences.numberOfRooms}</p>
                        <p><strong>Балкон/лоджия:</strong> {flatPreferences.hasBalcony ? 'Да' : 'Нет'}</p>
                        <p><strong>Этаж:</strong> {flatPreferences.minFloor} - {flatPreferences.maxFloor}</p>
                        <p><strong>Тип дома:</strong> {flatPreferences.houseType}</p>
                        <p><strong>Инфраструктура района:</strong> {flatPreferences.infrastructure}</p>
                        <p><strong>Транспортная доступность:</strong> {flatPreferences.transportAccessibility}</p>
                        <button onClick={() => setEditingFlatData(true)} className={s.button}>
                            Редактировать параметры квартиры
                        </button>
                    </div>
                )}
            </div>
            <button onClick={handleLogout} className={s.buttonExit}>
                Выйти из профиля
            </button>
        </div>
    );
};

export default ProfilePage;