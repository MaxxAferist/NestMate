import { useNavigate } from 'react-router-dom'

const flatData = {
    id: 12,
    type: 'sell', // или 'rent'
    rooms: 2,
    ceilingHeight: 2.7,
    balconyType: "Балкон",
    renovationCondition: "Не требует ремонта",
    kitchenStove: "Электрическая",
    viewFromWindows: ["Во двор", "На улицу"],
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
    street: 'ул. Ленина',
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
        cityCenterDistance: 55,
        metroTransportTime: 11,
    },
    price: 12000000,
    source: 'ЦИАН',
    sourceLink: 'https://cian.ru/some-link'
};

export default function HomePage() {
    const navigate = useNavigate();
    return (
        <>
            <p>
                Главная страница
                <button onClick={() => navigate(`/FlatPage/${flatData.id}`, { state: { flatData: flatData } })}>
                    Пробная страница квартиры
                </button>

            </p>
        </>
    )
}