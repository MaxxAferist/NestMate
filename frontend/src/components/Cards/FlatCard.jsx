import s from './FlatCard.module.css';
import {useComparison} from "../contexts/ComparisonContext.jsx";
const FlatCard = ({ mark, flatData, cardClick, isFavorite, onFavoriteClick, isInComparison }) => {
    const { addToComparison, removeFromComparison } = useComparison();

    const getRoomsText = (rooms) => {
        if (rooms === 0) return 'Студия';
        if (rooms === 1) return '1-комнатная';
        return `${rooms}-комнатная`;
    };



    return (
        <div className={s.card}>
            <div className={s.imageContainer} onClick={cardClick}>
                <img
                    src={flatData.photos[0]}
                    alt="Квартира"
                    className={s.image}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                />
            </div>


            <div className={s.contentContainer}>
                <div className={s.contentBlock}>
                    <h3>О квартире</h3>
                    <div className={s.price}>
                        {Intl.NumberFormat('ru-RU').format(flatData.price)} ₽
                    </div>
                    <span>{getRoomsText(flatData.rooms)}, {flatData.area} м²</span>
                    <span style={{borderBottom: "none"}}>Этаж: {flatData.floor} из {flatData.buildingFloors}</span>
                </div>

                <div className={s.contentBlock} >
                    <h3>Расположение</h3>
                    <span>{flatData.city}, {flatData.district} район
                        , ул. {flatData.street}, д. {flatData.house}, кв. {flatData.apartment} </span>
                    {flatData.transportAccessibility.metroDistance &&
                        <span style={{borderBottom: "none"}}> До метро: {flatData.transportAccessibility.metroDistance} минут</span>
                    }

                </div>
                <div className={s.contentBlock}>
                    <h3>Оценка МАИ</h3>
                    <span>{mark} баллов</span>
                    <div className={s.markScale}>
                        <div className={s.fillScale} style={{ width: `${mark}%` }}>
                            {mark} %
                        </div>
                    </div>


                </div>

            </div>


            <div className={s.buttonsSection}>
                <button
                    className={s.favoriteButton}
                    onClick={ onFavoriteClick }
                    style={{ backgroundColor: isFavorite ? '#ff5d74' : '' }}
                >
                    {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
                <button className={s.compareButton}
                        onClick={ isInComparison ? () => removeFromComparison(flatData.id) : () => addToComparison(flatData) }
                        style={{ backgroundColor: isInComparison ? '#5dbcff' : '' }}
                >
                    {isInComparison ? 'Уже в сравнении' : 'Добавить в сравнение'}
                </button>
                <button className={s.detailsButton} onClick={cardClick}>
                    Подробнее
                </button>
            </div>
        </div>
    );
};

export default FlatCard;