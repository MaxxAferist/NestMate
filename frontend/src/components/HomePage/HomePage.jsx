import {useState, useContext, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import FlatCard from '../Cards/FlatCard.jsx'
import {useFavorites} from '../contexts/FavoritesContext.jsx'
import {LoginContext} from "../contexts/LoginContext.jsx";
import {useComparison} from "../contexts/ComparisonContext.jsx";
import HomePageYandexMap from "./HomePageYandexMap.jsx";
import s from './HomePage.module.css'
import {ErrorText, LoadingText} from "../commonElements/fields.jsx";
import { NextPrevButton } from "../commonElements/buttons.jsx";
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";

/*const flatData1 = {
    id: 12,
    type: 'sell', // или 'rent'
    rooms: 2,
    ceilingHeight: 2.7,
    balconyType: "Балкон",
    renovationCondition: "Не требует ремонта",
    kitchenStove: "Электрическая",
    area: 65,
    city: 'Санкт-Петербург',
    photos: [
        'https://img.freepik.com/free-photo/beautiful-shot-modern-house-kitchen-dining-room_181624-2870.jpg?t=st=1743417939~exp=1743421539~hmac=b31dabced9797b9a8ecc6e509401eb8e3bde361bfef8ef8335406064c4a44671&w=1380',
        'https://img.freepik.com/free-photo/3d-rendering-loft-scandinavian-living-room-with-working-table-bookshelf_105762-2162.jpg?t=st=1743418002~exp=1743421602~hmac=7a5fc4bb0f974cc701011fbf9c466e19f39505fdc1cb6050c09902c0c1642403&w=1380',
        'https://img.freepik.com/free-photo/cozy-living-room-modern-apartment_181624-58445.jpg?t=st=1743418044~exp=1743421644~hmac=fc6cfd7881af00be3b94bf95cc6f8fd26e59b53bed9dcb57199b60ad131e0325&w=1380',
        'https://img.freepik.com/free-photo/low-angle-office-building-city_23-2148767059.jpg?t=st=1743418225~exp=1743421825~hmac=57e579de25d19b4d219aeb51098404fd1f2a8324c89d044e528e6f68c2fa44a8&w=1380',
        'https://img.freepik.com/free-photo/hallway-hotel-floor_23-2149304103.jpg?t=st=1743418258~exp=1743421858~hmac=86f7b07efb1c570ac2524ad328952d43b90e68c318885b733cb84e70e121b14d&w=740',
        'https://img.freepik.com/free-photo/parking_1127-2914.jpg?t=st=1743418282~exp=1743421882~hmac=d6fb1283bea827687e0a248c202d9ac01eed222821626f0b631cf3c7058aea8f&w=1380',
    ],
    region: '',
    district: 'Выборгский',
    street: 'Ленина',
    house: '10',
    apartment: '25',
    description: 'Светлая просторная квартира с современным ремонтом. Панорамные окна, вид на город. Встроенная кухня, санузел раздельный.',
    floor: 5,
    amenities: ['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение', 'Холодильник', 'Микроволновая печь', 'Стиральная машина', 'Кондиционер', 'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт'],

    buildingFloors: 9,
    buildingYear: 2015,
    buildingMaterial: 'Монолит',

    infrastructure: {
        parks: 20,
        hospitals: 25,
        shoppingCenters: 13,
        shops: 66,
        schools: 33,
        kindergartens: 44,
    },
    coords: {
        lat: 59.90393204625359,
        lng: 30.517566538418627,
        zoom: 16
    },
    transportAccessibility: {
        publicTransportStops: 15,
        metroDistance: 20,
    },
    price: 12000000,
    source: 'ЦИАН',
    sourceLink: 'https://cian.ru/some-link'
};
const flatData2 = {
    id: 13,
    type: 'sell', // или 'rent'
    rooms: 3,
    ceilingHeight: 3.0,
    balconyType: "Балкон",
    renovationCondition: "Не требует ремонта",
    kitchenStove: "Газовая",
    area: 56,
    city: 'Санкт-Петербург',
    photos: [
        'https://img.freepik.com/free-photo/3d-rendering-loft-scandinavian-living-room-with-working-table-bookshelf_105762-2162.jpg?t=st=1743418002~exp=1743421602~hmac=7a5fc4bb0f974cc701011fbf9c466e19f39505fdc1cb6050c09902c0c1642403&w=1380',
        'https://img.freepik.com/free-photo/cozy-living-room-modern-apartment_181624-58445.jpg?t=st=1743418044~exp=1743421644~hmac=fc6cfd7881af00be3b94bf95cc6f8fd26e59b53bed9dcb57199b60ad131e0325&w=1380',
        'https://img.freepik.com/free-photo/low-angle-office-building-city_23-2148767059.jpg?t=st=1743418225~exp=1743421825~hmac=57e579de25d19b4d219aeb51098404fd1f2a8324c89d044e528e6f68c2fa44a8&w=1380',
        'https://img.freepik.com/free-photo/hallway-hotel-floor_23-2149304103.jpg?t=st=1743418258~exp=1743421858~hmac=86f7b07efb1c570ac2524ad328952d43b90e68c318885b733cb84e70e121b14d&w=740',
        'https://img.freepik.com/free-photo/parking_1127-2914.jpg?t=st=1743418282~exp=1743421882~hmac=d6fb1283bea827687e0a248c202d9ac01eed222821626f0b631cf3c7058aea8f&w=1380',
    ],
    region: '',
    district: 'Петроградский',
    street: 'Ульянова',
    house: '34',
    apartment: '12',
    description: 'Светлая просторная квартира с современным ремонтом. Панорамные окна, вид на город. Встроенная кухня, санузел раздельный.',
    floor: 8,
    amenities: ['Микроволновая печь', 'Стиральная машина', 'Кондиционер', 'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт'],

    buildingFloors: 12,
    buildingYear: 2004,
    buildingMaterial: 'Монолит',

    infrastructure: {
        parks: 45,
        hospitals: 32,
        shoppingCenters: 11,
        shops: 22,
        schools: 14,
        kindergartens: 56,
    },
    coords: {
        lat: 56.90393204625359,
        lng: 34.517566538418627,
        zoom: 16
    },
    transportAccessibility: {
        publicTransportStops: 12,
        metroDistance: 15,
    },
    price: 14560000,
    source: 'АВИТО',
    sourceLink: 'https://avito.tu/some-link'
};
const flatData3 = {
    id: 14,
    type: 'sell', // или 'rent'
    rooms: 3,
    ceilingHeight: 2.7,
    balconyType: "Лоджия",
    renovationCondition: "Требует ремонта",
    kitchenStove: "Газовая",
    area: 85,
    city: 'Санкт-Петербург',
    photos: [
        'https://img.freepik.com/free-photo/cozy-living-room-modern-apartment_181624-58445.jpg?t=st=1743418044~exp=1743421644~hmac=fc6cfd7881af00be3b94bf95cc6f8fd26e59b53bed9dcb57199b60ad131e0325&w=1380',
        'https://img.freepik.com/free-photo/low-angle-office-building-city_23-2148767059.jpg?t=st=1743418225~exp=1743421825~hmac=57e579de25d19b4d219aeb51098404fd1f2a8324c89d044e528e6f68c2fa44a8&w=1380',
        'https://img.freepik.com/free-photo/hallway-hotel-floor_23-2149304103.jpg?t=st=1743418258~exp=1743421858~hmac=86f7b07efb1c570ac2524ad328952d43b90e68c318885b733cb84e70e121b14d&w=740',
        'https://img.freepik.com/free-photo/parking_1127-2914.jpg?t=st=1743418282~exp=1743421882~hmac=d6fb1283bea827687e0a248c202d9ac01eed222821626f0b631cf3c7058aea8f&w=1380',
    ],
    region: '',
    district: 'Приморский',
    street: 'Карла Маркса',
    house: '23',
    apartment: '56',
    description: 'Светлая просторная квартира с современным ремонтом. Панорамные окна, вид на город. Встроенная кухня, санузел раздельный.',
    floor: 2,
    amenities: ['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение',  'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт'],

    buildingFloors: 13,
    buildingYear: 1985,
    buildingMaterial: 'Монолит',

    infrastructure: {
        parks: 40,
        hospitals: 35,
        shoppingCenters: 25,
        shops: 10,
        schools: 10,
        kindergartens: 10,
    },
    coords: {
        lat: 49.90393204625359,
        lng: 32.517566538418627,
        zoom: 16
    },
    transportAccessibility: {
        publicTransportStops: 34,
        metroDistance: 12,
    },
    price: 12000000,
    source: 'ЦИАН',
    sourceLink: 'https://cian.ru/some-link'
};
const flatData4 = {
    id: 15,
    type: 'sell', // или 'rent'
    rooms: 6,
    ceilingHeight: 3.7,
    balconyType: "Балкон",
    renovationCondition: "Не требует ремонта",
    kitchenStove: "Электрическая",
    area: 76,
    city: 'Санкт-Петербург',
    photos: [
        'https://img.freepik.com/free-photo/low-angle-office-building-city_23-2148767059.jpg?t=st=1743418225~exp=1743421825~hmac=57e579de25d19b4d219aeb51098404fd1f2a8324c89d044e528e6f68c2fa44a8&w=1380',
        'https://img.freepik.com/free-photo/hallway-hotel-floor_23-2149304103.jpg?t=st=1743418258~exp=1743421858~hmac=86f7b07efb1c570ac2524ad328952d43b90e68c318885b733cb84e70e121b14d&w=740',
        'https://img.freepik.com/free-photo/parking_1127-2914.jpg?t=st=1743418282~exp=1743421882~hmac=d6fb1283bea827687e0a248c202d9ac01eed222821626f0b631cf3c7058aea8f&w=1380',
    ],
    region: '',
    district: 'Курортный',
    street: 'Купчинская',
    house: '56',
    apartment: '32',
    description: 'Светлая просторная квартира с современным ремонтом. Панорамные окна, вид на город. Встроенная кухня, санузел раздельный.',
    floor: 6,
    amenities: ['Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт'],

    buildingFloors: 56,
    buildingYear: 2003,
    buildingMaterial: 'Деревянный',

    infrastructure: {
        parks: 40,
        hospitals: 35,
        shoppingCenters: 25,
        shops: 10,
        schools: 10,
        kindergartens: 10,
    },
    coords: {
        lat: 49.90393204625359,
        lng: 32.517566538418627,
        zoom: 16
    },
    transportAccessibility: {
        publicTransportStops: 34,
        metroDistance: 12,
    },
    price: 17600000,
    source: 'ЦИАН',
    sourceLink: 'https://cian.ru/some-link'
};
const flatData5 = {
    id: 16,
    type: 'sell', // или 'rent'
    rooms: 4,
    ceilingHeight: 6.7,
    balconyType: "Лоджия",
    renovationCondition: "Требует ремонта",
    kitchenStove: "Газовая",
    area: 43,
    city: 'Санкт-Петербург',
    photos: [
        'https://img.freepik.com/free-photo/low-angle-office-building-city_23-2148767059.jpg?t=st=1743418225~exp=1743421825~hmac=57e579de25d19b4d219aeb51098404fd1f2a8324c89d044e528e6f68c2fa44a8&w=1380',
        'https://img.freepik.com/free-photo/hallway-hotel-floor_23-2149304103.jpg?t=st=1743418258~exp=1743421858~hmac=86f7b07efb1c570ac2524ad328952d43b90e68c318885b733cb84e70e121b14d&w=740',
        'https://img.freepik.com/free-photo/parking_1127-2914.jpg?t=st=1743418282~exp=1743421882~hmac=d6fb1283bea827687e0a248c202d9ac01eed222821626f0b631cf3c7058aea8f&w=1380',
    ],
    region: '',
    district: 'Центральный',
    street: 'Невский проспект',
    house: '4',
    apartment: '12',
    description: 'Светлая просторная квартира с современным ремонтом. Панорамные окна, вид на город. Встроенная кухня, санузел раздельный.',
    floor: 2,
    amenities: ['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение',  'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт'],

    buildingFloors: 34,
    buildingYear: 1810,
    buildingMaterial: 'Камень',

    infrastructure: {
        parks: 40,
        hospitals: 35,
        shoppingCenters: 25,
        shops: 10,
        schools: 10,
        kindergartens: 10,
    },
    coords: {
        lat: 49.90393204625359,
        lng: 32.517566538418627,
        zoom: 16
    },
    transportAccessibility: {
        publicTransportStops: 34,
        metroDistance: 12,
    },
    price: 12000000,
    source: 'ЦИАН',
    sourceLink: 'https://cian.ru/some-link'
};
const flatData6 = {
    id: 17,
    type: 'sell', // или 'rent'
    rooms: 6,
    ceilingHeight: 2.7,
    balconyType: "Лоджия",
    renovationCondition: "Евроремонт",
    kitchenStove: "Электрическая",
    area: 91,
    city: 'Санкт-Петербург',
    photos: [
        'https://img.freepik.com/free-photo/hallway-hotel-floor_23-2149304103.jpg?t=st=1743418258~exp=1743421858~hmac=86f7b07efb1c570ac2524ad328952d43b90e68c318885b733cb84e70e121b14d&w=740',
        'https://img.freepik.com/free-photo/parking_1127-2914.jpg?t=st=1743418282~exp=1743421882~hmac=d6fb1283bea827687e0a248c202d9ac01eed222821626f0b631cf3c7058aea8f&w=1380',
    ],
    region: '',
    district: 'Московский',
    street: 'Сталина',
    house: '2',
    apartment: '21',
    description: 'Светлая просторная квартира с современным ремонтом. Панорамные окна, вид на город. Встроенная кухня, санузел раздельный.',
    floor: 5,
    amenities: ['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение',  'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт'],

    buildingFloors: 5,
    buildingYear: 1878,
    buildingMaterial: 'Еловые ветки',

    infrastructure: {
        parks: 40,
        hospitals: 35,
        shoppingCenters: 25,
        shops: 10,
        schools: 10,
        kindergartens: 10,
    },
    coords: {
        lat: 49.90393204625359,
        lng: 32.517566538418627,
        zoom: 16
    },
    transportAccessibility: {
        publicTransportStops: 34,
        metroDistance: 12,
    },
    price: 25000000,
    source: 'ЦИАН',
    sourceLink: 'https://cian.ru/some-link'
};
const flatData7 = {
    id: 14,
    type: 'sell', // или 'rent'
    rooms: 1,
    ceilingHeight: 2.7,
    balconyType: "Лоджия",
    renovationCondition: "Требует ремонта",
    kitchenStove: "Газовая",
    area: 23,
    city: 'Санкт-Петербург',
    photos: [
        'https://img.freepik.com/free-photo/parking_1127-2914.jpg?t=st=1743418282~exp=1743421882~hmac=d6fb1283bea827687e0a248c202d9ac01eed222821626f0b631cf3c7058aea8f&w=1380',
    ],
    region: '',
    district: 'Василеостровский',
    street: 'Красная',
    house: '5',
    apartment: '10',
    description: 'Светлая просторная квартира с современным ремонтом. Панорамные окна, вид на город. Встроенная кухня, санузел раздельный.',
    floor: 2,
    amenities: ['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение',  'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана'],

    buildingFloors: 5,
    buildingYear: 1985,
    buildingMaterial: 'Кирпич',

    infrastructure: {
        parks: 40,
        hospitals: 35,
        shoppingCenters: 25,
        shops: 10,
        schools: 10,
        kindergartens: 10,
    },
    coords: {
        lat: 49.90393204625359,
        lng: 32.517566538418627,
        zoom: 16
    },
    transportAccessibility: {
        publicTransportStops: 34,
        metroDistance: 12,
    },
    price: 12000000,
    source: 'ЦИАН',
    sourceLink: 'https://cian.ru/some-link'
};
const flatMap2 = {
    56: flatData1,
    67: flatData2,
    89: flatData3,
    100: flatData4,
    32: flatData5,
    43: flatData6,
    54: flatData7
}*/

export default function HomePage() {
    const navigate = useNavigate();
    /*const [currentStartIndex, setCurrentStartIndex] = useState(0);*/
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { isFavorite, handleFavoriteClick} = useFavorites();
    const {user, flatPreferences, rentPreferences} = useContext(LoginContext);
    const {isInComparison, handleComparisonClick} = useComparison();

    const [isMAI, setIsMAI ] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState(0);
    const [flatMap, setFlatMap] = useState([]);

    const [prioritiesError, setPrioritiesError] = useState(null);
    const [prioritiesErrorSuggestion, setPrioritiesErrorSuggestion] = useState(null);

    const [showYMap, setShowYMap] = useState(false);

    const fetchSortedApartments = async (page, type ) => {
        setLoading(true);
        setError(null);
        setPrioritiesError(null);
        setPrioritiesErrorSuggestion(null);
        try {
            const response = await fetch(`/api/mainIndex/${user.id}/${page}/${type}`);
            if (!response.ok) {
                throw new Error('Ошибка загрузки квартир: ' + response.message);
            }
            const data = await response.json();
            console.log('data', data);
            if (data.status === 'success') {
                setFlatMap(data.apartments.apartments);
                if(!data.apartments.is_MAIl){
                    setPrioritiesError('Квартиры не отсортированы методом МАИ!');
                    setPrioritiesErrorSuggestion([{
                        text: 'Чтобы отсортировать квартиры методом МАИ:',
                        button: null
                    }, {
                        text: 'Перейдите в профиль, нажав на кнопку ',
                        button: 'Изменить параметры подбора в профиле'
                    }, {
                        text: 'Заполните параметры подбора квартиры, нажав на кнопку ',
                        button: 'Редактировать параметры квартиры'
                    }, {
                        text: 'Попарно сравните необходимые параметры подбора, нажав на кнопку ',
                        button: 'Попарное сравнение параметров (МАИ)'
                    }, {
                        text: 'Сохраните парные сравнения параметров нажав на кнопку ',
                        button: 'Сохранить сравнения'
                    }]);
                }else{
                    setIsMAI(true);
                }
            } else {
                throw new Error(data.message || 'Неизвестная ошибка');
            }
        } catch (err) {
            setError(`Ошибка загрузки квартир: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchRandomApartments = async (page, type) => {
        setLoading(true);
        setError(null);
        try{
            const response = await fetch(`/api/mainIndex/${page}/${type}`);
            if (!response.ok) {
                throw new Error("Ошибка при получении квартир: " + response.message);
            }
            const data = await response.json();
            if (data.status === 'success') {
                setFlatMap(data.apartments.apartments);
            }else{
                throw new Error('Ошибка загрузки квартир: ' + data.message);
            }
        }catch(err) {
            setError('Ошибка загрузки квартир: '+err.message);
        }finally {
            setLoading(false);
        }
    }



    const handleOnSearchClick = async () => {
        if (user && user.id && !loading && ((filterType === 0 ? Object.keys(flatPreferences.priorities).length : Object.keys(rentPreferences.priorities).length) !== 0)) {
            setPrioritiesError(null);
            setPrioritiesErrorSuggestion(null);
            setLoading(true);
            setError(null);
            try {
                const sortResponse = await fetch(`/api/sorted_mai/${user.id}/${filterType}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const sortData = await sortResponse.json();

                if (!sortResponse.ok) {
                    throw new Error('Произошла ошибка во время сортировки квартир: '+ sortData.message);
                }


                if (sortData.status !== 'success') {
                    throw new Error(sortData.message || 'Произошла ошибка при сортировке');
                }

                // запрос квартир
                await fetchSortedApartments(1, filterType);
                localStorage.setItem('pageNumber', '1');
                setCurrentPageNumber(1);

            } catch (err) {
                setError(`${err.message}`);
            } finally {
                setLoading(false);
            }
        } else if(filterType === 0 && Object.keys(flatPreferences.priorities).length === 0){
            setPrioritiesError("Сортировка для покупки невозможна. Для сортировки необходимо попарно сравнить параметры в профиле.");
            setPrioritiesErrorSuggestion([{
                    text: 'Перейдите в профиль, нажав на кнопку ',
                    button: 'Изменить параметры подбора в профиле'
                }, {
                    text: 'Заполните параметры подбора квартиры, нажав на кнопку ',
                    button: 'Редактировать параметры квартиры'
                }, {
                    text: 'Попарно сравните необходимые параметры подбора, нажав на кнопку ',
                    button: 'Попарное сравнение параметров (МАИ)'
                }, {
                    text: 'Сохраните парные сравнения параметров нажав на кнопку ',
                    button: 'Сохранить сравнения'
                }]);

        }else if(filterType === 1 && Object.keys(rentPreferences.priorities).length === 0){
            setPrioritiesError("Сортировка для аренды невозможна. Для сортировки необходимо попарно сравнить параметры в профиле.");
            setPrioritiesErrorSuggestion([ {
                text: 'Перейдите в профиль, нажав на кнопку ',
                button: 'Изменить параметры подбора в профиле'
            }, {
                text: 'Заполните дополнительные параметры для аренды, нажав на кнопку ',
                button: 'Редактировать параметры аренды'
            }, {
                text: 'Попарно сравните необходимые параметры аренды, нажав на кнопку ',
                button: 'Попарное сравнение параметров (МАИ)'
            }, {
                text: 'Сохраните парные сравнения параметров нажав на кнопку ',
                button: 'Сохранить сравнения'
            }]);
        }
    };

    useEffect(() => {
        if(user && user.id) {
            const savedPageNumber = localStorage.getItem('pageNumber');
            const savedFilterType = localStorage.getItem('filterType');
            if (savedPageNumber && savedFilterType) {
                setCurrentPageNumber(parseInt(savedPageNumber));
                setFilterType(parseInt(savedFilterType));
                fetchSortedApartments(parseInt(savedPageNumber),parseInt(savedFilterType));
            }else{
                fetchSortedApartments(1);
                localStorage.setItem('pageNumber', '1');
                localStorage.setItem('filterType', '0');
            }
        }else{
            const savedPageNumber = localStorage.getItem('pageNumber');
            const savedFilterType = localStorage.getItem('filterType');
            if (savedPageNumber && savedFilterType) {
                setCurrentPageNumber(parseInt(savedPageNumber))
                setFilterType(parseInt(savedFilterType))
                fetchRandomApartments(parseInt(savedPageNumber), parseInt(savedFilterType))
            }else{
                fetchRandomApartments(1, filterType);
                localStorage.setItem('pageNumber', '1');
                localStorage.setItem('filterType', '0');
            }
        }
    }, [user]);

   /* useEffect(() => {
        fetchApartments(currentPageNumber);
    }, [currentPageNumber]);*/

    const handleFilterChange = (type) => {
        setFilterType(type);
        localStorage.setItem('filterType', type);
        if(!user) {
            fetchRandomApartments(1, type);
            localStorage.setItem('pageNumber', '1');
            setCurrentPageNumber(1);
        }else if(user && user.id){
            fetchSortedApartments(1, type);
            localStorage.setItem('pageNumber', '1');
            setCurrentPageNumber(1);
        }
    };


    /*const handleOnNextButtonClicked = ()=>{
        if(currentStartIndex <= 75 && (flatMap2.length - currentStartIndex - 25 > 0)){
            setCurrentStartIndex(currentStartIndex + 25);
        }
    }
    const handleOnPrevButtonClicked = ()=>{
        if(currentStartIndex >= 25){
            setCurrentStartIndex(currentStartIndex - 25);
        }
    }*/

    const handleOnNextButtonClicked = ()=>{
        localStorage.setItem('pageNumber', `${currentPageNumber + 1}`);
        if(user && user.id) {
            fetchSortedApartments(currentPageNumber + 1, filterType);
            setCurrentPageNumber(currentPageNumber + 1);
        }else{
            fetchRandomApartments(currentPageNumber + 1, filterType);
            setCurrentPageNumber(currentPageNumber + 1);
        }

    }
    const handleOnPrevButtonClicked = ()=>{
        if((currentPageNumber - 1) !== 0){
            localStorage.setItem('pageNumber', `${currentPageNumber - 1}`);
            if(user && user.id) {
                fetchSortedApartments(currentPageNumber -1, filterType );
                setCurrentPageNumber(currentPageNumber - 1);
            }else{
                fetchRandomApartments(currentPageNumber -1, filterType );
                setCurrentPageNumber(currentPageNumber - 1);
            }
        }
    }
    const handleOnToFirstButtonClicked = ()=>{
        if(currentPageNumber !== 1){
            localStorage.setItem('pageNumber', `1`);
            if(user && user.id) {
                fetchSortedApartments(1, filterType );
                setCurrentPageNumber(1);
            }else{
                fetchRandomApartments(1, filterType );
                setCurrentPageNumber(1);
            }
        }
    }

    if(loading){
        return (<LoadingText/>);
    }

    if(error){
        return (
            <ErrorText>
                Ошибка: {error}
            </ErrorText>
        );
    }


    if(flatMap.length === 0 || loading){
        return <div>Загрузка...</div>
    }
    return (
        <div className={s.mainContainer}>
            <div className={s.filterPanel}>
                <div className={s.searchPanel}>
                    <div className={s.filterSection}>
                        <span className={s.filterTitle}>Сортировать квартиры для:</span>
                        <div className={s.filterOptions}>
                            <label className={`${s.filterLabel} ${filterType === 0 ? s.checked : ''}`}>
                                <input
                                    className={s.radioButton}
                                    type="radio"
                                    name="filter"
                                    checked={filterType === 0}
                                    onChange={() => handleFilterChange(0)}
                                />
                                <span className={s.radioLabel}>Покупки</span>
                            </label>

                            <label className={`${s.filterLabel} ${filterType === 1 ? s.checked : ''}`}>
                                <input
                                    className={s.radioButton}
                                    type="radio"
                                    name="filter"
                                    checked={filterType === 1}
                                    onChange={() => handleFilterChange(1)}
                                />
                                <span className={s.radioLabel}>Аренды</span>
                            </label>
                        </div>
                    </div>
                    <div className={s.searchButtonSection}>
                        <button className={s.searchButton} onClick={handleOnSearchClick}>
                            Подобрать квартиры
                        </button>
                    </div>
                </div>

                <div className={s.secondaryControls}>
                    <button className={s.secondaryButton} onClick={() => navigate('/Profile')}>
                        Изменить параметры подбора в профиле
                    </button>
                    <button className={s.secondaryButton} onClick={() => setShowYMap(true)}>
                        Показать квартиры на карте
                    </button>
                    {showYMap && <HomePageYandexMap flats={flatMap} onClose={() => setShowYMap(false)} />}
                </div>

                {prioritiesError &&
                    <div className={s.messagesContainer}>
                        <div className={s.warning}>
                            <span className={s.warningIcon}>⚠</span>
                            {prioritiesError}
                        </div>

                        <div className={s.Recommendations}>
                            <h5>Рекомендации:</h5>
                            <ul>
                                {prioritiesErrorSuggestion.map((item, index) => (
                                    <li key={index}>
                                        {item.text}
                                        {item.button &&
                                            <span className={s.backgroundLighting}>"{item.button}".</span>
                                        }
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                }
            </div>


            <div className={s.cardsContainer}>
                <div className={s.cardsContainerHeader}>
                    {/*<FaArrowCircleLeft onClick={handleOnPrevButtonClicked} disabled={currentPageNumber === 1}/>*/}
                    <div>
                            <FaArrowCircleLeft className={s.iconButton} onClick={handleOnPrevButtonClicked} style={currentPageNumber === 1 ? {color:'grey'} : null}/>
                    </div>

                    {isMAI ?
                        (<h2>
                            Квартиры, отсортированные методом анализа иерархий:
                        </h2>) :
                        (
                            <h2>
                                Подборка случайных квартир:
                            </h2>
                        )
                    }
                    {/*<FaArrowCircleRight  onClick={handleOnNextButtonClicked} disabled={flatMap.length !== 25}/>*/}
                    <div>
                            <FaArrowCircleRight className={s.iconButton} onClick={handleOnNextButtonClicked} disable={flatMap.length !== 25}/>
                    </div>
                </div>

                {flatMap.map(flatData => (
                    <FlatCard key={flatData.id}  flatData={flatData} mark={flatData?.weight || null}
                              isFavorite={isFavorite(flatData.id)}
                              isInComparison={isInComparison(flatData.id)}
                              onFavoriteClick={() => handleFavoriteClick(flatData.id)}
                              onComparisonClick={(e) => handleComparisonClick(flatData.id, e)}
                              cardClick={() => navigate(`/FlatPage/${flatData.id}`, { state: { flat_id: flatData.id } })}
                    />
                ))}
                <div className={s.cardsContainerFooter}>
                    <div className={s.nextPrevButtonsSection}>
                        <NextPrevButton handleOnButtonClicked={handleOnPrevButtonClicked}
                                        disable={currentPageNumber === 1} isNext={false}
                        />
                        <NextPrevButton handleOnButtonClicked={handleOnToFirstButtonClicked} isToFirst={true}
                                        disable={currentPageNumber === 1}
                        />
                        <NextPrevButton handleOnButtonClicked={handleOnNextButtonClicked}
                                        disable={flatMap.length !== 25} isNext={true}
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}
/*disabled={currentStartIndex === 75 || (Object.keys(flatMap2).length - currentStartIndex - 25) <= 0 }*/
