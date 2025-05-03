import s from './ComparisonPage.module.css';
import { useComparison } from '../contexts/ComparisonContext';
import { FaCheck, FaHeart, FaTimes, FaTrash } from 'react-icons/fa';
import {useFavorites} from '../contexts/FavoritesContext.jsx'
import {useEffect, useContext, useState} from "react";
import {LoginContext} from "../contexts/LoginContext.jsx";

// Словарь названий параметров
const PARAM_NAMES = {
    price: 'Цена',
    rooms: 'Количество комнат',
    area: 'Площадь',
    type: 'Тип сделки',
    ceilingHeight: 'Высота потолков',
    buildingYear: 'Год постройки',
    balconyType: 'Балкона/лоджия',
    renovationCondition: 'Состояние ремонта',
    floor: 'Этаж',
    features: 'Удобства',
    buildingFloors: 'Этажей в доме',
    buildingMaterial: 'Материал дома',
    parks: 'Парки',
    hospitals: 'Больницы',
    shoppingCenters: 'Торговые центры',
    shops: 'Магазины',
    schools: 'Школы',
    kindergartens: 'Детские сады',
    publicTransportStops: 'Расстояние до остановок общественного транспорта',
    metroDistance: 'Расстояние до метро'
};

// Словарь единиц измерения
const PARAM_UNITS = {
    price: '₽',
    area: 'м²',
    ceilingHeight: 'м.',
    infrastructure: 'мин.',
    transportAccessibility: 'мин.',
};

const PARAM_INTRODUCTION = {
    infrastructure: 'Пешком ',
    transportAccessibility: 'Пешком ',
};

const PARAM_GROUPS = {
    comparisonFlatDetails: ['price', 'rooms', 'area', 'floor','ceilingHeight'],
    restFlatDetails: ['type','balconyType', 'renovationCondition', 'features'],
    comparisonBuildingDetails: ['buildingYear'],
    restBuildingDetails: ['buildingFloors', 'buildingMaterial'],
    infrastructure: ['parks', 'hospitals', 'shoppingCenters', 'shops', 'schools', 'kindergartens'],
    transport: ['publicTransportStops', 'metroDistance']
};

const ComparisonTable = () => {
    const [comparisonFlats, setComparisonFlats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { removeFromComparison, clearComparison } = useComparison();
    const {user} = useContext(LoginContext);
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();

    useEffect(() => {
        if(user && user.id) {
            const fetchComparison = async () => {
                try {
                    console.log('fetch comparison');
                    const response = await fetch(`/api/comparison/${user.id}`);
                    const data = await response.json();
                    console.log('getting data', data);
                    if (data.status === 'success') {
                        setComparisonFlats(data.comparison.apartments || []);
                    } else {
                        setError(data.message || 'Ошибка загрузки квартир для сравнения');
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchComparison();
        }
    }, [removeFromComparison]);

    const handleFavoriteClick = async (flatId, e) => {
        try {
            if (isFavorite(flatId)) {
                await removeFavorite(flatId);
            } else {
                await addFavorite(flatId);
            }
        } catch (error) {
            console.error("Ошибка при изменении избранного:", error);
        }
    };




    // форматирование значения
    const formatValue = (param, value) => {
        if (value === undefined || value === null) return '-';

        if (Array.isArray(value)) {
            return (
                <div className={s.valueContainer}>
                    {value.map((item, i) => (
                        <span key={i}>{item},</span>
                    ))}
                </div>
            );
        }

        if(param === 'type') {
            if(value === 1){
                return "аренда";
            }else{
                return "покупка";
            }
        }

        if(param === 'buildingYear') {
            if(value === 0){
                return '-';
            }else{
                return value;
            }
        }

        // форматирование чисел
        if (typeof value === 'number') {
            const formattedNumber = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            return `${PARAM_INTRODUCTION[param] ? ` ${PARAM_INTRODUCTION[param]}` : ''}${formattedNumber}${PARAM_UNITS[param] ? ` ${PARAM_UNITS[param]}` : ''}`;
        }


        // для строк
        return value;
    };

    // Получение лучшего значения для параметра (только для сравниваемых параметров)
    const getBestValue = (param) => {
        if (!PARAM_GROUPS.comparisonFlatDetails.includes(param) &&
            !PARAM_GROUPS.comparisonBuildingDetails.includes(param) &&
            !PARAM_GROUPS.infrastructure.includes(param) &&
            !PARAM_GROUPS.transport.includes(param)) {
            return null;
        }

        const values = comparisonFlats.flatMap(flat => {
            if (param in flat) return flat[param];
            if (flat.infrastructure?.[param] !== undefined) return flat.infrastructure[param];
            if (flat.transportAccessibility?.[param] !== undefined) return flat.transportAccessibility[param];
            return [];
        }).filter(val => val !== undefined && val !== null);

        if (values.length === 0) return null;

        if (typeof values[0] === 'number') {
            return param === 'metroDistance' ? Math.min(...values) : Math.max(...values);
        }

        return null;
    };

    // Проверка, является ли значение лучшим
    const isBestValue = (value, bestValue) => {
        return bestValue !== null && value === bestValue;
    };

    if (comparisonFlats.length === 0) {
        return (
            <div className={s.container}>
                <h1 className={s.title}>Сравнение квартир</h1>
                <p>Нет квартир для сравнения</p>
            </div>
        );
    }

    return (
        <div className={s.container}>
            <h1 className={s.title}>Сравнение квартир</h1>

            <div className={s.tableField}>
                <table className={s.table}>
                    <thead>
                    <tr className={s.tableHeader}>
                        <th className={s.parameterCell}>Параметр</th>
                        {comparisonFlats.map(flat => (
                            <th key={flat.id} className={s.flatHeader}>
                                <img
                                    src={flat.picture}
                                    alt="Квартира"
                                    className={s.flatImage}
                                />
                                <div className={s.flatTitle}>{flat.address}</div>
                                <div className={s.flatDistrict}>{flat.district} р-н</div>
                                <div className={s.actions}>
                                    <button className={s.actionButton} onClick={() => handleFavoriteClick(flat.id)} >
                                        <FaHeart style={{ color: isFavorite(flat.id) ? '#ff5d74' : '' }} />
                                    </button>
                                    <button
                                        className={s.actionButton}
                                        onClick={() => removeFromComparison(flat.id)}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {/* О квартире */}
                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            О квартире
                        </td>
                    </tr>

                    {PARAM_GROUPS.comparisonFlatDetails.map(param => (
                        <tr key={param} className={s.dataRow}>

                            <td className={s.parameterCell}>{PARAM_NAMES[param]}</td>

                            {comparisonFlats.map(flat => {
                                const value = flat[param];
                                const bestValue = getBestValue(param);
                                return (
                                    <td key={`${flat.id}-${param}`} className={s.valueCell}>
                                        <div className={s.valueContainer}>
                                            {formatValue(param, value)}
                                            {isBestValue(value, bestValue) && <FaCheck className={s.bestValueIcon} />}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {PARAM_GROUPS.restFlatDetails.map(param => (
                        <tr key={param} className={s.dataRow}>
                            <td className={s.parameterCell}>{PARAM_NAMES[param]}</td>
                            {comparisonFlats.map(flat => {
                                const value = flat[param];
                                return (
                                    <td key={`${flat.id}-${param}`} className={s.valueCell}>
                                        <div className={s.valueContainer}>
                                            {formatValue(param, value)}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}

                    {/* Детали дома */}
                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            Детали дома
                        </td>
                    </tr>

                    {PARAM_GROUPS.comparisonBuildingDetails.map(param => (
                        <tr key={param} className={s.dataRow}>
                            <td className={s.parameterCell}>{PARAM_NAMES[param]}</td>
                            {comparisonFlats.map(flat => {
                                const value = flat[param];
                                const bestValue = getBestValue(param);
                                return (
                                    <td key={`${flat.id}-${param}`} className={s.valueCell}>
                                        <div className={s.valueContainer}>
                                            {formatValue(param, value)}
                                            {isBestValue(value, bestValue) && <FaCheck className={s.bestValueIcon} />}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}

                    {PARAM_GROUPS.restBuildingDetails.map(param => (
                        <tr key={param} className={s.dataRow}>
                            <td className={s.parameterCell}>{PARAM_NAMES[param]}</td>

                            {comparisonFlats.map(flat => {
                                const value = flat[param];
                                return(
                                    <td key={`${flat.id}-${param}`} className={s.valueCell}>
                                        <div className={s.valueContainer}>
                                            {formatValue(param, value)}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}

                    {/* Инфраструктура */}
                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            Инфраструктура района
                        </td>
                    </tr>

                    {PARAM_GROUPS.infrastructure.map(param => (
                        <tr key={param} className={s.dataRow}>
                            <td className={s.parameterCell}>{PARAM_NAMES[param]}</td>
                            {comparisonFlats.map(flat => {
                                const value = flat.infrastructure?.[param];
                                const bestValue = getBestValue(param);
                                return (
                                    <td key={`${flat.id}-${param}`} className={s.valueCell}>
                                        <div className={s.valueContainer}>
                                            {formatValue('infrastructure', value)}
                                            {isBestValue(value, bestValue) && <FaCheck className={s.bestValueIcon} />}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}

                    {/* Транспорт */}
                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            Транспортная доступность
                        </td>
                    </tr>

                    {PARAM_GROUPS.transport.map(param => (
                        <tr key={param} className={s.dataRow}>

                            <td className={s.parameterCell}>{PARAM_NAMES[param]}</td>

                            {comparisonFlats.map(flat => {
                                const value = flat.transportAccessibility?.[param];
                                const bestValue = getBestValue(param);
                                return (
                                    <td key={`${flat.id}-${param}`} className={s.valueCell}>
                                        <div className={s.valueContainer}>
                                            {formatValue('transportAccessibility', value)}
                                            {isBestValue(value, bestValue) && <FaCheck className={s.bestValueIcon} />}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className={s.clearButtonContainer}>
                <button
                    onClick={clearComparison}
                    className={s.clearButton}
                >
                    <FaTrash />
                    Очистить сравнение
                </button>
            </div>
        </div>
    );
};

export default ComparisonTable;