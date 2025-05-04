import {useEffect, useState, useContext} from 'react';
import s from './FlatPage.module.css';
import { useLocation } from 'react-router-dom';
import { ParameterItem } from "./FlatPageComponents.jsx";
import {useComparison} from "../contexts/ComparisonContext.jsx";
import {useFavorites} from "../contexts/FavoritesContext.jsx";
import YandexMap from "./YandexMap.jsx";
import {LoginContext} from "../contexts/LoginContext.jsx";
import parse from 'html-react-parser';

const FlatPage = () => {
    const location = useLocation();
    const { flat_id } = location.state || {};
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [photoStartIndex, setPhotoStartIndex] = useState(0);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    const[flatData, setFlatData] = useState(null);
    const photosToShow = 10;

    const {user} = useContext(LoginContext);

    const {handleFavoriteClick, isFavorite} = useFavorites();

    const { handleComparisonClick, isInComparison} = useComparison();
    useEffect(() => {
        if(user && user.id && flat_id ) {
            const fetchFlatData = async () => {
                try {
                    const response = await fetch(`/api/apartment/${flat_id}`);
                    const data = await response.json();
                    console.log('data',data.apartments);
                    if (data.status === 'success') {
                        setFlatData(data.apartments);
                    } else {
                        setError(data.message || 'Ошибка загрузки квартиры');
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchFlatData();
        }
    }, [user, flat_id]);

    /*console.log(flatData);*/
   /* const handleFavoriteClick = async () => {
        try {
            if (isFavorite(flatData.id)) {
                await removeFavorite(flatData.id);
            } else {
                await addFavorite(flatData.id);
            }
        } catch (error) {
            console.error("Ошибка при изменении избранного:", error);
        }
    };*/


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
            if(photoStartIndex+photosToShow + 5 < flatData.photos.length){
                setPhotoStartIndex(photoStartIndex + 5);
            }else{
                setPhotoStartIndex(photoStartIndex + (flatData.photos.length -photoStartIndex - photosToShow));
            }

        }
    };

    const prevMiniatures = () => {
        if (photoStartIndex > 0) {
            if(photoStartIndex - 5 > 0){
                setPhotoStartIndex(photoStartIndex - 5);
            }else{
                setPhotoStartIndex(photoStartIndex - 1)
            }

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

    const formatRooms = (rooms) => {
        if(typeof rooms === 'number'){
            if(rooms === 0){
                return ' студия, ';
            }else{
                return `${rooms}-комнатная квартира, `;
            }
        }else{
            return ' студия, ';
        }
    }

    if(flatData === null){
        return(
            <div>
                Загрузка.....
            </div>
        )
    }

    return (
        <div className={s.pageContainer}>
            <div className={s.mainContent}>
                <h1 className={s.title}>
                    {flatData.type === 'sell' ? 'Продаётся' : 'Сдаётся'}
                    {formatRooms(flatData.rooms)}
                    {flatData.area} м², {flatData.geo.city}
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
                        {flatData.geo.address ? flatData.geo.address: '-'}
                        {/*{flatData.region ? `${flatData.region},` : ''} {flatData.city}
                        {flatData.district && `, ${flatData.district}`}<br />
                        {flatData.street}, {flatData.house}
                        {flatData.apartment && `, кв. ${flatData.apartment}`}*/}
                    </p>
                </div>

                <div className={s.section}>
                    <h2 className={s.sectionTitle}>Описание</h2>
                    <div>{parse(flatData.description)}</div>
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
                        {flatData.amenities.map((item, index) => (
                            <div className={s.parameterItem} key={index}>
                                <span className={s.parameterName}></span>
                                <span className={s.parameterValue}>{item}</span>
                            </div>
                            ))}
                    </div>
                </div>
                {flatData.infrastructure &&
                    <div className={s.section}>
                        <h2 className={s.sectionTitle}>Инфраструктура района</h2>
                        <div className={s.parametersGrid} style={{gridTemplateColumns: "1fr 1fr"}}>
                            <div className={s.parameterColumn}>
                                <ParameterItem label="Парки">{flatData.infrastructure.parks
                                    ? `Пешком ${flatData.infrastructure.parks} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                                <ParameterItem label="Больницы">{flatData.infrastructure.hospitals
                                    ?`Пешком ${flatData.infrastructure.hospitals} минут`: 'нет данных'}
                                </ParameterItem>
                                <ParameterItem label="Торговые центры">{flatData.infrastructure.shoppingCenters
                                    ? `Пешком ${flatData.infrastructure.shoppingCenters} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                            </div>
                            <div className={s.parameterColumn}>
                                <ParameterItem label="Магазины">{flatData.infrastructure.shops
                                    ? `Пешком ${flatData.infrastructure.shops} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                                <ParameterItem label="Школы">{flatData.infrastructure.schools
                                    ? `Пешком ${flatData.infrastructure.schools} минут`
                                    : 'нет данных'
                                }</ParameterItem>
                                <ParameterItem label="Детские сады">{flatData.infrastructure.kindergartens
                                    ? `Пешком ${flatData.infrastructure.kindergartens} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                            </div>
                        </div>
                    </div>
                }
                { flatData.transportAccessibility &&
                    <div>
                        <h2 className={s.sectionTitle}>Транспортная доступность</h2>
                        <div className={s.parametersGrid} style={{gridTemplateColumns: "2fr 3fr"}}>
                            <div className={s.parameterColumn}>
                                <ParameterItem label="Расстояние до метро">{flatData.transportAccessibility.metroDistance
                                    ? `Пешком ${flatData.transportAccessibility.metroDistance} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                            </div>
                            <div className={s.parameterColumn}>
                                <ParameterItem label="Остановки общественного транспорта">{flatData.transportAccessibility.publicTransportStops
                                    ? `Пешком ${flatData.transportAccessibility.publicTransportStops} минут`
                                    : 'нет данных'}
                                </ParameterItem>
                            </div>
                        </div>
                    </div>
                }

                {flatData.coordinates &&
                    <div style={{marginBottom: '40px'}}>
                        <h2 className={s.sectionTitle}>На карте</h2>
                        <YandexMap
                            inputCoordinates={[flatData.coordinates.lat, flatData.coordinates.lng]} inputZoom={16}
                        />
                    </div>
                }

            </div>
            <div className={s.sidebar}>
                <p className={s.sidebarTitle}>
                    {((flatData.rooms === 'Студия' ||flatData.rooms === 0 ) ? 'Студия' : `${flatData.rooms}-комнатная квартиры`)},
                    {` ${flatData.area} м²`}, {flatData.geo.city}
                </p>
                <div className={s.priceContainer}>
                    {flatData.type === 'sell' && (<h2 className={s.price}>{formatPrice(flatData.price)} ₽</h2>)}
                    {flatData.type === 'rent' && (<>
                            <h2 className={s.price}>{formatPrice(flatData.price)} ₽ </h2>
                            <span className={s.pricePeriod}>в месяц</span></>)}
                </div>

                {/*<div className={s.source}>Источник: {flatData.source}</div>*/}

                <a
                    href={flatData.link}
                    className={s.sourceButton}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Перейти к источнику
                </a>

                <button className={s.compareButton}
                        onClick={ (e) => handleComparisonClick(flatData.id, e)}
                        style={isInComparison(flatData.id) ? { backgroundColor: '#48b5ff', color: 'white', borderColor: '#3182ce' } : null }
                >
                    {isInComparison(flatData.id) ? 'Уже в сравнении' : 'Добавить в сравнение'}
                </button>

               <button
                    className={s.favoriteButton}
                    onClick={ () => handleFavoriteClick(flatData.id) }
                    style={isFavorite(flatData.id) ? { backgroundColor: '#ff5e75', color: 'white', borderColor: '#e53e3e'} : null }
                >
                   {isFavorite(flatData.id) ? 'В избранном' : 'В избранное'}
                </button>
            </div>
        </div>
    );
};

export default FlatPage;