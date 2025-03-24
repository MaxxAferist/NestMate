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
        ceilingHeight: '',
        mortgage: 'не важно',
        minFloor: '',
        maxFloor: '',
        floorsInBuildingMin: '',
        floorsInBuildingMax: '',
        houseMaterial: [],
        renovationCondition: 'не важно',
        amenities: [],
        kitchenStove: 'не важно',
        viewFromWindows: [],
        parking: {
            countMin: '',
            type: 'не важно',
            payment: 'не важно',
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
        },
        priorities: {
            budget: 3,
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
        minRentPeriod: '',
        maxRentPeriod: '',
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

    useEffect(() => {
        validateRange('minRentPeriod', 'maxRentPeriod', rentPreferences.minRentPeriod, rentPreferences.maxRentPeriod);
    }, [rentPreferences.minRentPeriod, rentPreferences.maxRentPeriod]);

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

        const isMinRentPeriodValid = validateNumberInput('minRentPeriod', rentPreferences.minRentPeriod, true, 0);
        const isMaxRentPeriodValid = validateNumberInput('maxRentPeriod', rentPreferences.maxRentPeriod, true, 1);
        const isNumberOfBedsValid = validateNumberInput('numberOfBeds', rentPreferences.numberOfBeds, true, 1);

        const isRentPeriodRangeValid = validateRange('minRentPeriod', 'maxRentPeriod', rentPreferences.minRentPeriod, rentPreferences.maxRentPeriod);

        if(
            isMinRentPeriodValid &&
            isMaxRentPeriodValid &&
            isNumberOfBedsValid &&
            isRentPeriodRangeValid
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
                <h2  className={s.parametersText}>Данные для подбора квартиры</h2>
                {editingFlatData &&
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
                                {/*{errors.budgetMin && <span className={s.error}>{errors.budgetMin}</span>}*/}
                                <input
                                    type="number"
                                    name="budgetMax"
                                    value={flatPreferences.budgetMax}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="до"
                                />
                                {/* {errors.budgetMax && <span className={s.error}>{errors.budgetMax}</span>}*/}
                            </div>
                            {errors.budgetMin && <span className={s.error}>{errors.budgetMin}</span>}
                            { (!errors.budgetMin && errors.budgetMax) && <span className={s.error}>{errors.budgetMax}</span>}
                        </div>
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
                            <label>Высота потолков (от):</label>
                            <input
                                type="number"
                                name="ceilingHeight"
                                value={flatPreferences.ceilingHeight}
                                onChange={handleInputChange}
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
                                <option value="не важно">Не важно</option>
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
                                <option value="не важно">Не важно</option>
                                <option value="новый">Новый</option>
                                <option value="требует ремонта">Требует ремонта</option>
                            </select>
                        </div>
                        <div className={s.formGroup}>
                            <label>Дополнительные параметры:</label>
                            <div className={s.checkboxGroup}>
                                {['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение', 'Холодильник', 'Микроволновая печь', 'Стиральная машина', 'Кондиционер', 'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа'].map((amenity) => (
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
                            <label>Кухонная плита:</label>
                            <select
                                name="kitchenStove"
                                value={flatPreferences.kitchenStove}
                                onChange={handleInputChange}
                                className={s.input}
                            >
                                <option value="не важно">Не важно</option>
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
                                    placeholder="мест (от)"
                                />
                                <select
                                    name="type"
                                    value={flatPreferences.parking.type}
                                    onChange={handleParkingChange}
                                    className={s.input}
                                >
                                    <option value="не важно">Не важно</option>
                                    <option value="наземные">Наземные</option>
                                    <option value="подземные">Подземные</option>
                                </select>
                                <select
                                    name="payment"
                                    value={flatPreferences.parking.payment}
                                    onChange={handleParkingChange}
                                    className={s.input}
                                >
                                    <option value="не важно">Не важно</option>
                                    <option value="платные">Платные</option>
                                    <option value="бесплатные">Бесплатные</option>
                                </select>
                            </div>
                            {errors['parking.countMin'] && <span className={s.error}>{errors['parking.countMin']}</span>}
                        </div>
                        <label>Инфраструктура района:</label>
                        <div className={s.fromInlineGroup}>

                            <div className={s.inlineFormGroup}>
                                <label>Парки:</label>
                                <input
                                    type="number"
                                    name="parks"
                                    value={flatPreferences.infrastructure.parks}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.parks'] && <span className={s.error}>{errors['infrastructure.parks']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Больницы:</label>
                                <input
                                    type="number"
                                    name="hospitals"
                                    value={flatPreferences.infrastructure.hospitals}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.hospitals'] && <span className={s.error}>{errors['infrastructure.hospitals']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Торговые центры:</label>
                                <input
                                    type="number"
                                    name="shoppingCenters"
                                    value={flatPreferences.infrastructure.shoppingCenters}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.shoppingCenters'] && <span className={s.error}>{errors['infrastructure.shoppingCenters']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Магазины:</label>
                                <input
                                    type="number"
                                    name="shops"
                                    value={flatPreferences.infrastructure.shops}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.shops'] && <span className={s.error}>{errors['infrastructure.shops']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Школы:</label>
                                <input
                                    type="number"
                                    name="schools"
                                    value={flatPreferences.infrastructure.schools}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.schools'] && <span className={s.error}>{errors['infrastructure.schools']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Детские сады:</label>
                                <input
                                    type="number"
                                    name="kindergartens"
                                    value={flatPreferences.infrastructure.kindergartens}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.kindergartens'] && <span className={s.error}>{errors['infrastructure.kindergartens']}</span>}
                        </div>
                        <label style={{marginBottom: "5px"}}>Транспортная доступность:</label>
                        <div className={s.fromInlineGroup}>
                            <div className={s.inlineFormGroup}>
                                <label>Остановки общественного транспорта:</label>
                                <input
                                    type="number"
                                    name="publicTransportStops"
                                    value={flatPreferences.transportAccessibility.publicTransportStops}
                                    onChange={handleTransportAccessibilityChange}
                                    placeholder={'Расстояние (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['transportAccessibility.publicTransportStops'] && <span className={s.error}>{errors['transportAccessibility.publicTransportStops']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Расстояние до метро:</label>
                                <input
                                    type="number"
                                    name="metroDistance"
                                    value={flatPreferences.transportAccessibility.metroDistance}
                                    onChange={handleTransportAccessibilityChange}
                                    placeholder={'Расстояние (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['transportAccessibility.metroDistance'] && <span className={s.error}>{errors['transportAccessibility.metroDistance']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Удалённость от центра:</label>
                                <input
                                    type="number"
                                    name="cityCenterDistance"
                                    value={flatPreferences.transportAccessibility.cityCenterDistance}
                                    onChange={handleTransportAccessibilityChange}
                                    placeholder={'Расстояние (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['transportAccessibility.cityCenterDistance'] && <span className={s.error}>{errors['transportAccessibility.cityCenterDistance']}</span>}
                        </div>
                        <button type="submit" className={s.buttonSave}>
                            Сохранить
                        </button>
                    </form>
                }
                {editingFlatPriorities &&
                    <form onSubmit={handleFlatPrioritySubmit} className={s.form}>
                        <div className={s.priorityRow}>
                            <strong className={s.paramName}>Бюджет</strong>
                            <PrioritySelector section="flat" name="budget" value={flatPreferences.priorities.budget} />
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
                        <p className={s.parametersText}><strong>Бюджет:</strong> {flatPreferences.budgetMin} - {flatPreferences.budgetMax}</p>
                        <p className={s.parametersText}><strong>Регион:</strong> {flatPreferences.region}</p>
                        <p className={s.parametersText}><strong>Город:</strong> {flatPreferences.city}</p>
                        <p className={s.parametersText}><strong>Район:</strong> {flatPreferences.district}</p>
                        <p className={s.parametersText}><strong>Высота потолков (от):</strong> {flatPreferences.ceilingHeight}</p>
                        <p className={s.parametersText}><strong>Возможность ипотеки:</strong> {flatPreferences.mortgage}</p>
                        <p className={s.parametersText}><strong>Этаж:</strong> {flatPreferences.minFloor} - {flatPreferences.maxFloor}</p>
                        <p className={s.parametersText}><strong>Количество этажей в доме:</strong> {flatPreferences.floorsInBuildingMin} - {flatPreferences.floorsInBuildingMax}</p>
                        <p className={s.parametersText}><strong>Материал дома:</strong> {flatPreferences.houseMaterial.join(', ')}</p>
                        <p className={s.parametersText}><strong>Состояние ремонта:</strong> {flatPreferences.renovationCondition}</p>
                        <p className={s.parametersText}><strong>Дополнительные параметры:</strong> {flatPreferences.amenities.join(', ')}</p>
                        <p className={s.parametersText}><strong>Кухонная плита:</strong> {flatPreferences.kitchenStove}</p>
                        <p className={s.parametersText}><strong>Вид из окон:</strong> {flatPreferences.viewFromWindows.join(', ')}</p>
                        <p className={s.parametersText}><strong>Парковка:</strong> Количество: {flatPreferences.parking.countMin}, Тип: {flatPreferences.parking.type}, Оплата: {flatPreferences.parking.payment}</p>
                        <p className={s.parametersText}><strong>Инфраструктура района:</strong></p>
                        <ul>
                            <li>Парки: {flatPreferences.infrastructure.parks}</li>
                            <li>Больницы: {flatPreferences.infrastructure.hospitals}</li>
                            <li>Торговые центры: {flatPreferences.infrastructure.shoppingCenters}</li>
                            <li>Магазины: {flatPreferences.infrastructure.shops}</li>
                            <li>Школы: {flatPreferences.infrastructure.schools}</li>
                            <li>Детские сады: {flatPreferences.infrastructure.kindergartens}</li>
                        </ul>
                        <p  className={s.parametersText}><strong>Транспортная доступность:</strong></p>
                        <ul>
                            <li>Остановки общественного транспорта: {flatPreferences.transportAccessibility.publicTransportStops}</li>
                            <li>Расстояние до метро: {flatPreferences.transportAccessibility.metroDistance}</li>
                            <li>Удалённость от центра: {flatPreferences.transportAccessibility.cityCenterDistance}</li>
                        </ul>
                        <button  onClick={() => setEditingFlatData(true)} className={s.buttonChangeParameters}>
                            Редактировать параметры квартиры
                        </button>
                        <button onClick={() => setEditingFlatPriorities(true)} className={s.buttonChangePriorities}>
                            Расставить приоритеты параметров
                        </button>
                    </div>
                }
                {/*{editingFlatData ? (
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
                                {errors.budgetMin && <span className={s.error}>{errors.budgetMin}</span>}
                                <input
                                    type="number"
                                    name="budgetMax"
                                    value={flatPreferences.budgetMax}
                                    onChange={handleInputChange}
                                    className={s.range}
                                    placeholder="до"
                                />
                                {errors.budgetMax && <span className={s.error}>{errors.budgetMax}</span>}
                            </div>
                            {errors.budgetMin && <span className={s.error}>{errors.budgetMin}</span>}
                            { (!errors.budgetMin && errors.budgetMax) && <span className={s.error}>{errors.budgetMax}</span>}
                        </div>
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
                            <label>Высота потолков (от):</label>
                            <input
                                type="number"
                                name="ceilingHeight"
                                value={flatPreferences.ceilingHeight}
                                onChange={handleInputChange}
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
                                <option value="не важно">Не важно</option>
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
                                <option value="не важно">Не важно</option>
                                <option value="новый">Новый</option>
                                <option value="требует ремонта">Требует ремонта</option>
                            </select>
                        </div>
                        <div className={s.formGroup}>
                            <label>Дополнительные параметры:</label>
                            <div className={s.checkboxGroup}>
                                {['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение', 'Холодильник', 'Микроволновая печь', 'Стиральная машина', 'Кондиционер', 'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа'].map((amenity) => (
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
                            <label>Кухонная плита:</label>
                            <select
                                name="kitchenStove"
                                value={flatPreferences.kitchenStove}
                                onChange={handleInputChange}
                                className={s.input}
                            >
                                <option value="не важно">Не важно</option>
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
                                    placeholder="мест (от)"
                                />
                                <select
                                    name="type"
                                    value={flatPreferences.parking.type}
                                    onChange={handleParkingChange}
                                    className={s.input}
                                >
                                    <option value="не важно">Не важно</option>
                                    <option value="наземные">Наземные</option>
                                    <option value="подземные">Подземные</option>
                                </select>
                                <select
                                    name="payment"
                                    value={flatPreferences.parking.payment}
                                    onChange={handleParkingChange}
                                    className={s.input}
                                >
                                    <option value="не важно">Не важно</option>
                                    <option value="платные">Платные</option>
                                    <option value="бесплатные">Бесплатные</option>
                                </select>
                            </div>
                            {errors['parking.countMin'] && <span className={s.error}>{errors['parking.countMin']}</span>}
                        </div>
                        <label>Инфраструктура района:</label>
                        <div className={s.fromInlineGroup}>

                            <div className={s.inlineFormGroup}>
                                <label>Парки:</label>
                                <input
                                    type="number"
                                    name="parks"
                                    value={flatPreferences.infrastructure.parks}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.parks'] && <span className={s.error}>{errors['infrastructure.parks']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Больницы:</label>
                                <input
                                    type="number"
                                    name="hospitals"
                                    value={flatPreferences.infrastructure.hospitals}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.hospitals'] && <span className={s.error}>{errors['infrastructure.hospitals']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Торговые центры:</label>
                                <input
                                    type="number"
                                    name="shoppingCenters"
                                    value={flatPreferences.infrastructure.shoppingCenters}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.shoppingCenters'] && <span className={s.error}>{errors['infrastructure.shoppingCenters']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Магазины:</label>
                                <input
                                    type="number"
                                    name="shops"
                                    value={flatPreferences.infrastructure.shops}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.shops'] && <span className={s.error}>{errors['infrastructure.shops']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Школы:</label>
                                <input
                                    type="number"
                                    name="schools"
                                    value={flatPreferences.infrastructure.schools}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.schools'] && <span className={s.error}>{errors['infrastructure.schools']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Детские сады:</label>
                                <input
                                    type="number"
                                    name="kindergartens"
                                    value={flatPreferences.infrastructure.kindergartens}
                                    onChange={handleInfrastructureChange}
                                    placeholder={'В радиусе, (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['infrastructure.kindergartens'] && <span className={s.error}>{errors['infrastructure.kindergartens']}</span>}
                        </div>
                        <label style={{marginBottom: "5px"}}>Транспортная доступность:</label>
                        <div className={s.fromInlineGroup}>
                            <div className={s.inlineFormGroup}>
                                <label>Остановки общественного транспорта:</label>
                                <input
                                    type="number"
                                    name="publicTransportStops"
                                    value={flatPreferences.transportAccessibility.publicTransportStops}
                                    onChange={handleTransportAccessibilityChange}
                                    placeholder={'Расстояние (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['transportAccessibility.publicTransportStops'] && <span className={s.error}>{errors['transportAccessibility.publicTransportStops']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Расстояние до метро:</label>
                                <input
                                    type="number"
                                    name="metroDistance"
                                    value={flatPreferences.transportAccessibility.metroDistance}
                                    onChange={handleTransportAccessibilityChange}
                                    placeholder={'Расстояние (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['transportAccessibility.metroDistance'] && <span className={s.error}>{errors['transportAccessibility.metroDistance']}</span>}
                            <div className={s.inlineFormGroup}>
                                <label>Удалённость от центра:</label>
                                <input
                                    type="number"
                                    name="cityCenterDistance"
                                    value={flatPreferences.transportAccessibility.cityCenterDistance}
                                    onChange={handleTransportAccessibilityChange}
                                    placeholder={'Расстояние (м)'}
                                    className={s.input}
                                />
                            </div>
                            {errors['transportAccessibility.cityCenterDistance'] && <span className={s.error}>{errors['transportAccessibility.cityCenterDistance']}</span>}
                        </div>
                        <button type="submit" className={s.button}>
                            Сохранить
                        </button>
                    </form>
                ) : (
                    {editingFlatPriorities ? (

                    ):(

                        )
                    }
                )}*/}
            </div>
            <div className={s.rentDataForm}>
                <h2 className={s.parametersText}>Параметры для аренды</h2>
                { editingRentData &&
                    <form onSubmit={handleRentPreferencesSubmit} className={s.form}>
                        <div className={s.formGroup}>
                            <label>Срок аренды:</label>
                            <div className={s.rangeFields}>
                                <input
                                    type="number"
                                    name="minRentPeriod"
                                    value={rentPreferences.minRentPeriod}
                                    onChange={handleRentInputChange}
                                    className={s.range}
                                    placeholder="мин"
                                />

                                <input
                                    type="number"
                                    name="maxRentPeriod"
                                    value={rentPreferences.maxRentPeriod}
                                    onChange={handleRentInputChange}
                                    className={s.range}
                                    placeholder="макс"
                                />
                            </div>
                            {errors.minRentPeriod && <span className={s.error}>{errors.minRentPeriod}</span>}
                            {(!errors.minRentPeriod && errors.maxRentPeriod) && <span className={s.error}>{errors.maxRentPeriod}</span>}

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
                    <form onSubmit={handleRentPrioritySubmit} className={s.form}>
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
                        <p className={s.parametersText}><strong>Срок аренды:</strong> {rentPreferences.minRentPeriod} - {rentPreferences.maxRentPeriod}</p>
                        <p className={s.parametersText}><strong>Проживание с животными:</strong> {rentPreferences.petsAllowed ? 'Да' : 'Нет'}</p>
                        <p className={s.parametersText}><strong>Проживание с детьми:</strong> {rentPreferences.childrenAllowed ? 'Да' : 'Нет'}</p>
                        <p className={s.parametersText}><strong>Немедленное заселение:</strong> {rentPreferences.immediateMoveIn ? 'Да' : 'Нет'}</p>
                        <p className={s.parametersText}><strong>Количество спальных мест:</strong> {rentPreferences.numberOfBeds}</p>
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