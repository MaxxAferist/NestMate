import s from './FlatCard.module.css';
const FlatCard = ({ mark, flatData, cardClick, isFavorite,isInComparison, onFavoriteClick, onComparisonClick }) => {

    const getRoomsText = (rooms) => {
        if (rooms === 0 || rooms === "Студия") return 'Студия';
        if (rooms === 1) return '1-комнатная';
        return `${rooms}-комнатная`;
    };

    const metroDistance = flatData?.transportAccessibility?.metroDistance ?? flatData.metroDistance ?? null



    const formatAddress = () => {
        if(flatData.city && flatData.district && flatData.street && flatData.house && flatData.apartment){
            const address = `${flatData.city}, ${flatData.district} район
            , ул. ${flatData.street}, д. ${flatData.house}, кв. ${flatData.apartment}`
            return address;
        }else if(flatData.address){
            return flatData.address;
        }
    }


    return (
        <div className={s.card} >
            <div className={s.imageContainer} onClick={cardClick}>
                <img
                    src={flatData?.photos?.[0] ?? flatData?.picture}
                    alt="Квартира"
                    className={s.image}
                />
            </div>


            <div className={s.contentContainer}
                 style={mark === null ? {gridTemplateColumns: "1fr 1fr"} : {gridTemplateColumns: "1fr 1fr 1fr"}}
            >
                <div className={s.contentBlock}>
                    <h3>О квартире</h3>
                    <div className={s.price}>
                        {Intl.NumberFormat('ru-RU').format(flatData.price)} ₽
                    </div>
                    <span>{getRoomsText(flatData.rooms)}, {flatData.area} м²</span>
                    <span>Тип сделки: {flatData.type === 'sell' ? 'покупка' : 'аренда' }</span>
                    <span style={{borderBottom: "none"}}>Этаж: {flatData.floor} из {flatData.buildingFloors}</span>
                </div>

                <div className={s.contentBlock} >
                    <h3>Расположение</h3>
                    <span>{formatAddress()}</span>
                    {metroDistance &&
                        <span style={{borderBottom: "none"}}> До метро: {metroDistance} минут</span>
                    }

                </div>
                {mark &&
                    <div className={s.contentBlock}>
                        <h3>Оценка МАИ</h3>
                        <div className={s.markBlock}>{mark} %</div>
                        <div className={s.markScale}>
                            <div className={s.fillScale} style={{ width: `${mark}%` }}>
                                {mark} %
                            </div>
                        </div>
                    </div>
                }

            </div>


            <div className={s.buttonsSection}>
                <button
                    className={s.favoriteButton}
                    onClick={ onFavoriteClick }
                    style={isFavorite ? { backgroundColor: '#ff5e75', color: 'white', borderColor: '#e53e3e'} : null }
                >
                    {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
                <button className={s.compareButton}
                        onClick={ onComparisonClick}
                        style={isInComparison ? { backgroundColor: '#48b5ff', color: 'white', borderColor: '#3182ce' } : null }
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
/*{flatData.city}, {flatData.district} район
                        , ул. {flatData.street}, д. {flatData.house}, кв. {flatData.apartment} */

export default FlatCard;