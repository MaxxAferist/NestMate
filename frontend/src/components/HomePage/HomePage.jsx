import {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import FlatCard from '../Cards/FlatCard.jsx'
import {useFavorites} from '../contexts/FavoritesContext.jsx'
//import {LoginContext} from "../contexts/LoginContext.jsx";
import {useComparison} from "../contexts/ComparisonContext.jsx";
import s from './HomePage.module.css'

const flatData1 = {
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
    features: ['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение', 'Холодильник', 'Микроволновая печь', 'Стиральная машина', 'Кондиционер', 'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт'],

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
    features: ['Микроволновая печь', 'Стиральная машина', 'Кондиционер', 'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт'],

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
    features: ['Лифт', 'Электричество', 'Газ', 'Интернет', 'Водоснабжение',  'Мебель', 'Видеонаблюдение', 'Домофон', 'Охрана', 'Пожарная сигнализация', 'Двор закрытого типа','Грузовой лифт'],

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

const flatMap = {
    56: flatData1,
    67: flatData2,
    89: flatData3,
}

export default function HomePage() {
    const navigate = useNavigate();
    const [currentStartIndex, setCurrentStartIndex] = useState(0);
    const { isFavorite, addFavorite, removeFavorite, loadFavorites } = useFavorites();
    //const {user} = useContext(LoginContext);
    const {comparisonFlats} = useComparison();




    const handleOnNextButtonClicked = ()=>{
        if(currentStartIndex <= 75 && (flatMap.length - currentStartIndex > -25)){
            setCurrentStartIndex(currentStartIndex + 25);
        }
    }
    const handleOnPrevButtonClicked = ()=>{
        if(currentStartIndex >= 25){
            setCurrentStartIndex(currentStartIndex - 25);
        }
    }

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




   /* if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
*/
    return (
        <div className={s.mainContainer}>
            <div className={s.cardsContainer}>
                <div className={s.cardsContainerHeader}>
                    <h2>
                        Квартиры, отсортированные методом анализа иерархий:
                    </h2>
                </div>
                {Object.entries(flatMap || {}).sort(([key1], [key2] )=>key2 - key1 )
                    .slice(currentStartIndex, (((Object.keys(flatMap).length - currentStartIndex - 25) > 0) ? (currentStartIndex+25) : (Object.keys(flatMap).length - currentStartIndex))).map(([key, item]) => (
                        <FlatCard key={key}  flatData={item} mark={key}
                                  isFavorite={isFavorite(item.id)}
                                  onFavoriteClick={(e) => handleFavoriteClick(item.id, e)}
                                  isInComparison={comparisonFlats.some(f => f.id === item.id)}
                                  cardClick={() => navigate(`/FlatPage/${item.id}`, { state: { flatData: item } })}
                        />
                    ))}
                <div className={s.cardsContainerFooter}>
                    <div className={s.nextPrevButtonsSection}>
                        <button className={s.nextPrevButtons} onClick={handleOnPrevButtonClicked} disabled={currentStartIndex === 0}>
                            Предыдущие 25 квартир
                        </button>
                        <button className={s.nextPrevButtons} onClick={handleOnNextButtonClicked} disabled={currentStartIndex === 75 || (Object.keys(flatMap).length - currentStartIndex - 25) <= -25 }>
                            Следующие 25 квартир
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}