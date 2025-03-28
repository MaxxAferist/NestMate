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
        lastName: '',
        middleName: '',
        email: 'user.email',
        phoneNumber: '',
        gender: '',
        password: '********',
    });

    const [flatPreferences, setFlatPreferences] = useState({
        budgetMin: '',
        budgetMax: '',
        region: '',
        city: '',
        district: '',
        roomCount: [],
        balconyType: 'неважно',
        ceilingHeight: '',
        mortgage: 'неважно',
        minFloor: '',
        maxFloor: '',
        floorsInBuildingMin: '',
        floorsInBuildingMax: '',
        houseMaterial: [],
        renovationCondition: 'неважно',
        amenities: [],
        kitchenStove: 'неважно',
        viewFromWindows: [],
        parking: {
            countMin: '',
            type: 'неважно',
            payment: 'неважно',
        },
        infrastructure: {
            parks: '',
            hospitals: '',
            shoppingCenters: '',
            shops: '',
            schools: '',
            kindergartens: '',
        },
        transportAccessibility: {
            publicTransportStops: '',
            metroDistance: '',
            cityCenterDistance: '',
            metroTransportTime: '',
        },
        priorities: {
            budget: 3,
            roomCount: 3,
            balconyType: 3,
            ceilingHeight: 3,
            mortgage: 3,
            floor: 3,
            floorsInBuilding: 3,
            houseMaterial: 3,
            renovationCondition: 3,
            amenities: 3,
            kitchenStove: 3,
            viewFromWindows: 3,
            parking: 3,
            infrastructure: 3,
            transportAccessibility: 3
        }
    });

    const [rentPreferences, setRentPreferences] = useState({
        rentPeriod: "неважно",
        petsAllowed: false,
        childrenAllowed: false,
        immediateMoveIn: false,
        numberOfBeds: '',
        priorities: {
            rentPeriod: 3,
            petsAllowed: 3,
            childrenAllowed: 3,
            immediateMoveIn: 3,
            numberOfBeds: 3
        }
    });

    const [editingRentData, setEditingRentData] = useState(false);
    const [editingPersonalData, setEditingPersonalData] = useState(false);
    const [editingFlatData, setEditingFlatData] = useState(false);
    const [editingFlatPriorities, setEditingFlatPriorities] = useState(false);
    const [editingRentPriorities, setEditingRentPriorities] = useState(false);

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
    }, [user]);


    const [errors, setErrors] = useState({});


    const validateNumberInput = (name, value, isInteger = true, minValue = 0) => {
        let error = '';

        if (value !== '') {
            if (isNaN(value)) {
                error = 'Введите число';
            } else if (isInteger && !Number.isInteger(Number(value))) {
                error = 'Введите целое число';
            } else if (value < minValue) {
                error = `Значение должно быть ${minValue === 0 ? 'больше или равно 0' : 'больше или равно 1'}`;
            }
        }

        if (error) {
            setErrors((prev) => ({
                ...prev,
                [name]: error,
            }));
            return false;
        } else {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
            return true;
        }
    };

    useEffect(() => {
        validateRange('budgetMin', 'budgetMax', flatPreferences.budgetMin, flatPreferences.budgetMax);
    }, [flatPreferences.budgetMin, flatPreferences.budgetMax]);

    useEffect(() => {
        validateRange('minFloor', 'maxFloor', flatPreferences.minFloor, flatPreferences.maxFloor);
    }, [flatPreferences.minFloor, flatPreferences.maxFloor]);

    useEffect(() => {
        validateRange('floorsInBuildingMin', 'floorsInBuildingMax', flatPreferences.floorsInBuildingMin, flatPreferences.floorsInBuildingMax);
    }, [flatPreferences.floorsInBuildingMin, flatPreferences.floorsInBuildingMax]);


    const validateRange = (minName, maxName, minValue, maxValue) => {
        if (minValue !== '' && maxValue !== '') {
            const min = parseFloat(minValue);
            const max = parseFloat(maxValue);

            if (Math.min(min, max) !== min) {
                setErrors((prev) => ({
                    ...prev,
                    [minName]: 'Минимальное значение должно быть меньше или равно максимальному',
                    [maxName]: 'Максимальное значение должно быть больше или равно минимальному',
                }));
                return false;
            } else {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[minName];
                    delete newErrors[maxName];
                    return newErrors;
                });
                return true;
            }
        }
        return true;
    };

    const handlePersonalDataSubmit = (e) => {
        e.preventDefault();
        console.log('Личные данные обновлены:', userData);
        setEditingPersonalData(false);
    };


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'number') {
            const numericValue = value === '' ? '' : parseFloat(value);
            if (name === 'minFloor' || name === 'maxFloor' || name === 'floorsInBuildingMin' || name === 'floorsInBuildingMax' || name ==="budgetMax" || name ==="maxRentPeriod") {
                if (!validateNumberInput(name, numericValue, true, 1)) {
                    return;
                }
            }
            else if (name === 'ceilingHeight') {
                if (!validateNumberInput(name, numericValue, false, 0)) {
                    return;
                }
            }
            else {
                if (!validateNumberInput(name, numericValue, true, 0)) {
                    return;
                }
            }
        }

        setFlatPreferences({
            ...flatPreferences,
            [name]: type === 'checkbox' ? checked : value,
        });
    };


    const handleAmenitiesChange = (e) => {
        const { value, checked } = e.target;
        setFlatPreferences((prev) => {
            const amenities = [...prev.amenities];
            if (checked) {
                amenities.push(value);
            } else {
                const index = amenities.indexOf(value);
                if (index !== -1) {
                    amenities.splice(index, 1);
                }
            }
            return { ...prev, amenities };
        });
    }

    const handleViewFromWindowsChange = (e) => {
        const { value, checked } = e.target;
        setFlatPreferences((prev) => {
            const viewFromWindows = [...prev.viewFromWindows];
            if (checked) {
                viewFromWindows.push(value);
            } else {
                const index = viewFromWindows.indexOf(value);
                if (index !== -1) {
                    viewFromWindows.splice(index, 1);
                }
            }
            return { ...prev, viewFromWindows };
        });
    }

    const handleHouseMaterialChange = (e) => {
        const { value, checked } = e.target;
        setFlatPreferences((prev) => {
            const houseMaterial = [...prev.houseMaterial];
            if (checked) {
                houseMaterial.push(value);
            } else {
                const index = houseMaterial.indexOf(value);
                if (index !== -1) {
                    houseMaterial.splice(index, 1);
                }
            }
            return { ...prev, houseMaterial };
        });
    }

    const handleRoomCountChange = (e) => {
        const { value, checked } = e.target;
        setFlatPreferences(prev => {
            const newRoomCount = [...prev.roomCount];
            if (checked) {
                newRoomCount.push(value);
            } else {
                const index = newRoomCount.indexOf(value);
                if (index !== -1) {
                    newRoomCount.splice(index, 1);
                }
            }
            return { ...prev, roomCount: newRoomCount };
        });
    };

    const handleBalconyTypeChange = (e) => {
        setFlatPreferences({
            ...flatPreferences,
            balconyType: e.target.value
        });
    };

    const handleParkingChange = (e) => {
        const { name, type, value } = e.target;
        if(type === 'number') {
            const numericValue = value === '' ? '' : parseFloat(value);
            if (!validateNumberInput('parking.countMin', numericValue, true, 0)) {
                return;
            }
        }


        setFlatPreferences((prev) => ({
            ...prev,
            parking: {
                ...prev.parking,
                [name]: value,
            },
        }));
    }

    const handleInfrastructureChange = (e) => {
        const { name, type, value } = e.target;
        if(type === 'number') {
            const numericValue = value === '' ? '' : parseFloat(value);
            if (!validateNumberInput(('infrastructure.'+name), numericValue, true, 0)) {
                return;
            }
        }
        setFlatPreferences((prev) => ({
            ...prev,
            infrastructure: {
                ...prev.infrastructure,
                [name]: value,
            },
        }));
    }

    const handleTransportAccessibilityChange = (e) => {
        const { name, type, value } = e.target;
        if(type === 'number') {
            const numericValue = value === '' ? '' : parseFloat(value);
            if (!validateNumberInput(('transportAccessibility.'+name), numericValue, true, 0)) {
                return;
            }
        }
        setFlatPreferences((prev) => ({
            ...prev,
            transportAccessibility: {
                ...prev.transportAccessibility,
                [name]: value,
            },
        }));
    }

    const handleFlatDataSubmit = (e) => {
        e.preventDefault();


        const isBudgetMinValid = validateNumberInput('budgetMin', flatPreferences.budgetMin, true, 0);
        const isBudgetMaxValid = validateNumberInput('budgetMax', flatPreferences.budgetMax, true, 0);
        const isCeilingHeightValid = validateNumberInput('ceilingHeight', flatPreferences.ceilingHeight, false, 0);
        const isMinFloorValid = validateNumberInput('minFloor', flatPreferences.minFloor, true, 1);
        const isMaxFloorValid = validateNumberInput('maxFloor', flatPreferences.maxFloor, true, 1);
        const isFloorsInBuildingMinValid = validateNumberInput('floorsInBuildingMin', flatPreferences.floorsInBuildingMin, true, 1);
        const isFloorsInBuildingMaxValid = validateNumberInput('floorsInBuildingMax', flatPreferences.floorsInBuildingMax, true, 1);
        const isParkingCountMinValid = validateNumberInput('parking.countMin', flatPreferences.parking.countMin, true, 0);


        const isBudgetRangeValid = validateRange('budgetMin', 'budgetMax', flatPreferences.budgetMin, flatPreferences.budgetMax);
        const isFloorRangeValid = validateRange('minFloor', 'maxFloor', flatPreferences.minFloor, flatPreferences.maxFloor);
        const isFloorsInBuildingRangeValid = validateRange('floorsInBuildingMin', 'floorsInBuildingMax', flatPreferences.floorsInBuildingMin, flatPreferences.floorsInBuildingMax);

        if (
            isBudgetMinValid &&
            isBudgetMaxValid &&
            isCeilingHeightValid &&
            isMinFloorValid &&
            isMaxFloorValid &&
            isFloorsInBuildingMinValid &&
            isFloorsInBuildingMaxValid &&
            isParkingCountMinValid &&
            isBudgetRangeValid &&
            isFloorRangeValid &&
            isFloorsInBuildingRangeValid
        ) {
            console.log('Данные для подбора квартиры:', flatPreferences);
            setEditingFlatData(false);
        } else {
            console.log('Исправьте ошибки в форме');
        }
    }

    const handleRentInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'number') {
            const numericValue = value === '' ? '' : parseFloat(value);
            if (name === 'minRentPeriod' || name === 'maxRentPeriod' || name === 'numberOfBeds') {
                if (!validateNumberInput(name, numericValue, true, 1)) {
                    return;
                }
            }
        }

        setRentPreferences({
            ...rentPreferences,
            [name]: type === 'checkbox' ? checked : value,
        });
    }

    const handleRentPreferencesSubmit = (e) => {
        e.preventDefault();
        const isNumberOfBedsValid = validateNumberInput('numberOfBeds', rentPreferences.numberOfBeds, true, 1);
        if(
            isNumberOfBedsValid
        ){
            console.log('Данные для аренды квартиры:', rentPreferences);
            setEditingRentData(false);
        } else {
            console.log('Исправьте ошибки в форме');
        }
    }

    const handleFlatPriorityChange = (name, value) => {
        setFlatPreferences(prev => ({
            ...prev,
            priorities: {
                ...prev.priorities,
                [name]: parseInt(value)
            }
        }));
    }

    const handleRentPriorityChange = (name, value) => {
        setRentPreferences(prev => ({
            ...prev,
            priorities: {
                ...prev.priorities,
                [name]: parseInt(value)
            }
        }));
    }

    const handleFlatPrioritySubmit = (e) => {
        e.preventDefault();
        console.log('Приоритеты для подбора квартиры:', flatPreferences);
        setEditingFlatPriorities(false);
    }
    const handleRentPrioritySubmit = (e) => {
        e.preventDefault();
        console.log('Приоритеты для аренды квартиры:', rentPreferences);
        setEditingRentPriorities(false);
    }

    const PrioritySelector = ({ section, name, value }) => (
        <div className={s.prioritySelector}>
            <span className={s.priorityLabel}>приоритет:</span>
            <select
                value={value}
                onChange={(e) => ((section === 'flat') ?
                    (handleFlatPriorityChange(name, e.target.value)) :(handleRentPriorityChange(name, e.target.value)))}
                className={s.prioritySelect}
            >
                {[0, 1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                ))}
            </select>
        </div>
    );

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    if (!user) {
        return <p>Загрузка данных пользователя...</p>;  // Индикатор загрузки
    }

    return (
        <div className={s.container}>
            <div className={s.profileDataForm}>
                <h2  className={s.parametersText}>Личные данные</h2>
                {editingPersonalData ? (
                    <form onSubmit={handlePersonalDataSubmit}>
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
                        <p className={s.parametersText}><strong>ID Профиля:</strong> {userData.id}</p>
                        <p className={s.parametersText}><strong>Имя:</strong> {userData.firstName}</p>
                        <p className={s.parametersText}><strong>Фамилия:</strong> {flatPreferences.lastName}</p>
                        <p className={s.parametersText}><strong>Отчество:</strong> {flatPreferences.middleName}</p>
                        <p className={s.parametersText}><strong>Номер телефона:</strong> {flatPreferences.phoneNumber}</p>
                        <p className={s.parametersText}><strong>Пол:</strong> {flatPreferences.gender}</p>
                        <p className={s.parametersText}><strong>Email:</strong> {userData.email}</p>
                        <button onClick={() => setEditingPersonalData(true)} className={s.button}>
                            Редактировать личные данные
                        </button>
                    </div>
                )}
            </div>

            <div className={s.flatDataForm}>
                <h2  className={s.parametersText}>Параметры для подбора квартиры</h2>
                {editingFlatData &&
                    <form onSubmit={handleFlatDataSubmit}>
                        <div className={s.formGroup}>
                            <label>Регион:</label>
                            <input
                                type="text"
                                name="region"
                                value={flatPreferences.region}
                                onChange={handleInputChange}
                                className={s.input}
                            />
                        </div>
                        <div className={s.formGroup}>
                            <label>Город:</label>
                            <input
                                type="text"
                                name="city"
                                value={flatPreferences.city}
                                onChange={handleInputChange}
                                className={s.input}
                            />
                        </div>
                        <div className={s.formGroup}>
                            <label>Район:</label>
                            <input
                                type="text"
                                name="district"
                                value={flatPreferences.district}
                                onChange={handleInputChange}
                                className={s.input}
                            />
                        </div>
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
                            {errors.budgetMin && <span className={s.error}>{errors.budgetMin}</span>}
                            { (!errors.budgetMin && errors.budgetMax) && <span className={s.error}>{errors.budgetMax}</span>}
                        </div>
                        <div className={s.formGroup}>
                            <label>Количество комнат:</label>
                            <div className={s.checkboxGroup}>
                                {['студия', '1 комната', '2 комнаты', '3 комнаты', '4 комнаты', '5 комнат', '6 и более комнат'].map(room => (
                                    <label key={room} className={s.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="roomCount"
                                            value={room}
                                            checked={flatPreferences.roomCount.includes(room)}
                                            onChange={handleRoomCountChange}
                                        />
                                        {room}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className={s.formGroup}>
                            <label>Балкон/лоджия:</label>
                            <select
                                name="balconyType"
                                value={flatPreferences.balconyType}
                                onChange={handleBalconyTypeChange}
                                className={s.input}
                            >
                                <option value="неважно">Неважно</option>
                                <option value="балкон">Балкон</option>
                                <option value="лоджия">Лоджия</option>
                            </select>
                        </div>
                        <div className={s.formGroup}>
                            <label>Минимальная высота потолков:</label>
                            <input
                                type="number"
                                name="ceilingHeight"
                                value={flatPreferences.ceilingHeight}
                                onChange={handleInputChange}
                                placeholder={"метров..."}
                                className={s.input}
                                step="0.1"
                            />
                            {errors.ceilingHeight && <span className={s.error}>{errors.ceilingHeight}</span>}
                        </div>
                        <div className={s.formGroup}>
                            <label>Возможность ипотеки:</label>
                            <select
                                name="mortgage"
                                value={flatPreferences.mortgage}
                                onChange={handleInputChange}
                                className={s.input}
                            >
                                <option value="Неважно">Неважно</option>
                                <option value="да">Да</option>
                                <option value="нет">Нет</option>
                            </select>
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
                                    placeholder="мин."
                                />
                                <input
                                    type="number"
                                    name="maxFloor"
                                    value={flatPreferences.maxFloor}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="макс."
                                />
                            </div>
                            {errors.minFloor && <span className={s.error}>{errors.minFloor}</span>}
                            {(!errors.minFloor && errors.maxFloor) && <span className={s.error}>{errors.maxFloor}</span>}
                        </div>
                        <div className={s.formGroup}>
                            <label>Количество этажей в доме:</label>
                            <div className={s.rangeFields}>
                                <input
                                    type="number"
                                    name="floorsInBuildingMin"
                                    value={flatPreferences.floorsInBuildingMin}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="от"
                                />
                                <input
                                    type="number"
                                    name="floorsInBuildingMax"
                                    value={flatPreferences.floorsInBuildingMax}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="до"
                                />
                            </div>
                            {errors.floorsInBuildingMin && <span className={s.error}>{errors.floorsInBuildingMin}</span>}
                            {(!errors.floorsInBuildingMin && errors.floorsInBuildingMax) && <span className={s.error}>{errors.floorsInBuildingMax}</span>}
                        </div>
                        <div className={s.formGroup}>
                            <label>Материал дома:</label>
                            <div className={s.checkboxGroup}>
                                {['кирпич', 'бетон', 'панельный'].map((material) => (
                                    <label key={material} className={s.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="houseMaterial"
                                            value={material}
                                            checked={flatPreferences.houseMaterial.includes(material)}
                                            onChange={handleHouseMaterialChange}
                                        />
                                        {material}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className={s.formGroup}>
                            <label>Состояние ремонта:</label>
                            <select
                                name="renovationCondition"
                                value={flatPreferences.renovationCondition}
                                onChange={handleInputChange}
                                className={s.input}
                            >
                                <option value="Неважно">Неважно</option>
                                <option value="новый">Новый</option>
                                <option value="требует ремонта">Требует ремонта</option>
                            </select>
                        </div>
                        <div className={s.formGroup}>
                            <label>Дополнительные удобства:</label>
                            <div className={s.checkboxGroup}>
                                {['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение', 'Холодильник', 'Микроволновая печь', 'Стиральная машина', 'Кондиционер', 'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт'].map((amenity) => (
                                    <label key={amenity} className={s.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="amenities"
                                            value={amenity}
                                            checked={flatPreferences.amenities.includes(amenity)}
                                            onChange={handleAmenitiesChange}
                                        />
                                        {amenity}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className={s.formGroup}>
                            <label>Тип кухонной плиты:</label>
                            <select
                                name="kitchenStove"
                                value={flatPreferences.kitchenStove}
                                onChange={handleInputChange}
                                className={s.input}
                            >
                                <option value="Неважно">Неважно</option>
                                <option value="электрическая">Электрическая</option>
                                <option value="газовая">Газовая</option>
                            </select>
                        </div>
                        <div className={s.formGroup}>
                            <label>Вид из окон:</label>
                            <div className={s.checkboxGroup}>
                                {['Во двор', 'На улицу'].map((view) => (
                                    <label key={view} className={s.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="viewFromWindows"
                                            value={view}
                                            checked={flatPreferences.viewFromWindows.includes(view)}
                                            onChange={handleViewFromWindowsChange}
                                        />
                                        {view}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className={s.formGroup}>
                            <label>Парковка:</label>
                            <div className={s.rangeFields}>
                                <input
                                    type="number"
                                    name="countMin"
                                    value={flatPreferences.parking.countMin}
                                    onChange={handleParkingChange}
                                    className={s.range}
                                    placeholder="Количество мест (от)"
                                />
                                <select
                                    name="type"
                                    value={flatPreferences.parking.type}
                                    onChange={handleParkingChange}
                                    className={s.input}
                                >
                                    <option value="Неважно">Расположение парковки</option>
                                    <option value="Неважно">Неважно</option>
                                    <option value="наземные">Наземные</option>
                                    <option value="подземные">Подземные</option>
                                </select>
                                <select
                                    name="payment"
                                    value={flatPreferences.parking.payment}
                                    onChange={handleParkingChange}
                                    className={s.input}
                                >
                                    <option value="Неважно">Тип</option>
                                    <option value="Неважно">Неважно</option>
                                    <option value="платные">Платные</option>
                                    <option value="бесплатные">Бесплатные</option>
                                </select>
                            </div>
                            {errors['parking.countMin'] && <span className={s.error}>{errors['parking.countMin']}</span>}
                        </div>
                        <label style={{margin: "10px"}}>Инфраструктура района:</label>
                        <div className={s.formInlineGroup}>
                            <div className={s.inlineFormGroup}>
                                <label>Парки:</label>
                                <input
                                    type="number"
                                    name="parks"
                                    value={flatPreferences.infrastructure.parks}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'Пешком не более...'}
                                    className={s.input}
                                />
                                <span className={s.inlineLabel}>минут.</span>
                            </div>
                            {errors['infrastructure.parks'] && <span className={s.error}>{errors['infrastructure.parks']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Больницы:</label>
                                <input
                                    type="number"
                                    name="hospitals"
                                    value={flatPreferences.infrastructure.hospitals}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'Пешком не более...'}
                                    className={s.input}
                                />
                                <span className={s.inlineLabel}>минут.</span>
                            </div>
                            {errors['infrastructure.hospitals'] && <span className={s.error}>{errors['infrastructure.hospitals']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Торговые центры:</label>
                                <input
                                    type="number"
                                    name="shoppingCenters"
                                    value={flatPreferences.infrastructure.shoppingCenters}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'Пешком не более...'}
                                    className={s.input}
                                />
                                <span className={s.inlineLabel}>минут.</span>
                            </div>
                            {errors['infrastructure.shoppingCenters'] && <span className={s.error}>{errors['infrastructure.shoppingCenters']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Магазины:</label>
                                <input
                                    type="number"
                                    name="shops"
                                    value={flatPreferences.infrastructure.shops}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'Пешком не более...'}
                                    className={s.input}
                                />
                                <span className={s.inlineLabel}>минут.</span>
                            </div>
                            {errors['infrastructure.shops'] && <span className={s.error}>{errors['infrastructure.shops']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Школы:</label>
                                <input
                                    type="number"
                                    name="schools"
                                    value={flatPreferences.infrastructure.schools}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'Пешком не более...'}
                                    className={s.input}
                                />
                                <span className={s.inlineLabel}>минут.</span>
                            </div>
                            {errors['infrastructure.schools'] && <span className={s.error}>{errors['infrastructure.schools']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Детские сады:</label>
                                <input
                                    type="number"
                                    name="kindergartens"
                                    value={flatPreferences.infrastructure.kindergartens}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'Пешком не более...'}
                                    className={s.input}
                                />
                                <span className={s.inlineLabel}>минут.</span>
                            </div>
                            {errors['infrastructure.kindergartens'] && <span className={s.error}>{errors['infrastructure.kindergartens']}</span>}
                        </div>
                        <label style={{margin: "10px"}}>Транспортная доступность:</label>
                        <div className={s.formInlineGroup}>
                            <div className={s.inlineFormGroup}>
                                <label>Остановки общественного транспорта:</label>
                                <input
                                    type="number"
                                    name="publicTransportStops"
                                    value={flatPreferences.transportAccessibility.publicTransportStops}
                                    onChange={handleTransportAccessibilityChange}
                                    placeholder={'Пешком не более...'}
                                    className={s.input}
                                />
                                <span className={s.inlineLabel}>минут.</span>
                            </div>
                            {errors['transportAccessibility.publicTransportStops'] && <span className={s.error}>{errors['transportAccessibility.publicTransportStops']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Расстояние до метро:</label>
                                <input
                                    type="number"
                                    name="metroDistance"
                                    value={flatPreferences.transportAccessibility.metroDistance}
                                    onChange={handleTransportAccessibilityChange}
                                    placeholder={'Пешком не более...'}
                                    className={s.input}
                                />
                                <span className={s.inlineLabel}>минут.</span>
                            </div>
                            {errors['transportAccessibility.metroDistance'] && <span className={s.error}>{errors['transportAccessibility.metroDistance']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Время до метро на транспорте:</label>
                                <input
                                    type="number"
                                    name="metroTransportTime"
                                    value={flatPreferences.transportAccessibility.metroTransportTime}
                                    onChange={handleTransportAccessibilityChange}
                                    placeholder={'Не более...'}
                                    className={s.input}
                                />
                                <span className={s.inlineLabel}>минут.</span>
                            </div>
                            {errors['transportAccessibility.metroTransportTime'] && <span className={s.error}>{errors['transportAccessibility.metroTransportTime']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Удалённость от центра:</label>
                                <input
                                    type="number"
                                    name="cityCenterDistance"
                                    value={flatPreferences.transportAccessibility.cityCenterDistance}
                                    onChange={handleTransportAccessibilityChange}
                                    placeholder={'Пешком не более...'}
                                    className={s.input}
                                />
                                <span className={s.inlineLabel}>минут.</span>
                            </div>
                            {errors['transportAccessibility.cityCenterDistance'] && <span className={s.error}>{errors['transportAccessibility.cityCenterDistance']}</span>}
                        </div>
                        <button type="submit" className={s.buttonSave}>
                            Сохранить
                        </button>
                    </form>
                }
                {editingFlatPriorities &&
                    <form onSubmit={handleFlatPrioritySubmit}>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Бюджет</strong>
                            <PrioritySelector section="flat" name="budget" value={flatPreferences.priorities.budget} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Количество комнат</strong>
                            <PrioritySelector section="flat" name="roomCount" value={flatPreferences.priorities.roomCount} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Балкон/лоджия</strong>
                            <PrioritySelector section="flat" name="balconyType" value={flatPreferences.priorities.balconyType} />
                        </div>

                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Высота потолков</strong>
                            <PrioritySelector section="flat" name="ceilingHeight" value={flatPreferences.priorities.ceilingHeight} />
                        </div>

                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Возможность ипотеки</strong>
                            <PrioritySelector section="flat" name="mortgage" value={flatPreferences.priorities.mortgage} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Этаж</strong>
                            <PrioritySelector section="flat" name="floor" value={flatPreferences.priorities.floor} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Количество этажей в доме</strong>
                            <PrioritySelector section="flat" name="floorsInBuilding" value={flatPreferences.priorities.floorsInBuilding} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Материал дома</strong>
                            <PrioritySelector section="flat" name="houseMaterial" value={flatPreferences.priorities.houseMaterial} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Состояние ремонта</strong>
                            <PrioritySelector section="flat" name="renovationCondition" value={flatPreferences.priorities.renovationCondition} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Дополнительные удобства</strong>
                            <PrioritySelector section="flat" name="amenities" value={flatPreferences.priorities.amenities} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Кухонная плита</strong>
                            <PrioritySelector section="flat" name="kitchenStove" value={flatPreferences.priorities.kitchenStove} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Вид из окон</strong>
                            <PrioritySelector section="flat" name="viewFromWindows" value={flatPreferences.priorities.viewFromWindows} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Парковка</strong>
                            <PrioritySelector section="flat" name="parking" value={flatPreferences.priorities.parking} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Инфраструктура района</strong>
                            <PrioritySelector section="flat" name="infrastructure" value={flatPreferences.priorities.infrastructure} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Транспортная доступность</strong>
                            <PrioritySelector section="flat" name="transportAccessibility" value={flatPreferences.priorities.transportAccessibility} />
                        </div>
                        <button
                            type="submit"
                            className={s.buttonSave}>
                            Сохранить приоритеты
                        </button>
                    </form>
                }
                { (!editingFlatData && !editingFlatPriorities) &&
                    <div>
                        <div className={s.parametersContainer}>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Регион:</strong>
                                <span className={s.parameterValue}>{flatPreferences.region || 'не указан'}</span>
                            </div>

                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Город:</strong>
                                <span className={s.parameterValue}>{flatPreferences.city || 'не указан'}</span>
                            </div>

                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Район:</strong>
                                <span className={s.parameterValue}>{flatPreferences.district || 'не указан'}</span>
                            </div>

                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Бюджет:</strong>
                                <span className={s.parameterValue}>
                                    {flatPreferences.budgetMin ? `от ${flatPreferences.budgetMin} руб.` : ''}
                                    {flatPreferences.budgetMin && flatPreferences.budgetMax ? ' ' : ''}
                                    {flatPreferences.budgetMax ? `до ${flatPreferences.budgetMax} руб.` : ''}
                                    {!flatPreferences.budgetMin && !flatPreferences.budgetMax ? 'не указан' : ''}</span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.budget}</span>
                            </div>

                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Количество комнат:</strong>
                                <span className={s.parameterValue}>
                                    {flatPreferences.roomCount.length > 0
                                        ? flatPreferences.roomCount.join(', ')
                                        : 'не указано'}
                                </span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.roomCount}</span>
                            </div>

                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Балкон/лоджия:</strong>
                                <span className={s.parameterValue}>{flatPreferences.balconyType}</span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.balconyType}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Высота потолков:</strong>
                                <span className={s.parameterValue}>
                                    {flatPreferences.ceilingHeight ? `от ${flatPreferences.ceilingHeight} м` : 'не указана'} </span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.ceilingHeight}</span>
                            </div>

                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Возможность ипотеки:</strong>
                                <span className={s.parameterValue}>{flatPreferences.mortgage}</span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.mortgage}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Этаж:</strong>
                                <span className={s.parameterValue}>
                                    {flatPreferences.minFloor ? `от ${flatPreferences.minFloor} ` : ''}
                                    {flatPreferences.maxFloor ? `до ${flatPreferences.maxFloor} ` : ''}
                                    { (!flatPreferences.minFloor&&!flatPreferences.maxFloor) ? 'не указан' : 'этажей'}
                                </span>
                            <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.floor}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Количество этажей в доме:</strong>
                                <span className={s.parameterValue}>
                                    {flatPreferences.floorsInBuildingMin ? `от ${flatPreferences.floorsInBuildingMin} ` : ''}
                                    {flatPreferences.floorsInBuildingMax ? `до ${flatPreferences.floorsInBuildingMax} ` : ''}
                                    { (!flatPreferences.floorsInBuildingMin&&!flatPreferences.floorsInBuildingMax) ? 'не указано' : 'этажей'}
                                </span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.floorsInBuilding}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Материал дома:</strong>
                                <span className={s.parameterValue}>{(flatPreferences.houseMaterial.length > 0) ? flatPreferences.houseMaterial.join(', ') : 'не указан'}</span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.houseMaterial}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Состояние ремонта:</strong>
                                <span className={s.parameterValue}>{flatPreferences.renovationCondition || '?'}</span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.renovationCondition}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Дополнительные удобства:</strong>
                                <span className={s.parameterValue}>
                                    {(flatPreferences.amenities.length>0) ? flatPreferences.amenities.join(', '):'не указаны'}</span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.amenities}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Тип кухонной плиты:</strong>
                                <span className={s.parameterValue}>{flatPreferences.kitchenStove}</span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.kitchenStove}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Вид из окон:</strong>
                                <span className={s.parameterValue}>
                                    {(flatPreferences.viewFromWindows.length>0)?flatPreferences.viewFromWindows.join(', '):'не указан'}</span>
                                <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.viewFromWindows}</span>
                            </div>
                            <div className={s.parameterBlock}>
                                <div className={s.parameterRow}>
                                    <strong className={s.parameterName}>Парковка:</strong>
                                    <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.parking}</span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Количество мест от:</span>
                                    <span className={s.parameterValue}>{flatPreferences.parking.countMin || 'не указано'}</span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Тип парковки:</span>
                                    <span className={s.parameterValue}>{flatPreferences.parking.type}</span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Платная/бесплатная:</span>
                                    <span className={s.parameterValue}>{flatPreferences.parking.payment}</span>
                                </div>
                            </div>

                            <div className={s.parameterBlock}>
                                <div className={s.parameterRow}>
                                    <strong className={s.parameterName}>Инфраструктура района:</strong>
                                    <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.infrastructure}</span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Парки:</span>
                                    <span className={s.parameterValue}>
                                        {flatPreferences.infrastructure.parks ? `Пешком не более ${flatPreferences.infrastructure.parks} минут`
                                            : 'расстояние не указано'}
                                    </span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Больницы:</span>
                                        <span className={s.parameterValue}>
                                        {flatPreferences.infrastructure.hospitals ? `Пешком не более ${flatPreferences.infrastructure.hospitals} минут`
                                            : 'расстояние не указано'}
                                        </span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Торговые центры:</span>
                                    <span className={s.parameterValue}>
                                        {flatPreferences.infrastructure.shoppingCenters ? `Пешком не более ${flatPreferences.infrastructure.shoppingCenters} минут`
                                            : 'расстояние не указано'}
                                    </span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Магазины:</span>
                                    <span className={s.parameterValue}>
                                        {flatPreferences.infrastructure.shops ? `Пешком не более ${flatPreferences.infrastructure.shops} минут`
                                            : 'расстояние не указано'}
                                    </span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Школы:</span>
                                    <span className={s.parameterValue}>
                                        {flatPreferences.infrastructure.schools ? `Пешком не более ${flatPreferences.infrastructure.schools} минут`
                                            : 'расстояние не указано'}
                                    </span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Детские сады:</span>
                                    <span className={s.parameterValue}>
                                        {flatPreferences.infrastructure.kindergartens ? `Пешком не более ${flatPreferences.infrastructure.kindergartens} минут`
                                            : 'расстояние не указано'}
                                    </span>
                                </div>
                            </div>

                            <div className={s.parameterBlock}>
                                <div className={s.parameterRow}>
                                    <strong className={s.parameterName}>Транспортная доступность:</strong>
                                    <span className={s.parameterPriority}>приоритет: {flatPreferences.priorities.transportAccessibility}</span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Остановки общественного транспорта:</span>
                                    <span className={s.parameterValue}>
                                        {flatPreferences.transportAccessibility.publicTransportStops
                                            ? `Пешком не более ${flatPreferences.transportAccessibility.publicTransportStops} минут`
                                            : 'расстояние не указано'}
                                    </span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Расстояние до метро:</span>
                                    <span className={s.parameterValue}>
                                        {flatPreferences.transportAccessibility.metroDistance
                                            ? `Пешком не более ${flatPreferences.transportAccessibility.metroDistance} минут`
                                            : 'расстояние не указано'}
                                    </span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Время до метро на транспорте:</span>
                                    <span className={s.parameterValue}>
                                        {flatPreferences.transportAccessibility.metroTransportTime
                                            ? `Не более ${flatPreferences.transportAccessibility.metroTransportTime} минут`
                                            : 'время не указано'}
                                    </span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Удалённость от центра города:</span>
                                    <span className={s.parameterValue}>
                                        {flatPreferences.transportAccessibility.cityCenterDistance
                                            ? `Пешком не более ${flatPreferences.transportAccessibility.cityCenterDistance} минут`
                                            : 'расстояние не указано'}
                                    </span>
                                </div>

                            </div>
                        </div>
                        <button  onClick={() => setEditingFlatData(true)} className={s.buttonChangeParameters}>
                            Редактировать параметры квартиры
                        </button>
                        <button onClick={() => setEditingFlatPriorities(true)} className={s.buttonChangePriorities}>
                            Расставить приоритеты параметров
                        </button>
                    </div>
                }
            </div>
            <div className={s.rentDataForm}>
                <h2 className={s.parametersText}>Параметры для аренды</h2>
                { editingRentData &&
                    <form onSubmit={handleRentPreferencesSubmit} className={s.form}>
                        <div className={s.formGroup}>
                            <label>Срок аренды:</label>
                            <select
                                name="rentPeriod"
                                value={rentPreferences.rentPeriod || "неважно"}
                                onChange={handleRentInputChange}
                                className={s.input}
                            >
                                <option value="неважно">Неважно</option>
                                <option value="1 день">1 день</option>
                                <option value="несколько дней">Несколько дней</option>
                                <option value="месяц">Месяц</option>
                                <option value="несколько месяцев">Несколько месяцев</option>
                                <option value="год">Год</option>
                                <option value="более года">Более года</option>
                            </select>
                        </div>
                        <div className={s.formGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="petsAllowed"
                                    checked={rentPreferences.petsAllowed}
                                    onChange={handleRentInputChange}
                                />
                                Возможность проживания с животными
                            </label>
                        </div>
                        <div className={s.formGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="childrenAllowed"
                                    checked={rentPreferences.childrenAllowed}
                                    onChange={handleRentInputChange}
                                />
                                Возможность проживания с детьми
                            </label>
                        </div>
                        <div className={s.formGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="immediateMoveIn"
                                    checked={rentPreferences.immediateMoveIn}
                                    onChange={handleRentInputChange}
                                />
                                Возможность немедленного заселения
                            </label>
                        </div>
                        <div className={s.formGroup}>
                            <label>Количество спальных мест:</label>
                            <input
                                type="number"
                                name="numberOfBeds"
                                value={rentPreferences.numberOfBeds}
                                onChange={handleRentInputChange}
                                className={s.input}
                            />
                            {errors.numberOfBeds && <span className={s.error}>{errors.numberOfBeds}</span>}
                        </div>
                        <button type="submit" className={s.buttonSave}>
                            Сохранить
                        </button>
                    </form>
                }
                {editingRentPriorities &&
                    <form onSubmit={handleRentPrioritySubmit}>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Срок аренды</strong>
                            <PrioritySelector section="rent" name="rentPeriod" value={rentPreferences.priorities.rentPeriod} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Проживание с животными</strong>
                            <PrioritySelector section="rent" name="petsAllowed" value={rentPreferences.priorities.petsAllowed} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Проживание с детьми</strong>
                            <PrioritySelector section="rent" name="childrenAllowed" value={rentPreferences.priorities.childrenAllowed} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Немедленное заселение</strong>
                            <PrioritySelector section="rent" name="immediateMoveIn" value={rentPreferences.priorities.immediateMoveIn} />
                        </div>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Количество спальных мест</strong>
                            <PrioritySelector section="rent" name="numberOfBeds" value={rentPreferences.priorities.numberOfBeds} />
                        </div>
                        <button
                            type="submit"
                            className={s.buttonSave}>
                            Сохранить приоритеты
                        </button>
                    </form>
                }
                {(!editingRentData && !editingRentPriorities) &&
                    <div>
                        <div className={s.parametersContainer}>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Срок аренды:</strong>
                                <span className={s.parameterValue}>{rentPreferences.rentPeriod || 'не указан'}</span>
                                <span className={s.parameterPriority}>приоритет: {rentPreferences.priorities.rentPeriod}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Проживание с животными:</strong>
                                <span className={s.parameterValue}>{rentPreferences.petsAllowed ? 'Да' : 'неважно'}</span>
                                <span className={s.parameterPriority}>приоритет: {rentPreferences.priorities.petsAllowed}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Проживание с детьми:</strong>
                                <span className={s.parameterValue}>{rentPreferences.childrenAllowed ? 'Да' : 'неважно'}</span>
                                <span className={s.parameterPriority}>приоритет: {rentPreferences.priorities.childrenAllowed}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Немедленное заселение:</strong>
                                <span className={s.parameterValue}>{rentPreferences.immediateMoveIn ? 'Да' : 'неважно'}</span>
                                <span className={s.parameterPriority}>приоритет: {rentPreferences.priorities.immediateMoveIn}</span>
                            </div>
                            <div className={s.parameterRow}>
                                <strong className={s.parameterName}>Количество спальных мест:</strong>
                                <span className={s.parameterValue}>{rentPreferences.numberOfBeds || 'не указано'}</span>
                                <span className={s.parameterPriority}>приоритет: {rentPreferences.priorities.numberOfBeds}</span>
                            </div>
                        </div>
                        <button onClick={() => setEditingRentData(true)} className={s.buttonChangeParameters}>
                            Редактировать параметры аренды
                        </button>
                        <button onClick={() => setEditingRentPriorities(true)} className={s.buttonChangePriorities}>
                            Расставить приоритеты параметров
                        </button>
                    </div>
                }
            </div>
            <button onClick={handleLogout} className={s.buttonExit}>
                Выйти из профиля
            </button>
        </div>
    );
}

export default ProfilePage;