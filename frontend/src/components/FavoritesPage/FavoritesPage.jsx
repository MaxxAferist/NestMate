import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FlatCard from '../Cards/FlatCard';
import {LoginContext} from "../contexts/LoginContext.jsx";
import {useComparison} from "../contexts/ComparisonContext.jsx";
import s from './FavoritesPage.module.css';
import {useFavorites} from "../contexts/FavoritesContext.jsx";

const FavoritesPage = ({ userId }) => {
    const [flats, setFlats] = useState([]);
    const [filteredFlats, setFilteredFlats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const {user} = useContext(LoginContext);
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const navigate = useNavigate();
    const {comparisonFlats} = useComparison();



    useEffect(() => {
        if(user && user.id) {
            const fetchFavorites = async () => {
                try {
                    const response = await fetch(`/api/favorites/${user.id}`);
                    const data = await response.json();
                    if (data.status === 'success') {
                        setFlats(data.favorites.apartments || []);
                        setFilteredFlats(data.favorites.apartments || []);
                        // установить избранные квартиры
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
    };

    const clearFavorites = () => {
        setFlats([]);
        setFilteredFlats([]);
        // Здесь должна быть логика очистки на сервере
    };

    if (loading) {
        return <div className={s.loading}>Загрузка...</div>;
    }

    if (error) {
        return <div className={s.error}>Ошибка: {error}</div>;
    }

    if (flats.length === 0) {
        return <div className={s.empty}>Нет избранных квартир</div>;
    }

    return (
        <div className={s.mainContainer}>
            <div className={s.filterPanel}>
                <div className={s.filterOptions}>
                    <label className={s.filterLabel}>
                        <input
                            type="radio"
                            name="filter"
                            checked={filterType === 'all'}
                            onChange={() => handleFilterChange('all')}
                        />
                        Все
                    </label>
                    <label className={s.filterLabel}>
                        <input
                            type="radio"
                            name="filter"
                            checked={filterType === 'rent'}
                            onChange={() => handleFilterChange('rent')}
                        />
                        Аренда
                    </label>
                    <label className={s.filterLabel}>
                        <input
                            type="radio"
                            name="filter"
                            checked={filterType === 'sell'}
                            onChange={() => handleFilterChange('sell')}
                        />
                        Покупка
                    </label>
                </div>
                <button className={s.clearButton} onClick={clearFavorites}>
                    Очистить избранное
                </button>
            </div>
            {filteredFlats.length > 0 ? (
                <div className={s.cardsContainer}>
                    <div className={s.cardsContainerHeader}>
                        <h2>
                            Избранные квартиры:
                        </h2>
                    </div>
                    {filteredFlats.map((flat) => (
                        <FlatCard
                            key={flat.id}
                            mark={null}
                            flatData={flat}
                            isFavorite={isFavorite(flat.id)}
                            onFavoriteClick={() => handleFavoriteClick(flat.id)}
                            isInComparison={comparisonFlats.some(f => f.id === flat.id)} // Можно добавить логику сравнения
                            cardClick={() => navigate(`/FlatPage/${flat.id}`, { state: { flatData: flat } })}
                        />
                    ))}
                </div>
            ):(
                <div className={s.empty}>Нет избранных квартир</div>
            )}

        </div>
    );
};

export default FavoritesPage;