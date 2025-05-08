import s from './buttons.module.css';

export const FavoriteButton = ({ isFavorite, onFavoriteClick}) => {
    return (
        <button
            className={s.favoriteButton}
            onClick={onFavoriteClick}
            style={isFavorite ? {backgroundColor: '#ff5e75', color: 'white', borderColor: '#e53e3e'} : undefined}
        >
            {isFavorite ? '♥ В избранном' : '♥ В избранное'}
        </button>
    );
};

export const ComparisonButton = ({ isInComparison, onComparisonClick }) => {
    return (
        <button className={s.compareButton}
                onClick={ onComparisonClick}
                style={isInComparison ? { backgroundColor: '#48b5ff', color: 'white', borderColor: '#3182ce' } : null }
        >
            {isInComparison ? '⇄ Уже в сравнении' : '⇄ Добавить в сравнение'}
        </button>
    )
}

export const DetailsButton = ({ cardClick }) => {
    return (
        <button className={s.detailsButton} onClick={cardClick}>
            Подробнее
        </button>
    )
}

export const NextPrevButton = ({ handleOnButtonClicked, disable = null, isNext, isToFirst = false }) => {
    return (
        <button className={s.nextPrevButtons} onClick={handleOnButtonClicked} disabled={disable}>
            {isToFirst ? 'На первую страницу' :
                isNext ? 'Следующие 25 квартир →' : '← Предыдущие 25 квартир'}
        </button>
    )
}