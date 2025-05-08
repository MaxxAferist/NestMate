import s from './FlatCard.module.css';
import { FavoriteButton, ComparisonButton, DetailsButton} from "../commonElements/buttons.jsx";

const FlatCard = ({ mark, flatData, cardClick, isFavorite,isInComparison,
                      onFavoriteClick, onComparisonClick,
                      showButtonsSection = true,
                      isFixed = true,
                  }) => {

    const getRoomsText = (rooms) => {
        if (rooms === 0 || rooms === "Студия") return 'Студия';
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


            <div className={s.infoContainer}
                 style={mark === null ? {gridTemplateColumns: "1fr 1fr"} : {gridTemplateColumns: "1fr 1fr 1fr"}}
            >
                <div className={s.infoBlock}>
                    <h3>О квартире</h3>
                    <div className={s.price}>
                        {Intl.NumberFormat('ru-RU').format(flatData.price)} ₽ {/*русский формат вывода*/}
                    </div>
                    <span>{getRoomsText(flatData.rooms)}, {flatData.area} м²</span>
                    <span>Тип сделки: {flatData.type === 'sell' ? 'покупка' : 'аренда' }</span>
                    <span style={{borderBottom: "none"}}>Этаж: {flatData.floor} из {flatData.buildingFloors}</span>
                </div>

                <div className={s.infoBlock} >
                    <h3>Расположение</h3>
                    <span>{formatAddress()}</span>
                    {metroDistance &&
                        <span style={{borderBottom: "none"}}> До метро: {metroDistance} минут</span>
                    }

                </div>
                {mark &&
                    <div className={s.infoBlock}>
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


            {showButtonsSection && (
                <div className={s.buttonsSection} style={isFixed ? {minWidth: "200px"} : {minWidth: '100px', maxWidth: '200px'} }>
                    <FavoriteButton onFavoriteClick={ onFavoriteClick } isFavorite={isFavorite} />
                    <ComparisonButton onComparisonClick={onComparisonClick} isInComparison={isInComparison} />
                    <DetailsButton cardClick={cardClick} />
                </div>
            )}
        </div>
    );
};

export default FlatCard;