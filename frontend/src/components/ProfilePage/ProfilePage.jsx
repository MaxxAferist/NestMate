import { useState, useContext, useEffect } from 'react';
import { LoginContext } from "../contexts/LoginContext.jsx";
import s from './ProfilePage.module.css'
import { useNavigate } from 'react-router-dom'
import {ProfileParameterRow,
    FormInputField,
    ButtonSave,
    RangeInput,
    InlineFromField,
    FlatParameterRow,
    InfrastructureParameterRow,
    ComparisonMatrix,
    InlineCheckboxField,
} from './ProfilePageComponents.jsx';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { userData, setUserData, saveUserData, user, logout, flatPreferences, setFlatPreferences,
        rentPreferences, setRentPreferences, savePreferences, loadUserData } = useContext(LoginContext);

    const [editingRentData, setEditingRentData] = useState(false);
    const [editingPersonalData, setEditingPersonalData] = useState(false);
    const [editingFlatData, setEditingFlatData] = useState(false);
    const [editingFlatPriorities, setEditingFlatPriorities] = useState(false);
    const [editingRentPriorities, setEditingRentPriorities] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadUserData(user.id);
        }
    }, [user, loadUserData]);


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
        validateRange('areaMin', 'areaMax', flatPreferences.areaMin, flatPreferences.areaMax);
    }, [flatPreferences.areaMin, flatPreferences.areaMax]);

    useEffect(() => {
        validateRange('rentPriceMin', 'rentPriceMax', rentPreferences.rentPayment.rentPriceMin, rentPreferences.rentPayment.rentPriceMax);
    }, [rentPreferences.rentPayment.rentPriceMin, rentPreferences.rentPayment.rentPriceMax]);

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

    const handlePersonalDataSubmit = async (e) => {
        e.preventDefault();
        try {
            await saveUserData(userData);
            setEditingPersonalData(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
        }
    };

    const handleUserDataChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value,
        });
    }


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
            let newRoomCount = [...prev.roomCount];

            if (checked) {
                newRoomCount.push(value);
            } else {
                const index = newRoomCount.indexOf(value);
                if (index !== -1) {
                    newRoomCount.splice(index, 1);
                }
            }

            newRoomCount.sort((a, b) => {
                const order = ['студия', '1 комната', '2 комнаты', '3 комнаты', '4 комнаты', '5 комнат', '6 и более комнат'];
                return order.indexOf(a) - order.indexOf(b);
            });

            return { ...prev, roomCount: newRoomCount };
        });
    };



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

    const handleFlatDataSubmit = async (e) => {
        e.preventDefault();

        const isBudgetMinValid = validateNumberInput('budgetMin', flatPreferences.budgetMin, true, 0);
        const isBudgetMaxValid = validateNumberInput('budgetMax', flatPreferences.budgetMax, true, 0);
        const isCeilingHeightValid = validateNumberInput('ceilingHeight', flatPreferences.ceilingHeight, false, 0);
        const isMinFloorValid = validateNumberInput('minFloor', flatPreferences.minFloor, true, 1);
        const isMaxFloorValid = validateNumberInput('maxFloor', flatPreferences.maxFloor, true, 1);
        const isFloorsInBuildingMinValid = validateNumberInput('floorsInBuildingMin', flatPreferences.floorsInBuildingMin, true, 1);
        const isFloorsInBuildingMaxValid = validateNumberInput('floorsInBuildingMax', flatPreferences.floorsInBuildingMax, true, 1);



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
            isBudgetRangeValid &&
            isFloorRangeValid &&
            isFloorsInBuildingRangeValid
        ) {
            try {
                await savePreferences();
                console.log('Параметры квартиры успешно сохранены!');
                setEditingFlatData(false);
            } catch (err) {
                console.log('Ошибка сохранения параметров квартиры');
            }
        } else {
            console.log('Исправьте ошибки в форме');
        }
    }

    const handleRentInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'number') {
            const numericValue = value === '' ? '' : parseFloat(value);
            if (name === 'rentPriceMin' || name === 'rentPriceMax' || name === 'numberOfBeds') {
                if (!validateNumberInput(name, numericValue, true, 1)) {
                    return;
                }
            }
        }

        if (name === 'petsAllowed' || name === 'childrenAllowed' || name === 'immediateMoveIn' || name === "smokingAllowed") {
            setRentPreferences(prev => ({
                ...prev,
                rentalTerms: {
                    ...prev.rentalTerms,
                    [name]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setRentPreferences(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    }

    const handleRentPaymentChange = (e) => {
        const { name, type, value } = e.target;
        if(type === 'number') {
            const numericValue = value === '' ? '' : parseFloat(value);
            if (!validateNumberInput((name), numericValue, true, 0)) {
                return;
            }
        }
        setRentPreferences((prev) => ({
            ...prev,
            rentPayment: {
                ...prev.rentPayment,
                [name]: value,
            },
        }));
    }

    const handleRentPreferencesSubmit = async (e) => {
        e.preventDefault();
        const isNumberOfBedsValid = validateNumberInput('numberOfBeds', rentPreferences.numberOfBeds, true, 1);
        if(
            isNumberOfBedsValid
        ){
            try {
                await savePreferences();
                console.log('Параметры аренды успешно изменены!');
                setEditingRentData(false);
            } catch (err) {
                console.log('Ошибка при сохранении параметров');
            }
        } else {
            console.log('Исправьте ошибки в форме');
        }
    }


    const handleRentPrioritySubmit = async (e) => {
        e.preventDefault();
        try {
            await savePreferences();
            console.log('Параметры аренды успешно изменены!');
            setEditingRentPriorities(false);
        } catch (err) {
            console.log('Ошибка при сохранении параметров');
        }

    }


    const flatParameters = [
        'budget', 'area', 'roomCount', 'apartmentType', 'balconyType',
        'ceilingHeight', 'floor', 'floorsInBuilding', 'houseMaterial',
        'renovationCondition', 'amenities',
        'infrastructure', 'transportAccessibility'
    ];
    const flatParametersNames = {
        budget: "Цена",
        area: "Площадь",
        roomCount: "Количество комнат",
        apartmentType: "Вторичка/новостройка",
        balconyType: "Балкон/лоджия",
        ceilingHeight: "Высота потолков",
        floor: "Этаж",
        floorsInBuilding: "Этажей в доме",
        houseMaterial: "Материал дома",
        renovationCondition: "Состояние ремонта",
        amenities: "Дополнительные удобства",
        infrastructure: "Инфраструктура района",
        transportAccessibility: "Транспортная доступность"
    };

    const rentParameters = [
        'rentPayment','rentalTerms','numberOfBeds','area', 'roomCount', 'balconyType',
        'ceilingHeight', 'floor', 'floorsInBuilding', 'houseMaterial',
        'renovationCondition', 'amenities',
        'infrastructure', 'transportAccessibility'
    ];
    const rentParametersNames = {
        rentPayment: "Цена и срок аренды",
        rentalTerms: "Условия аренды и заселения",
        numberOfBeds: "Количество спальных мест",
        area: "Площадь",
        roomCount: "Количество комнат",
        balconyType: "Балкон/лоджия",
        ceilingHeight: "Высота потолков",
        floor: "Этаж",
        floorsInBuilding: "Этажей в доме",
        houseMaterial: "Материал дома",
        renovationCondition: "Состояние ремонта",
        amenities: "Дополнительные удобства",
        infrastructure: "Инфраструктура района",
        transportAccessibility: "Транспортная доступность"
    };

    const handleSaveFlatPriorities = async (matrix, weights) => {
        try {
            setFlatPreferences(prev => ({
                ...prev,
                comparisonMatrix: matrix,
                priorities: {
                    ...prev.priorities,
                    ...weights
                }
            }));
            await savePreferences();
            console.log('Приоритеты и матрица сравнений успешно сохранены!');
            setEditingFlatPriorities(false);
        } catch (err) {
            console.error('Ошибка при сохранении приоритетов:', err);
        }
    };

    const handleSaveRentPriorities = async (matrix, weights) => {
        try {
            setRentPreferences(prev => ({
                ...prev,
                comparisonMatrix: matrix,
                priorities: {
                    ...prev.priorities,
                    ...weights
                }
            }));
            await savePreferences();
            console.log('Приоритеты и матрица сравнений успешно сохранены!');
            setEditingRentPriorities(false);
        } catch (err) {
            console.error('Ошибка при сохранении приоритетов:', err);
        }
    };

    const handleCancelChangingFlatPriorities = () => {
        setEditingFlatPriorities(false)
    }
    const handleCancelChangingRentPriorities = () => {
        setEditingRentPriorities(false)
    }


    const handleLogout = () => {
        logout();
        navigate('/');
    }

    if (!user) {
        return <p>Загрузка данных пользователя...</p>;
    }

    return (
        <div className={s.container}>
            <div className={s.profileDataForm}>
                <h2  className={s.parametersText}>Личные данные</h2>
                {editingPersonalData ? (
                    <form onSubmit={handlePersonalDataSubmit}>
                        <FormInputField name="firstName"
                            label="Имя:"
                            value={userData.firstName}
                            onChange={handleUserDataChange}
                        />
                        <FormInputField name="lastName"
                            label="Фамилия:"
                            value={userData.lastName}
                            onChange={handleUserDataChange}
                        />
                        <FormInputField name="middleName"
                            label="Отчество:"
                            value={userData.middleName}
                            onChange={handleUserDataChange}
                        />
                        <FormInputField name="phone"
                            label="Номер телефона:"
                            value={userData.phone}
                            onChange={handleUserDataChange}
                        />
                        <FormInputField name="gender"
                            label="Пол:"
                            value={userData.gender}
                            onChange={handleUserDataChange}
                            options={[{ value: '', label: 'Выберите пол' },{ value: 'male', label: 'Мужской' },
                            { value: 'female', label: 'Женский' },]}
                        />
                        <ButtonSave>Сохранить</ButtonSave>
                    </form>
                ) : (
                    <div>
                        <div className={s.parametersContainer}>
                            <ProfileParameterRow name="ID Профиля" value={userData.id} />
                            <ProfileParameterRow name="Имя" value={userData.firstName} />
                            <ProfileParameterRow name="Фамилия" value={userData.lastName} />
                            <ProfileParameterRow name="Отчество" value={userData.middleName} />
                            <ProfileParameterRow name="Номер телефона" value={userData.phone} />
                            <ProfileParameterRow name="Пол" value={userData.gender==="male" && 'Мужской' || userData.gender==="female" && 'Женский' || ''} />
                            <ProfileParameterRow name="Email" value={userData.email} />
                        </div>
                        <button onClick={() => setEditingPersonalData(true)} className={s.buttonChangeParameters}>
                            Редактировать личные данные
                        </button>
                    </div>
                )}
            </div>
            <div className={s.flatDataForm} style={editingFlatPriorities ? { width: '100%' } : {}} >
                <h2  className={s.parametersText}>Параметры для подбора квартиры</h2>
                {editingFlatData &&
                    <form onSubmit={handleFlatDataSubmit}>
                        <FormInputField
                            name="region"
                            label="Регион:"
                            value={flatPreferences.region}
                            onChange={handleInputChange}
                        />
                        <FormInputField
                            name="city"
                            label="Город:"
                            value={flatPreferences.city}
                            onChange={handleInputChange}
                        />
                        <FormInputField
                            name="district"
                            label="Район:"
                            value={flatPreferences.district}
                            onChange={handleInputChange}
                        />
                        <RangeInput
                            label="Бюджет   руб."
                            minName="budgetMin"
                            maxName="budgetMax"
                            minValue={flatPreferences.budgetMin}
                            maxValue={flatPreferences.budgetMax}
                            onChange={handleInputChange}
                            minError={errors.budgetMin}
                            maxError={errors.budgetMax}
                        />
                        <RangeInput
                            label="Площадь   м²"
                            minName="areaMin"
                            maxName="areaMax"
                            minValue={flatPreferences.areaMin}
                            maxValue={flatPreferences.areaMax}
                            onChange={handleInputChange}
                            minError={errors.areaMin}
                            maxError={errors.areaMax}
                        />
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
                                            className={s.checkboxInput}
                                        />
                                        {room}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <FormInputField
                            name="apartmentType"
                            label="Тип квартиры (вторичка/новостройка):"
                            value={flatPreferences.apartmentType}
                            options={[
                                { value: 'неважно', label: 'Неважно' },
                                { value: 'вторичка', label: 'Вторичка' },
                                { value: 'новостройка', label: 'новостройка' }
                            ]}
                            selectedValues={flatPreferences.apartmentType}
                            onChange={handleInputChange}
                        />

                        <FormInputField
                            name="balconyType"
                            label="Балкон/лоджия:"
                            value={flatPreferences.balconyType}
                            options={[
                                { value: 'неважно', label: 'Неважно' },
                                { value: 'балкон', label: 'Балкон' },
                                { value: 'лоджия', label: 'Лоджия' }
                            ]}
                            selectedValues={flatPreferences.balconyType}
                            onChange={handleInputChange}
                        />

                        <FormInputField
                            name="ceilingHeight"
                            label="Высота потолков:"
                            type="number"
                            value={flatPreferences.ceilingHeight}
                            onChange={handleInputChange}
                            placeholder="Укажите высоту"
                            step="0.1"
                            error={errors.ceilingHeight}
                        />
                        <RangeInput
                            label="Этаж"
                            minName="minFloor"
                            maxName="maxFloor"
                            minValue={flatPreferences.minFloor}
                            maxValue={flatPreferences.maxFloor}
                            onChange={handleInputChange}
                            minError={errors.minFloor}
                            maxError={errors.maxFloor}
                        />
                        <RangeInput
                            label="Количество этажей в доме"
                            minName="floorsInBuildingMin"
                            maxName="floorsInBuildingMax"
                            minValue={flatPreferences.floorsInBuildingMin}
                            maxValue={flatPreferences.floorsInBuildingMax}
                            onChange={handleInputChange}
                            minError={errors.floorsInBuildingMin}
                            maxError={errors.floorsInBuildingMax}
                        />
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
                                            className={s.checkboxInput}
                                        />
                                        {material}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <FormInputField
                            name="renovationCondition"
                            label="Состояние ремонта:"
                            value={flatPreferences.renovationCondition}
                            options={[
                                { value: 'неважно', label: 'Неважно' },
                                { value: 'новый', label: 'Новый' },
                                { value: 'требует ремонта', label: 'Требует ремонта' }
                            ]}
                            onChange={handleInputChange}
                        />

                        <div className={s.formGroup}>
                            <label>Дополнительные удобства:</label>
                            <div className={s.checkboxGroup}>
                                {['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение', 'Холодильник', 'Микроволновая печь',
                                    'Стиральная машина', 'Кондиционер', 'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана',
                                    'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт', 'Вид из окон во двор',
                                    'Вид из окон на улицу' ].map((amenity) => (

                                    <label key={amenity} className={s.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="amenities"
                                            value={amenity}
                                            checked={flatPreferences.amenities.includes(amenity)}
                                            onChange={handleAmenitiesChange}
                                            className={s.checkboxInput}
                                        />
                                        {amenity}
                                    </label>
                                ))}
                            </div>
                        </div>


                        <label style={{margin: "10px"}}>Инфраструктура района:</label>
                        <div className={s.formInlineGroup}>
                            <InlineFromField className={s.inlineFormGroup}
                                            label='Парки:'
                                            type="number"
                                            name="parks"
                                            value={flatPreferences.infrastructure.parks}
                                            onChange={handleInfrastructureChange}
                                            placeholder='Пешком не более...'
                                            minuteLabel='минут'
                                            error={errors['infrastructure.parks']}
                            />
                            <InlineFromField className={s.inlineFormGroup}
                                             label='Больницы:'
                                             type="number"
                                             name="hospitals"
                                             value={flatPreferences.infrastructure.hospitals}
                                             onChange={handleInfrastructureChange}
                                             placeholder={'Пешком не более...'}
                                             minuteLabel='минут'
                                             error={errors['infrastructure.hospitals']}
                            />
                            <InlineFromField className={s.inlineFormGroup}
                                             label='Торговые центры:'
                                             type="number"
                                             name="shoppingCenters"
                                             value={flatPreferences.infrastructure.shoppingCenters}
                                             onChange={handleInfrastructureChange}
                                             placeholder={'Пешком не более...'}
                                             minuteLabel='минут'
                                             error={errors['infrastructure.shoppingCenters']}
                            />
                            <InlineFromField className={s.inlineFormGroup}
                                             label='Магазины:'
                                             type="number"
                                             name="shops"
                                             value={flatPreferences.infrastructure.shops}
                                             onChange={handleInfrastructureChange}
                                             placeholder={'Пешком не более...'}
                                             minuteLabel='минут'
                                             error={errors['infrastructure.shops']}
                            />
                            <InlineFromField className={s.inlineFormGroup}
                                             label='Школы:'
                                             type="number"
                                             name="schools"
                                             value={flatPreferences.infrastructure.schools}
                                             onChange={handleInfrastructureChange}
                                             placeholder={'Пешком не более...'}
                                             minuteLabel='минут'
                                             error={errors['infrastructure.schools']}
                            />
                            <InlineFromField className={s.inlineFormGroup}
                                             label='Детские сады:'
                                             type="number"
                                             name="kindergartens"
                                             value={flatPreferences.infrastructure.kindergartens}
                                             onChange={handleInfrastructureChange}
                                             placeholder={'Пешком не более...'}
                                             minuteLabel='минут'
                                             error={errors['infrastructure.kindergartens']}
                            />
                        </div>
                        <label style={{margin: "10px"}}>Транспортная доступность:</label>
                        <div className={s.formInlineGroup}>
                            <InlineFromField className={s.inlineFormGroup}
                                             label='Остановки общественного транспорта:'
                                             type="number"
                                             name="publicTransportStops"
                                             value={flatPreferences.transportAccessibility.publicTransportStops}
                                             onChange={handleTransportAccessibilityChange}
                                             placeholder={'Пешком не более...'}
                                             minuteLabel='минут'
                                             error={errors['transportAccessibility.publicTransportStops']}
                            />
                            <InlineFromField className={s.inlineFormGroup}
                                             label='Расстояние до метро:'
                                             type="number"
                                             name="metroDistance"
                                             value={flatPreferences.transportAccessibility.metroDistance}
                                             onChange={handleTransportAccessibilityChange}
                                             placeholder={'Пешком не более...'}
                                             minuteLabel='минут'
                                             error={errors['transportAccessibility.metroDistance']}
                            />
                            <InlineFromField className={s.inlineFormGroup}
                                             label='Время до метро на транспорте:'
                                             type="number"
                                             name="metroTransportTime"
                                             value={flatPreferences.transportAccessibility.metroTransportTime}
                                             onChange={handleTransportAccessibilityChange}
                                             placeholder={'Не более...'}
                                             minuteLabel='минут'
                                             error={errors['transportAccessibility.metroTransportTime']}
                            />

                        </div>
                        <ButtonSave>Сохранить</ButtonSave>
                    </form>
                }
                {editingFlatPriorities &&
                    <ComparisonMatrix
                        parameters={flatParameters}
                        parametersNames={flatParametersNames}
                        currentPreferences={flatPreferences}
                        onSave={handleSaveFlatPriorities}
                        cancelChanging={handleCancelChangingFlatPriorities}
                    />
                }
                { (!editingFlatData && !editingFlatPriorities) &&
                    <div>
                        <div className={s.parametersContainer}>
                            <FlatParameterRow name="Регион" value={flatPreferences.region}/>
                            <FlatParameterRow name="Город" value={flatPreferences.city}/>
                            <FlatParameterRow name="Район" value={flatPreferences.district}/>

                            <FlatParameterRow name="Бюджет" isRange priority={flatPreferences.priorities.budget}>
                                {flatPreferences.budgetMin ? `от ${flatPreferences.budgetMin} руб.` : ''}
                                {flatPreferences.budgetMin && flatPreferences.budgetMax ? ' ' : ''}
                                {flatPreferences.budgetMax ? `до ${flatPreferences.budgetMax} руб.` : ''}
                                {!flatPreferences.budgetMin && !flatPreferences.budgetMax ? 'не указан' : ''}
                            </FlatParameterRow>
                            <FlatParameterRow name="Площадь" isRange
                                              priority={flatPreferences.priorities.area}
                                              rentPriority={rentPreferences.priorities.area}
                            >
                                {flatPreferences.areaMin ? `от ${flatPreferences.areaMin} м²` : ''}
                                {flatPreferences.areaMin && flatPreferences.areaMax ? ' ' : ''}
                                {flatPreferences.areaMax ? `до ${flatPreferences.areaMax} м²` : ''}
                                {!flatPreferences.areaMin && !flatPreferences.areaMax ? 'не указан' : ''}
                            </FlatParameterRow>

                            <FlatParameterRow
                                name="Количество комнат"
                                value={flatPreferences.roomCount}
                                isArray
                                defaultValue="не указано"
                                priority={flatPreferences.priorities.roomCount}
                                rentPriority={rentPreferences.priorities.roomCount}
                            />

                            <FlatParameterRow name="Тип квартиры (Вторичка/новостройка)" value={flatPreferences.apartmentType} priority={flatPreferences.priorities.apartmentType}/>
                            <FlatParameterRow name="Балкон/лоджия" value={flatPreferences.balconyType} priority={flatPreferences.priorities.balconyType}/>
                            <FlatParameterRow name="Высота потолков" isRange priority={flatPreferences.priorities.ceilingHeight}>
                                {flatPreferences.ceilingHeight ? `от ${flatPreferences.ceilingHeight} м` : 'не указана'}
                            </FlatParameterRow>

                            <FlatParameterRow name="Этаж" isRange
                                              priority={flatPreferences.priorities.floor}
                                              rentPriority={rentPreferences.priorities.floor}
                            >
                                {flatPreferences.minFloor ? `от ${flatPreferences.minFloor} ` : ''}
                                {flatPreferences.maxFloor ? `до ${flatPreferences.maxFloor} ` : ''}
                                { (!flatPreferences.minFloor&&!flatPreferences.maxFloor) ? 'не указан' : 'этажей'}
                            </FlatParameterRow>

                            <FlatParameterRow name="Количество этажей в доме" isRange
                                              priority={flatPreferences.priorities.floorsInBuilding}
                                              rentPriority={rentPreferences.priorities.floorsInBuilding}
                            >
                                {flatPreferences.floorsInBuildingMin ? `от ${flatPreferences.floorsInBuildingMin} ` : ''}
                                {flatPreferences.floorsInBuildingMax ? `до ${flatPreferences.floorsInBuildingMax} ` : ''}
                                { (!flatPreferences.floorsInBuildingMin&&!flatPreferences.floorsInBuildingMax) ? 'не указано' : 'этажей'}
                            </FlatParameterRow>

                            <FlatParameterRow
                                name="Материал дома"
                                value={flatPreferences.houseMaterial}
                                isArray
                                priority={flatPreferences.priorities.houseMaterial}
                                rentPriority={rentPreferences.priorities.houseMaterial}
                            />

                            <FlatParameterRow
                                name="Состояние ремонта"
                                value={flatPreferences.renovationCondition}
                                defaultValue="?"
                                priority={flatPreferences.priorities.renovationCondition}
                                rentPriority={rentPreferences.priorities.renovationCondition}
                            />

                            <FlatParameterRow
                                name="Дополнительные удобства"
                                value={flatPreferences.amenities}
                                isArray
                                defaultValue="не указаны"
                                priority={flatPreferences.priorities.amenities}
                                rentPriority={rentPreferences.priorities.amenities}
                            />



                            <div className={s.parameterBlock}>
                                <div className={s.parameterRow}>
                                    <strong className={s.parameterName}>Инфраструктура района:</strong>
                                    <span className={s.flatPriority}>вес при подборе: {(flatPreferences.priorities.infrastructure * 100).toFixed(1)}%</span>
                                    <span className={s.rentPriority}>вес при аренде: {(rentPreferences.priorities.infrastructure * 100).toFixed(1)}%</span>
                                </div>
                                <InfrastructureParameterRow name="Парки" value={flatPreferences.infrastructure.parks}/>
                                <InfrastructureParameterRow name="Больницы" value={flatPreferences.infrastructure.hospitals}/>
                                <InfrastructureParameterRow name="Торговые центры" value={flatPreferences.infrastructure.shoppingCenters}/>
                                <InfrastructureParameterRow name="Магазины" value={flatPreferences.infrastructure.shops}/>
                                <InfrastructureParameterRow name="Школы" value={flatPreferences.infrastructure.schools}/>
                                <InfrastructureParameterRow name="Детские сады" value={flatPreferences.infrastructure.kindergartens}/>
                            </div>

                            <div className={s.parameterBlock}>
                                <div className={s.parameterRow}>
                                    <strong className={s.parameterName}>Транспортная доступность:</strong>
                                    <span className={s.flatPriority}>вес при подборе: {(flatPreferences.priorities.transportAccessibility * 100).toFixed(1)}%</span>
                                    <span className={s.rentPriority}>вес при аренде: {(rentPreferences.priorities.transportAccessibility * 100).toFixed(1)}%</span>
                                </div>
                                <InfrastructureParameterRow name="Остановки общественного транспорта" value={flatPreferences.transportAccessibility.publicTransportStops}/>
                                <InfrastructureParameterRow name="Расстояние до метро" value={flatPreferences.transportAccessibility.metroDistance}/>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Время до метро на транспорте:</span>
                                    <span className={s.parameterValue}>
                                        {flatPreferences.transportAccessibility.metroTransportTime
                                            ? `Не более ${flatPreferences.transportAccessibility.metroTransportTime} минут`
                                            : 'время не указано'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button  onClick={() => setEditingFlatData(true)} className={s.buttonChangeParameters}>
                            Редактировать параметры квартиры
                        </button>
                        <button
                            onClick={() => setEditingFlatPriorities(true)} className={s.buttonChangePriorities}>
                            Редактировать приоритеты (МАИ)
                        </button>
                    </div>
                }
            </div>

            <div className={s.rentDataForm} style={editingRentPriorities ? { width: '100%' } : {}}>
                <h2 className={s.parametersText}>Параметры для аренды</h2>
                { editingRentData &&
                    <form onSubmit={handleRentPreferencesSubmit}>
                        <div className={s.formGroup}>
                            <label>Цена и срок аренды:</label>
                            <div className={s.rangeFields}>
                                <FormInputField name="rentPeriod"
                                                label="Срок аренды:"
                                                value={rentPreferences.rentPayment.rentPeriod}
                                                onChange={handleRentPaymentChange}
                                                options={[
                                                    { value: 'неважно', label: 'Неважно' },
                                                    { value: 'посуточно', label: 'Посуточно' },
                                                    { value: 'длительная', label: 'Длительная (помесячно)' },]}
                                />

                                <RangeInput
                                    label={`Цена ${
                                        rentPreferences.rentPayment.rentPeriod === 'неважно'
                                            ? ''
                                            : (
                                                rentPreferences.rentPayment.rentPeriod === 'посуточно'
                                                    ? 'за 1 день'
                                                    : 'за 1 месяц'
                                            )
                                    } руб.`}
                                    minName="rentPriceMin"
                                    maxName="rentPriceMax"
                                    minValue={rentPreferences.rentPayment.rentPriceMin}
                                    maxValue={rentPreferences.rentPayment.rentPriceMax}
                                    onChange={handleRentPaymentChange}
                                    minError={errors.rentPriceMin}
                                    maxError={errors.rentPriceMax}
                                />
                            </div>
                        </div>
                        <label style={{margin: "10px"}}>Условия аренды и заселения:</label>
                        <div className={s.inlineCheckboxGroup}>
                            <InlineCheckboxField
                                label='Возможность проживания с животными:'
                                name="petsAllowed"
                                checked={rentPreferences.rentalTerms.petsAllowed}
                                onChange={handleRentInputChange}
                            />
                            <InlineCheckboxField
                                label='Возможность проживания с детьми:'
                                name="childrenAllowed"
                                checked={rentPreferences.rentalTerms.childrenAllowed}
                                onChange={handleRentInputChange}
                            />
                            <InlineCheckboxField
                                label='Возможность немедленного заселения:'
                                name="immediateMoveIn"
                                checked={rentPreferences.rentalTerms.immediateMoveIn}
                                onChange={handleRentInputChange}
                            />
                            <InlineCheckboxField
                                label='Возможность курения в квартире:'
                                name="smokingAllowed"
                                checked={rentPreferences.rentalTerms.smokingAllowed}
                                onChange={handleRentInputChange}
                            />
                        </div>
                        <FormInputField
                            label="Количество спальных мест от:"
                            type="number"
                            name="numberOfBeds"
                            value={rentPreferences.numberOfBeds}
                            onChange={handleRentInputChange}
                            placeholder="Количество спальных мест (от)"
                            error={errors.numberOfBeds}
                        />
                        <button type="submit" className={s.buttonSave}>
                            Сохранить
                        </button>
                    </form>
                }
                {editingRentPriorities &&
                    <form onSubmit={handleRentPrioritySubmit}>
                        <ComparisonMatrix
                            parameters={rentParameters}
                            parametersNames={rentParametersNames}
                            currentPreferences={rentPreferences}
                            onSave={handleSaveRentPriorities}
                            cancelChanging={handleCancelChangingRentPriorities}
                        />

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
                            <div className={s.parameterBlock}>
                                <div className={s.parameterRow}>
                                    <strong className={s.parameterName}>Цена и срок аренды:</strong>
                                    <span className={s.rentPriority}>вес при аренде: {(rentPreferences.priorities.rentPayment * 100).toFixed(1)}%</span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>{`Цена ${
                                        rentPreferences.rentPayment.rentPeriod === 'неважно'
                                            ? ''
                                            : (
                                                rentPreferences.rentPayment.rentPeriod === 'посуточно'
                                                    ? 'за 1 день'
                                                    : 'за 1 месяц'
                                            )
                                    } руб.`}
                                    </span>
                                    <span className={s.parameterValue}>{rentPreferences.rentPayment.rentPriceMin ? `от ${rentPreferences.rentPayment.rentPriceMin} руб.` : ''}
                                        {rentPreferences.rentPayment.rentPriceMin && rentPreferences.rentPayment.rentPriceMax ? ' ' : ''}
                                        {rentPreferences.rentPayment.rentPriceMax ? `до ${rentPreferences.rentPayment.rentPriceMax} руб.` : ''}
                                        {!rentPreferences.rentPayment.rentPriceMin && !rentPreferences.rentPayment.rentPriceMax ? 'не указан' : ''}
                                    </span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Срок аренды:</span>
                                    <span className={s.parameterValue}>{rentPreferences.rentPayment.rentPeriod}</span>
                                </div>
                            </div>
                            <div className={s.parameterBlock}>
                                <div className={s.parameterRow}>
                                    <strong className={s.parameterName}>Условия аренды и заселения:</strong>
                                    <span className={s.rentPriority}>вес при аренде: {(rentPreferences.priorities.rentalTerms * 100).toFixed(1)}%</span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Проживание с животными:</span>
                                    <span className={s.parameterValue}>{rentPreferences.rentalTerms.petsAllowed ? 'Да' : 'неважно'}</span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Проживание с детьми:</span>
                                    <span className={s.parameterValue}>{rentPreferences.rentalTerms.childrenAllowed ? 'Да' : 'неважно'}</span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Немедленное заселение:</span>
                                    <span className={s.parameterValue}>{rentPreferences.rentalTerms.immediateMoveIn ? 'Да' : 'неважно'}</span>
                                </div>
                                <div className={s.parameterRow}>
                                    <span className={s.parameterName}>Курение в квартире:</span>
                                    <span className={s.parameterValue}>{rentPreferences.rentalTerms.smokingAllowed ? 'Да' : 'неважно'}</span>
                                </div>
                            </div>
                            <FlatParameterRow name="Количество спальных мест" value={rentPreferences.numberOfBeds || 'не указано'} rentPriority={rentPreferences.priorities.numberOfBeds}/>
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

