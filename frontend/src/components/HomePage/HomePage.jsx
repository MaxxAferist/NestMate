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


export default function HomePage() {
    const navigate = useNavigate();
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { isFavorite, handleFavoriteClick, setFavorites} = useFavorites();
    const {user, flatPreferences, rentPreferences} = useContext(LoginContext);
    const {isInComparison, handleComparisonClick, setComparisonFlats} = useComparison();

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
                setComparisonFlats(data.apartments.comparison_list)
                setFavorites(data.apartments.favorites_list)
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
                    setIsMAI(false);
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
                    <div>
                            <FaArrowCircleRight className={s.iconButton} onClick={handleOnNextButtonClicked} style={flatMap.length !== 25 ? {color:'grey'} : null}/>
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
