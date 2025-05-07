import React, { useRef, useEffect } from 'react';
import { YMaps, Map, Placemark, TypeSelector, ZoomControl, RulerControl } from '@pbe/react-yandex-maps';

export const YandexMap = ({ inputCoordinates = [55, 57],inputZoom = 16, mapStyle }) => {
    const API_KEY = '7eee86e8-2b3d-4992-a7ec-b866b3fb9cc3';
    const mapRef = useRef(null); // для родительского элемента

    useEffect(() => {
        if (mapRef.current) {
            const container = mapRef.current.parentElement;
            if (container) {
                container.style.width = mapStyle?.width || '100%';
                container.style.height = mapStyle?.height || '400px';
            }
        }
    }, [mapStyle]);

    return (
        <div ref={mapRef}>
            <YMaps query={{ apikey: API_KEY }}>
                <Map
                    width={mapStyle?.width || '100%'}
                    height={mapStyle?.height || '400px'}
                    state={{
                        center: inputCoordinates,
                        zoom: inputZoom,
                        controls: [],
                    }}
                >
                    <Placemark
                        geometry={inputCoordinates}
                        options={{
                            preset: 'islands#greenDotIcon',
                            draggable: false,
                        }}
                    />
                    <TypeSelector options={{
                        position: { right: 10, top: 10 }
                    }} />
                    <ZoomControl options={{
                        position: { right: 10, top: 80 }
                    }} />
                    <RulerControl options={{
                        position: { right: 10, bottom: 30 }
                    }} />
                </Map>
            </YMaps>
        </div>
    );
};


export default YandexMap;