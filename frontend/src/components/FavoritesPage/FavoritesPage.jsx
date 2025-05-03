import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FlatCard from '../Cards/FlatCard';
import {LoginContext} from "../contexts/LoginContext.jsx";
import {useComparison} from "../contexts/ComparisonContext.jsx";
import s from './FavoritesPage.module.css';
import {useFavorites} from "../contexts/FavoritesContext.jsx";
import {FaTrash} from "react-icons/fa";

const FavoritesPage = ({ userId }) => {
    const [flats, setFlats] = useState([]);
    const [filteredFlats, setFilteredFlats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const {user} = useContext(LoginContext);
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const navigate = useNavigate();
    const {isInComparison, handleComparisonClick} = useComparison();

    const [currentStartIndex, setCurrentStartIndex] = useState(0);




    useEffect(() => {
        if(user && user.id) {
            const fetchFavorites = async () => {
                try {
                    const response = await fetch(`/api/favorites/${user.id}`);
                    const data = await response.json();
                    if (data.status === 'success') {
                        if(data.message === 'User do not have favorites apartments') {
                            setFlats([]);
                            setFilteredFlats([]);
                            // установить избранные квартиры
                        }else{
                            setFlats(data.favorites.apartments || []);
                            setFilteredFlats(data.favorites.apartments || []);
                            // установить избранные квартиры
                        }
                    } else {
                        setError(data.message || 'Ошибка загрузки избранных квартир');
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchFavorites();
        }
    }, []);

    const handleFavoriteClick = async (flatId) => {
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

    useEffect(() => {
        if (filterType === 'all') {
            setFilteredFlats(flats);
        } else {
            setFilteredFlats(flats.filter(flat => flat.type === filterType));
        }
    }, [filterType, flats]);

    const handleFilterChange = (type) => {
        setFilterType(type);
        setCurrentStartIndex(0);
    };

    const clearFavorites = () => {
        setFlats([]);
        setFilteredFlats([]);
        setCurrentStartIndex(0);
        // Здесь логика очистки на сервере
    };

    const handleOnNextButtonClicked = ()=>{
        if((filteredFlats.length - currentStartIndex - 25) > 0){
            setCurrentStartIndex(currentStartIndex + 25);
        }
    }
    const handleOnPrevButtonClicked = ()=>{
        if(currentStartIndex >= 25){
            setCurrentStartIndex(currentStartIndex - 25);
        }
    }

    if (loading) {
        return (
            <div className={s.mainContainer}>
                <div className={s.loading}>Загрузка...</div>
            </div>
            );
    }

    if (error) {
        return (
            <div className={s.mainContainer}>
                <div className={s.error}>Ошибка: {error}</div>
            </div>
            );
    }

    if (flats.length === 0) {
        return (
            <div className={s.mainContainer}>
                <div className={s.empty}>В списке ещё нет избранных квартир.</div>
            </div>
        );
    }

    return (
        <div className={s.mainContainer}>
            <div className={s.filterPanel}>
                <div className={s.filterOptions}>
                    <label className={`${s.filterLabel} ${filterType === 'all' ? s.checked : ''}`}>
                        <input
                            className={s.radioButton}
                            type="radio"
                            name="filter"
                            checked={filterType === 'all'}
                            onChange={() => handleFilterChange('all')}
                        />
                        <span className={s.radioLabel}>Все</span>
                    </label>
                    <label className={`${s.filterLabel} ${filterType === 'rent' ? s.checked : ''}`}>
                        <input
                            className={s.radioButton}
                            type="radio"
                            name="filter"
                            checked={filterType === 'rent'}
                            onChange={() => handleFilterChange('rent')}
                        />
                        <span className={s.radioLabel}>Аренда</span>
                    </label>
                    <label className={`${s.filterLabel} ${filterType === 'sell' ? s.checked : ''}`}>
                        <input
                            className={s.radioButton}
                            type="radio"
                            name="filter"
                            checked={filterType === 'sell'}
                            onChange={() => handleFilterChange('sell')}
                        />
                        <span className={s.radioLabel}>Покупка</span>
                    </label>
                </div>
                <button className={s.clearButton} onClick={clearFavorites}>
                    <FaTrash /> Очистить избранное
                </button>
            </div>
            {filteredFlats.length > 0 ? (
                <div className={s.cardsContainer}>
                    <div className={s.cardsContainerHeader}>
                        <h2>
                            Избранные квартиры:
                        </h2>
                    </div>
                    {filteredFlats.slice(currentStartIndex, ((filteredFlats.length - currentStartIndex-25) > 0)?(currentStartIndex+25) : filteredFlats.length-currentStartIndex).map((flatData) => (
                        <FlatCard
                            key={flatData.id}
                            mark={null}
                            flatData={flatData}
                            isFavorite={isFavorite(flatData.id)}
                            onFavoriteClick={() => handleFavoriteClick(flatData.id)}
                            isInComparison={isInComparison(flatData.id)}
                            onComparisonClick={(e) => handleComparisonClick(flatData.id, e)}
                            cardClick={() => navigate(`/FlatPage/${flatData.id}`, { state: { flatData: flatData } })}
                        />

                    ))}
                    <div className={s.cardsContainerFooter}>
                        <div className={s.nextPrevButtonsSection}>
                            <button className={s.nextPrevButtons} onClick={handleOnPrevButtonClicked} disabled={currentStartIndex === 0}>
                                ← Предыдущие квартиры
                            </button>
                            <button className={s.nextPrevButtons} onClick={handleOnNextButtonClicked} disabled={(filteredFlats.length - currentStartIndex - 25) <= 0 }>
                                Следующие квартиры →
                            </button>
                        </div>
                    </div>
                </div>
            ):(
                <div className={s.empty}>Нет избранных квартир</div>
            )}

        </div>
    );
};

export default FavoritesPage;