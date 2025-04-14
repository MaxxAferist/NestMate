import { useState } from 'react';
import s from './FlatPage.module.css';
import { useLocation } from 'react-router-dom';
import { ParameterItem } from "./FlatPageComponents.jsx";
import YandexMap from "./YandexMap.jsx";

const FlatPage = () => {
    const location = useLocation();
    const { flatData } = location.state || {};
    const infrastructure = flatData?.infrastructure || {};
    const coordinates = flatData?.coords || {};
    const transportAccessibility = flatData?.transportAccessibility || {};

    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [photoStartIndex, setPhotoStartIndex] = useState(0);
    const photosToShow = 10;

    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) =>
            prev === flatData.photos.length - 1 ? 0 : prev + 1
        );
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex((prev) =>
            prev === 0 ? flatData.photos.length - 1 : prev - 1
        );
    };

    const nextMiniatures = () => {
        if (photoStartIndex + photosToShow < flatData.photos.length) {
            setPhotoStartIndex(photoStartIndex + 1);
        }
    };

    const prevMiniatures = () => {
        if (photoStartIndex > 0) {
            setPhotoStartIndex(photoStartIndex - 1);
        }
    };

    const selectPhoto = (index) => {
        setCurrentPhotoIndex(index);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className={s.pageContainer}>
            <div className={s.mainContent}>
                <h1 className={s.title}>
                    {flatData.type === 'sell' ? 'Продаётся' : 'Сдаётся'}
                    {flatData.rooms === 0 ? ' студия' : ` ${flatData.rooms}-комнатная квартира`},
                    {flatData.area} м², {flatData.city}
                </h1>

                <div className={s.photosSection}>
                    <div className={s.mainPhotoContainer}>
                        <button className={s.photoNavButton} onClick={prevPhoto}>&lt;</button>
                        <img
                            src={flatData.photos[currentPhotoIndex]}
                            alt="Квартира"
                            className={s.mainPhoto}
                        />
                        <button className={s.photoNavButton} onClick={nextPhoto}>&gt;</button>
                    </div>

                    <div className={s.miniaturesContainer}>
                        <button
                            className={s.miniaturesNavButton}
                            onClick={prevMiniatures}
                            disabled={photoStartIndex === 0}
                        >
                            &lt;
                        </button>

                        <div className={s.miniatures}>
                            {flatData.photos.slice(photoStartIndex, photoStartIndex + photosToShow).map((photo, index) => {
                                const actualIndex = photoStartIndex + index;
                                return (
                                    <img
                                        key={actualIndex}
                                        src={photo}
                                        alt="Миниатюра"
                                        className={`${s.miniature} ${actualIndex === currentPhotoIndex ? s.selectedMiniature : ''}`}
                                        onClick={() => selectPhoto(actualIndex)}
                                    />
                                );
                            })}
                        </div>

                        <button
                            className={s.miniaturesNavButton}
                            onClick={nextMiniatures}
                            disabled={photoStartIndex + photosToShow >= flatData.photos.length}
                        >
                            &gt;
                        </button>
                    </div>
                </div>

                <div className={s.section}>
                    <h2 className={s.sectionTitle}>Расположение</h2>
                    <p>
                        {flatData.region ? `${flatData.region},` : ''} {flatData.city}
                        {flatData.district && `, ${flatData.district}`}<br />
                        {flatData.street}, {flatData.house}
                        {flatData.apartment && `, кв. ${flatData.apartment}`}
                    </p>
                </div>

                <div className={s.section}>
                    <h2 className={s.sectionTitle}>Описание</h2>
                    <p>{flatData.description}</p>
                </div>
                <div className={s.section}>
                    <h2 className={s.sectionTitle}>О квартире</h2>
                    <div className={s.parametersGrid}>
                        <div className={s.parameterColumn}>
                            <ParameterItem label="Площадь">{flatData.area ? `${flatData.area} м²` : 'не указана'}</ParameterItem>
                            <ParameterItem label="Комнат">{flatData.rooms ? (flatData.rooms === 0 ? 'студия' : flatData.rooms) : 'нет данных'}</ParameterItem>
                            <ParameterItem label="Этаж">{flatData.floor ? flatData.floor : 'не указан'}</ParameterItem>
                        </div>
                        <div className={s.parameterColumn}>
                            <ParameterItem label="Высота потолков">{flatData.ceilingHeight ? `${flatData.ceilingHeight} м` : 'не указана'}</ParameterItem>
                            <ParameterItem label="Балкон/лоджия">{flatData.balconyType ? flatData.balconyType : 'нет данных'}</ParameterItem>
                            <ParameterItem label="Вид из окон">{flatData.viewFromWindows ? flatData.viewFromWindows.join(', ') : 'нет данных'}</ParameterItem>
                        </div>
                        <div className={s.parameterColumn}>
                            <ParameterItem label="Тип кухонной плиты">{flatData.kitchenStove ? flatData.kitchenStove  : 'не указан'}</ParameterItem>
                            <ParameterItem label="Состояние ремонта">{flatData.renovationCondition ? flatData.renovationCondition : 'нет данных'}</ParameterItem>
                        </div>
                    </div>
                </div>
                <div className={s.section}>
                    <h2 className={s.sectionTitle}>О доме</h2>
                    <div className={s.parametersGrid}>
                        <div className={s.parameterColumn}>
                            <ParameterItem label="Этажей в доме">{flatData.buildingFloors ? flatData.buildingFloors : 'нет данных'}</ParameterItem>
                            <ParameterItem label="Материал">{flatData.buildingMaterial ? flatData.buildingMaterial : 'нет данных'}</ParameterItem>
                            <ParameterItem label="Год постройки">{flatData.buildingYear ? flatData.buildingYear : 'нет данных'}</ParameterItem>
                        </div>
                    </div>
                </div>
                <div className={s.section}>
                    <h2 className={s.sectionTitle}>Удобства</h2>
                    <div className={s.parametersGrid} style={{gridTemplateColumns: "1fr 1fr 1fr"}}>
                        {flatData.features.map((feature, index) => (
                            <div className={s.parameterItem} key={index}>
                                <span className={s.parameterName}></span>
                                <span className={s.parameterValue}>{feature}</span>
                            </div>
                            ))}
                    </div>
                </div>
                {infrastructure &&
                    <div className={s.section}>
                        <h2 className={s.sectionTitle}>Инфраструктура района</h2>
                        <div className={s.parametersGrid} style={{gridTemplateColumns: "1fr 1fr"}}>
                            <div className={s.parameterColumn}>
                                <ParameterItem label="Парки">{infrastructure.parks
                                    ? `Пешком ${infrastructure.parks} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                                <ParameterItem label="Больницы">{infrastructure.hospitals
                                    ?`Пешком ${infrastructure.hospitals} минут`: 'нет данных'}
                                </ParameterItem>
                                <ParameterItem label="Торговые центры">{infrastructure.shoppingCenters
                                    ? `Пешком ${infrastructure.shoppingCenters} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                            </div>
                            <div className={s.parameterColumn}>
                                <ParameterItem label="Магазины">{infrastructure.shops
                                    ? `Пешком ${infrastructure.shops} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                                <ParameterItem label="Школы">{infrastructure.schools
                                    ? `Пешком ${infrastructure.schools} минут`
                                    : 'нет данных'
                                }</ParameterItem>
                                <ParameterItem label="Детские сады">{infrastructure.kindergartens
                                    ? `Пешком ${infrastructure.kindergartens} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                            </div>
                        </div>
                    </div>
                }
                { transportAccessibility &&
                    <div>
                        <h2 className={s.sectionTitle}>Транспортная доступность</h2>
                        <div className={s.parametersGrid} style={{gridTemplateColumns: "2fr 3fr"}}>
                            <div className={s.parameterColumn}>
                                <ParameterItem label="Расстояние до метро">{transportAccessibility.metroDistance
                                    ? `Пешком ${transportAccessibility.metroDistance} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                                <ParameterItem label="Время до метро на транспорте">{transportAccessibility.metroTransportTime
                                    ? `${transportAccessibility.metroTransportTime} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                            </div>
                            <div className={s.parameterColumn}>
                                <ParameterItem label="Остановки общественного транспорта">{transportAccessibility.publicTransportStops
                                    ? `Пешком ${transportAccessibility.publicTransportStops} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                                <ParameterItem label="Удалённость от центра города">{transportAccessibility.cityCenterDistance
                                    ? `Пешком ${transportAccessibility.cityCenterDistance} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                            </div>
                        </div>
                    </div>
                }

                {coordinates &&
                    <div style={{marginBottom: '40px'}}>
                        <h2 className={s.sectionTitle}>На карте</h2>
                        <YandexMap
                            inputCoordinates={[coordinates.lat, coordinates.lng]} inputZoom={16}
                        />
                    </div>
                }

            </div>
            <div className={s.sidebar}>
                <p className={s.sidebarTitle}>
                    {flatData.rooms === 0 ? 'Студия' : `${flatData.rooms}-комнатная квартира`},
                    {` ${flatData.area} м²`}, {flatData.city}
                </p>
                <div className={s.priceContainer}>
                    {flatData.type === 'sell' && (<h2 className={s.price}>{formatPrice(flatData.price)} ₽</h2>)}
                    {flatData.type === 'rent' && (<>
                            <h2 className={s.price}>{formatPrice(flatData.price)} ₽</h2>
                            <span className={s.pricePeriod}>в месяц</span></>)}
                </div>

                <div className={s.source}>Источник: {flatData.source}</div>

                <a
                    href={flatData.sourceLink}
                    className={s.sourceButton}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Перейти к источнику
                </a>

                <button className={s.actionButton}>
                    Добавить в сравнение
                </button>

                <button className={s.actionButton}>
                    Добавить в избранное
                </button>
            </div>
        </div>
    );
};

export default FlatPage;