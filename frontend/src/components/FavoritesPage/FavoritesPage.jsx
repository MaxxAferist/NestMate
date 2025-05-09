import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FlatCard from '../Cards/FlatCard';
import {LoginContext} from "../contexts/LoginContext.jsx";
import {useComparison} from "../contexts/ComparisonContext.jsx";
import s from './FavoritesPage.module.css';
import {useFavorites} from "../contexts/FavoritesContext.jsx";
import {FaTrash} from "react-icons/fa";
import {LoadingText, ErrorText, EmptyText} from "../commonElements/fields.jsx";
import { NextPrevButton } from "../commonElements/buttons.jsx";

const FavoritesPage = () => {
    const [flats, setFlats] = useState([]);
    const [filteredFlats, setFilteredFlats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const {user} = useContext(LoginContext);
    const { isFavorite, handleFavoriteClick, clearFavorites, setFavorites } = useFavorites();
    const navigate = useNavigate();
    const {isInComparison, handleComparisonClick} = useComparison();

    const [currentStartIndex, setCurrentStartIndex] = useState(0);




    useEffect(() => {
        if(user && user.id) {
            const fetchFavorites = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/favorites/${user.id}`);
                    const data = await response.json();
                    console.log(data);
                    if (data.status === 'success') {
                        if(data.message === 'User do not have favorites apartments') {
                            setFlats([]);
                            setFilteredFlats([]);
                            setFavorites([])
                        }else{
                            setFlats(data.favorites.apartments || []);
                            setFilteredFlats(data.favorites.apartments || []);
                            setFilteredFlats(data.favorites.favorites_list || []);
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

    const handleClearFavorites = () => {
        setFlats([]);
        setFilteredFlats([]);
        clearFavorites();
        setCurrentStartIndex(0);
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
    const handleOnToFirstButtonClicked = ()=>{
        if(currentStartIndex !== 0){
           setCurrentStartIndex(0)
        }
    }


    if(!user){
        return(
            <EmptyText>
                Чтобы добавлять квартиры в избранной войдите в аккаунт.
            </EmptyText>
        );
    }

    if (loading) {
        return (<LoadingText/>);
    }

    if (flats.length === 0) {
        return (
            <EmptyText>
                В списке ещё нет избранных квартир.
            </EmptyText>
        );
    }

    if (error) {
        return (
            <ErrorText>
                Ошибка: {error}
            </ErrorText>
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
                <button className={s.clearButton} onClick={handleClearFavorites}>
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
                    {filteredFlats.slice(currentStartIndex, ((filteredFlats.length - currentStartIndex-25) > 0)?(currentStartIndex+25) : (filteredFlats.length)).map((flatData) => (
                        <FlatCard
                            key={flatData.id}
                            mark={null}
                            flatData={flatData}
                            isFavorite={isFavorite(flatData.id)}
                            onFavoriteClick={() => handleFavoriteClick(flatData.id)}
                            isInComparison={isInComparison(flatData.id)}
                            onComparisonClick={(e) => handleComparisonClick(flatData.id, e)}
                            cardClick={() => navigate(`/FlatPage/${flatData.id}`, { state: { flat_id: flatData.id } })}
                        />

                    ))}
                    <div className={s.cardsContainerFooter}>
                        <div className={s.nextPrevButtonsSection}>
                            <NextPrevButton handleOnButtonClicked={handleOnPrevButtonClicked}
                                            disable={currentStartIndex === 0} isNext={false}
                            />
                            <NextPrevButton handleOnButtonClicked={handleOnToFirstButtonClicked} isToFirst={true}
                                            disable={currentStartIndex === 0}
                            />
                            <NextPrevButton handleOnButtonClicked={handleOnNextButtonClicked}
                                            disable={(filteredFlats.length - currentStartIndex - 25) <= 0} isNext={true}
                            />
                        </div>
                    </div>
                </div>
            ):(
                <EmptyText>
                   Нет избранных квартир.
                </EmptyText>
            )}

        </div>
    );
};

export default FavoritesPage;