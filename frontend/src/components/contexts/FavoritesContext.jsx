import {useContext, useState, createContext, useCallback, useEffect} from 'react';
import { LoginContext } from './LoginContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
    const { user} = useContext(LoginContext);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);


    const loadFavorites = useCallback(async (userId) => {
        if (!userId || loading) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/favorites_list/${userId}`);
            if (!response.ok) {
                throw new Error(`Ошибка при получении избранных квартир ${response?.message}`);
            }
            const data = await response.json();
            setFavorites(data.favorites.favorites_list || []);
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.id) {
            loadFavorites(user.id);
        } else {
            setFavorites([]);
            setLoading(false);
        }
    }, [user?.id]);



    const addFavorite = async (flatId) => {
        if (!user?.id || loading) return;

        setLoading(true);
        try {
            const response = await fetch('/api/favorites/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    flat_id: flatId,
                }),
            });
            if (!response.ok) {
                throw new Error(`Ошибка при добавлении в избранное: ${response?.message}`);
            }else{
                setFavorites(prev => [...prev, flatId]);
            }
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (flatId) => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await fetch('/api/favorites/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    flat_id: flatId
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при удалении из избранного ${response?.message}`);
            }else{
                setFavorites(favorites.filter(f => f !== flatId));
            }
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearFavorites = async () => {
        if (!user?.id || loading) return;
        setLoading(true);
        try {
            const response = await fetch('/api/favorites/clear', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при очистки избранного: ${response?.message}`);
            }else{
                setFavorites([])
            }
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const isFavorite = (flatId) => {
        return favorites.some(f => f === flatId);
    };

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

    return(
        <FavoritesContext.Provider value={{
            favorites,
            setFavorites,
            loading,
            addFavorite,
            removeFavorite,
            isFavorite,
            handleFavoriteClick,
            clearFavorites
        }}
        >
            { children }
        </FavoritesContext.Provider>
    )
};

export const useFavorites = () => useContext(FavoritesContext);