import React, { useState } from 'react';
import { YMaps, Map, Placemark, FullscreenControl } from '@pbe/react-yandex-maps';
import FlatCard from '../Cards/FlatCard.jsx'
import s from './HomePageYandexMap.module.css'; // Импортируем стили

const HomePageYandexMap = ({ flats, onClose }) => {
    const [selectedFlat, setSelectedFlat] = useState(null);

    return (
        <div className={s.mapContainer}>
            <button
                onClick={onClose}
                className={s.closeButton}
            >
                Закрыть карту
            </button>

            <YMaps>
                <Map
                    width="100%"
                    height="100%"
                    defaultState={{
                        center: [59.93, 30.31], // Центр СПб
                        zoom: 11
                    }}
                >
                    <FullscreenControl />

                    {Object.entries(flats).map(([id, flat]) => (
                        <Placemark
                            key={id}
                            geometry={[flat.coords.lat, flat.coords.lng]}
                            properties={{
                                balloonContentHeader: `Квартира №${flat.apartment}`,
                                balloonContentBody: `
                  <div>
                    <p><strong>Цена:</strong> ${flat.price.toLocaleString()} ₽</p>
                    <p><strong>Площадь:</strong> ${flat.area} м²</p>
                    <p><strong>Комнат:</strong> ${flat.rooms}</p>
                    <p><strong>Этаж:</strong> ${flat.floor}/${flat.buildingFloors}</p>
                  </div>
                `,
                                balloonContentFooter: `<button onclick="document.getElementById('select-flat-${id}').click()">Подробнее</button>`,
                                hintContent: `Квартира за ${flat.price.toLocaleString()} ₽`
                            }}
                            options={{
                                preset: 'islands#blueHomeIcon',
                                iconColor: flat.type === 'sell' ? '#00b0ff' : '#4caf50'
                            }}
                            onClick={() => setSelectedFlat(flat)}
                        />
                    ))}
                </Map>
            </YMaps>

            {selectedFlat && (
                <div className={s.flatCardContainer}>
                    <FlatCard
                        flatData={selectedFlat}
                        mark={Object.keys(flats).find(id => flats[id].id === selectedFlat.id)}
                        isFavorite={false}
                        isInComparison={false}
                        onFavoriteClick={() => {}}
                        onComparisonClick={() => {}}
                        showButtonsSection={false}
                        cardClick={() => {}}
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