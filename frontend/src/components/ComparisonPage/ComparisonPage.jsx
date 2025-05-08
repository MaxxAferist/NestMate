import s from './ComparisonPage.module.css';
import { useComparison } from '../contexts/ComparisonContext';
import { FaCheck, FaHeart, FaTimes, FaTrash } from 'react-icons/fa';
import {useFavorites} from '../contexts/FavoritesContext.jsx'
import {useEffect, useContext, useState, useMemo} from "react";
import {LoginContext} from "../contexts/LoginContext.jsx";
import {EmptyText, ErrorText, LoadingText} from "../commonElements/fields.jsx";
import {useNavigate} from "react-router-dom";

// названия параметров
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
    amenities: 'Удобства',
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

// единицы измерения
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
    restFlatDetails: ['type','balconyType', 'renovationCondition', 'amenities'],
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
    const { isFavorite, handleFavoriteClick } = useFavorites();
    const navigate = useNavigate();

    useEffect(() => {
        if(user && user.id) {
            const fetchComparison = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/comparison/${user.id}`);
                    const data = await response.json();
                    if (data.status === 'success') {
                        if(data.message === 'User do not have comparison apartments') {
                            setComparisonFlats([]);
                            // установить список сравнения
                        }
                        setComparisonFlats(data.comparison.apartments || []);
                        // установить список сравнения
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
    }, [removeFromComparison, clearComparison]);

    // форматирование значения
    const formatValue = (param, value) => {
        if (value === undefined || value === null || value === '') return '-';

        if (Array.isArray(value)) {
            return (
                <div className={s.cellValue}>
                    {value.map((item, i) => (
                        item !== '' && (
                            <span key={i}>{item},</span>
                        )

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
            if(value <= 0 || value === '' || value === null){
                return '-';
            }else{
                return value;
            }
        }

        // форматирование чисел
        if (typeof value === 'number') {
            const formatNumber = Intl.NumberFormat('ru-RU').format(value.toString())
            return `${PARAM_INTRODUCTION[param] ? ` ${PARAM_INTRODUCTION[param]}` : ''}${formatNumber}${PARAM_UNITS[param] ? ` ${PARAM_UNITS[param]}` : ''}`;
        }

        // для строк
        return value;
    };



    // получение лучшего значения
    const getBestValue = (param) => {
        if (PARAM_GROUPS.restFlatDetails.includes(param) &&
            PARAM_GROUPS.restBuildingDetails.includes(param)) {
            return null;
        }

        const values = comparisonFlats.flatMap(flatData => { /*массив параметров*/
            if (param in flatData) return flatData[param]; /*если параметр в flatData*/
            if (flatData.infrastructure?.[param] !== undefined) return flatData.infrastructure[param]; /*если в infrastructure*/
            if (flatData.transportAccessibility?.[param] !== undefined) return flatData.transportAccessibility[param];
            return [];
        }).filter(val => (val !== undefined && val !== null && val !== ''));

        if (values.length === 0) return null;

        if (param === 'rooms') { /*отдельно для комнат т.к. часто встречается студия*/
            let bestValue = 0;
            values.forEach(value => {
                const numberValue = typeof value === 'string' && value.toLowerCase() !== 'студия'
                    ? parseInt(value) : Number(value);

                if (!isNaN(numberValue) && numberValue > bestValue) {
                    bestValue = numberValue;
                }
            });

            return `${bestValue}`; /*нужно в строке*/
        }

        if (typeof values[0] === 'number') {
            if( param === 'area' || param === 'floor' || param === 'ceilingHeight' || param === 'buildingYear'){ /*по возрастанию*/
                return Math.max(...values);
            }else{
                return Math.min(...values);
            }

        }

        return null;
    };

    const bestValues = useMemo(() => {
        const savedBestValues = {};
        comparisonFlats.forEach(flatData => {
            for (const param in flatData) {
                if(param === 'infrastructure') {
                    Object.keys(flatData.infrastructure).map((parameter) => {
                        if (!savedBestValues[parameter]) {
                            savedBestValues[parameter] = getBestValue(parameter);
                        }
                    })
                }else if(param === 'transportAccessibility') {
                    Object.keys(flatData.transportAccessibility).map((parameter) => {
                        if (!savedBestValues[parameter]) {
                            savedBestValues[parameter] = getBestValue(parameter);
                        }
                    })
                }else{
                    if (!savedBestValues[param]) {
                        savedBestValues[param] = getBestValue(param);
                    }
                }
            }
        });

        return savedBestValues;
    }, [comparisonFlats]);


    const isBestValue = (value, bestValue) => {
        return bestValue !== null && value === bestValue;
    };

    const handleClearAllClick = () => {
        clearComparison();
        setComparisonFlats([])
    }


    if(!user){
        return(
            <EmptyText>
                Для сравнения квартир необходимо войти в аккаунт.
            </EmptyText>
        );
    }

    if (loading) {
        return (<LoadingText/>);
    }

    if (comparisonFlats.length === 0) {
        return (
            <EmptyText>
                Нет квартир для сравнения.
            </EmptyText>
        );
    }

    if (error) {
        return (
            <ErrorText>
                Ошибка: {error}
            </ErrorText>
        );
    }

    return (
        <div className={s.container}>
            <h1 className={s.title}>Сравнение квартир</h1>

            <div className={s.tableField}>
                <table className={s.table}>
                    <thead>
                    <tr className={s.tableHeader}>
                        <th className={s.parameterName}>Параметр</th>
                        {comparisonFlats.map(flatData => (
                            <th key={flatData.id} className={s.flatHeader}>
                                <img
                                    src={flatData.picture}
                                    alt="Квартира"
                                    className={s.image}
                                    onClick={() => navigate(`/FlatPage/${flatData.id}`, { state: { flat_id: flatData.id } })}
                                />
                                <div className={s.address}>{flatData.address}</div>
                                <div className={s.district}>{flatData.district} р-н</div>
                                <div className={s.buttonsSection}>
                                    <button className={s.actionButton} onClick={() => handleFavoriteClick(flatData.id)} >
                                        <FaHeart style={{ color: isFavorite(flatData.id) ? '#ff5d74' : '' }} />
                                    </button>
                                    <button
                                        className={s.actionButton}
                                        onClick={() => removeFromComparison(flatData.id)}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>

                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            О квартире
                        </td>
                    </tr>

                    {PARAM_GROUPS.comparisonFlatDetails.map(param => (
                        <tr key={param} className={s.dataRow}>

                            <td className={s.parameterName}>{PARAM_NAMES[param]}</td>

                            {comparisonFlats.map(flatData => {
                                const value = flatData[param];
                                const bestValue = bestValues[param];
                                return (
                                    <td key={`${flatData.id}-${param}`} className={s.parameterCell}>
                                        <div className={s.cellValue}>
                                            {formatValue(param, value)} {isBestValue(value, bestValue) && <FaCheck className={s.bestIcon} />}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {PARAM_GROUPS.restFlatDetails.map(param => (
                        <tr key={param} className={s.dataRow}>
                            <td className={s.parameterName}>{PARAM_NAMES[param]}</td>
                            {comparisonFlats.map(flatData => {
                                const value = flatData[param];
                                return (
                                    <td key={`${flatData.id}-${param}`} className={s.parameterCell}>
                                        <div className={s.cellValue}>
                                            {formatValue(param, value)}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}


                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            Детали дома
                        </td>
                    </tr>

                    {PARAM_GROUPS.comparisonBuildingDetails.map(param => (
                        <tr key={param} className={s.dataRow}>
                            <td className={s.parameterName}>{PARAM_NAMES[param]}</td>
                            {comparisonFlats.map(flatData => {
                                const value = flatData[param];
                                const bestValue = bestValues[param];
                                return (
                                    <td key={`${flatData.id}-${param}`} className={s.parameterCell}>
                                        <div className={s.cellValue}>
                                            {formatValue(param, value)} {isBestValue(value, bestValue) && <FaCheck className={s.bestIcon} />}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}

                    {PARAM_GROUPS.restBuildingDetails.map(param => (
                        <tr key={param} className={s.dataRow}>
                            <td className={s.parameterName}>{PARAM_NAMES[param]}</td>

                            {comparisonFlats.map(flatData => {
                                const value = flatData[param];
                                return(
                                    <td key={`${flatData.id}-${param}`} className={s.parameterCell}>
                                        <div className={s.cellValue}>
                                            {formatValue(param, value)}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}


                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            Инфраструктура района
                        </td>
                    </tr>

                    {PARAM_GROUPS.infrastructure.map(param => (
                        <tr key={param} className={s.dataRow}>
                            <td className={s.parameterName}>{PARAM_NAMES[param]}</td>
                            {comparisonFlats.map(flatData => {
                                const value = flatData.infrastructure?.[param];
                                const bestValue = bestValues[param];
                                return (
                                    <td key={`${flatData.id}-${param}`} className={s.parameterCell}>
                                        <div className={s.cellValue}>
                                            {formatValue('infrastructure', value)} {isBestValue(value, bestValue) && <FaCheck className={s.bestIcon} />}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}


                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            Транспортная доступность
                        </td>
                    </tr>

                    {PARAM_GROUPS.transport.map(param => (
                        <tr key={param} className={s.dataRow}>

                            <td className={s.parameterName}>{PARAM_NAMES[param]}</td>

                            {comparisonFlats.map(flatData => {
                                const value = flatData.transportAccessibility?.[param];
                                const bestValue = getBestValue(param);
                                return (
                                    <td key={`${flatData.id}-${param}`} className={s.parameterCell}>
                                        <div className={s.cellValue}>
                                            {formatValue('transportAccessibility', value)} {isBestValue(value, bestValue) && <FaCheck className={s.bestIcon} />}
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
                    onClick={handleClearAllClick}
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