import s from './ComparisonPage.module.css';
import { useComparison } from '../contexts/ComparisonContext';
import { FaCheck, FaHeart, FaTimes, FaTrash } from 'react-icons/fa';

// Словарь названий параметров
const PARAM_NAMES = {
    price: 'Цена',
    rooms: 'Комнат',
    area: 'Площадь',
    ceilingHeight: 'Высота потолков',
    buildingYear: 'Год постройки',
    balconyType: 'Тип балкона',
    renovationCondition: 'Состояние ремонта',
    kitchenStove: 'Плита',
    viewFromWindows: 'Вид из окон',
    floor: 'Этаж',
    buildingFloors: 'Этажей в доме',
    buildingMaterial: 'Материал дома',
    parks: 'Парки',
    hospitals: 'Больницы',
    shoppingCenters: 'Торговые центры',
    shops: 'Магазины',
    schools: 'Школы',
    kindergartens: 'Детские сады',
    publicTransportStops: 'Остановки транспорта',
    metroDistance: 'Расстояние до метро'
};

// Словарь единиц измерения
const PARAM_UNITS = {
    price: '₽',
    area: 'м²',
    ceilingHeight: 'м.',
    metroDistance: 'мин.',
    parks: 'мин.',
    hospitals: 'мин.',
    shoppingCenters: 'мин.',
    shops: 'мин.',
    schools: 'мин.',
    kindergartens: 'мин.',
    publicTransportStops: 'мин.'
};

// Словарь группировки параметров
const PARAM_GROUPS = {
    main: ['price', 'rooms', 'area', 'ceilingHeight', 'buildingYear'],
    flatDetails: ['balconyType', 'renovationCondition', 'kitchenStove', 'viewFromWindows'],
    buildingDetails: ['floor', 'buildingFloors', 'buildingMaterial'],
    infrastructure: ['parks', 'hospitals', 'shoppingCenters', 'shops', 'schools', 'kindergartens'],
    transport: ['publicTransportStops', 'metroDistance']
};

const ComparisonTable = () => {
    const { comparisonFlats, removeFromComparison, clearComparison } = useComparison();

    // Форматирование значения с единицей измерения
    const formatValue = (param, value) => {
        if (value === undefined || value === null) return '-';

        // Обработка массива (например, viewFromWindows)
        if (Array.isArray(value)) {
            return value.join(', ');
        }

        // Форматирование чисел
        if (typeof value === 'number') {
            const formattedNumber = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            return `${formattedNumber}${PARAM_UNITS[param] ? ` ${PARAM_UNITS[param]}` : ''}`;
        }

        // Для строковых значений
        return value;
    };

    // Получение лучшего значения для параметра (только для сравниваемых параметров)
    const getBestValue = (param) => {
        if (!PARAM_GROUPS.main.includes(param) &&
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

            <div className={s.tableWrapper}>
                <table className={s.table}>
                    <thead>
                    <tr className={s.tableHeader}>
                        <th className={s.parameterCell}>Параметр</th>
                        {comparisonFlats.map(flat => (
                            <th key={flat.id} className={s.flatHeader}>
                                <img
                                    src={flat.photos[0]}
                                    alt="Квартира"
                                    className={s.flatImage}
                                />
                                <div className={s.flatTitle}>
                                    {flat.street}, {flat.house}, кв. {flat.apartment}
                                </div>
                                <div className={s.flatDistrict}>{flat.district}</div>
                                <div className={s.actions}>
                                    <button className={s.actionButton}>
                                        <FaHeart />
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
                    {/* Основные параметры */}
                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            Основные характеристики
                        </td>
                    </tr>

                    {PARAM_GROUPS.main.map(param => (
                        <tr key={param} className={s.dataRow}>
                            <td className={s.parameterCell}>
                                {PARAM_NAMES[param]}
                                {PARAM_UNITS[param] && `, ${PARAM_UNITS[param]}`}
                            </td>
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

                    {/* Детали квартиры */}
                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            Детали квартиры
                        </td>
                    </tr>

                    {PARAM_GROUPS.flatDetails.map(param => (
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
                                );
                            })}
                        </tr>
                    ))}

                    {/* Детали дома */}
                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            Детали дома
                        </td>
                    </tr>

                    {PARAM_GROUPS.buildingDetails.map(param => (
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
                                );
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
                            <td className={s.parameterCell}>
                                {PARAM_NAMES[param]}
                                {PARAM_UNITS[param] && `, ${PARAM_UNITS[param]}`}
                            </td>
                            {comparisonFlats.map(flat => {
                                const value = flat.infrastructure?.[param];
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

                    {/* Транспорт */}
                    <tr className={s.sectionRow}>
                        <td colSpan={comparisonFlats.length + 1} className={s.sectionHeader}>
                            Транспортная доступность
                        </td>
                    </tr>

                    {PARAM_GROUPS.transport.map(param => (
                        <tr key={param} className={s.dataRow}>
                            <td className={s.parameterCell}>
                                {PARAM_NAMES[param]}
                                {PARAM_UNITS[param] && `, ${PARAM_UNITS[param]}`}
                            </td>
                            {comparisonFlats.map(flat => {
                                const value = flat.transportAccessibility?.[param];
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