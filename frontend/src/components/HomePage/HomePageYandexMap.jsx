import { useState,useRef} from 'react';
import { YMaps, Map, Placemark, TypeSelector, ZoomControl, RulerControl} from '@pbe/react-yandex-maps';
import FlatCard from '../Cards/FlatCard.jsx'
import s from './HomePageYandexMap.module.css';
import {useFavorites} from '../contexts/FavoritesContext.jsx'
import {useComparison} from "../contexts/ComparisonContext.jsx";
import { useNavigate } from 'react-router-dom'

const HomePageYandexMap = ({ flats, onClose }) => {
    const [selectedFlat, setSelectedFlat] = useState(null);
    const { isFavorite, handleFavoriteClick} = useFavorites();
    const {isInComparison, handleComparisonClick} = useComparison();
    const navigate = useNavigate();

    const API_KEY = '7eee86e8-2b3d-4992-a7ec-b866b3fb9cc3';


    return (
        <div className={s.mapContainer}>
            <button
                onClick={onClose}
                className={s.closeButton}
            >
                Закрыть карту
            </button>

            <YMaps
                query={{ apikey: API_KEY }}
                options={{
                    copyrightLink: 'https://yandex.ru/dev/commercial/doc/ru/',
                }}
            >
                <Map
                    width="100%"
                    height="100%"
                    defaultState={{
                        center: [59.93, 30.31],
                        zoom: 11,
                        controls: [],
                    }}
                >
                    {Object.entries(flats).map(([id, flat]) => (
                        <Placemark
                            key={id}
                            geometry={[flat.coords.lat, flat.coords.lng]}
                            properties={{
                                iconContent: `${id}`,
                                iconCaption: `${flat.price} ₽`,
                            }}
                            options={{
                                iconColor: flat.type === 'sell' ? '#00b0ff' : '#4caf50',
                                iconContentColor: 'blue'
                            }}
                            onClick={() => setSelectedFlat(flat)}
                        />

                    ))}
                    <TypeSelector
                        mapTypes={['yandex#map', 'yandex#satellite', 'yandex#hybrid']}
                        options={{
                            position: { right: 140, top: 10 },
                            panoramasItemMode: "off"
                        }}
                    />
                    <ZoomControl options={{
                        position: { right: 10, top: 80 }
                    }} />
                    <RulerControl options={{
                        position: { right: 10, bottom: 30 }
                    }} />
                </Map>
            </YMaps>

            {selectedFlat && (
                <div className={s.flatCardContainer}>
                    <FlatCard
                        flatData={selectedFlat}
                        mark={null}
                        isFavorite={isFavorite(selectedFlat.id)}
                        isInComparison={isInComparison(selectedFlat.id)}
                        onFavoriteClick={() => handleFavoriteClick(selectedFlat.id)}
                        onComparisonClick={(e) => handleComparisonClick(selectedFlat.id, e)}
                        showButtonsSection={true}
                        isFixed={false}
                        cardClick={() => navigate(`/FlatPage/${selectedFlat.id}`, { state: { flat_id: selectedFlat.id } })}
                    />
                    <button
                        onClick={() => setSelectedFlat(null)}
                        className={s.cardCloseButton}
                    >
                        Закрыть
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomePageYandexMap;