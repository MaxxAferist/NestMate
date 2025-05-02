import {useContext, useState, createContext, useCallback, useEffect} from 'react';
import { LoginContext } from './LoginContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
    const { user} = useContext(LoginContext);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favoritesError, setFavoritesError] = useState(null);


    const loadFavorites = useCallback(async (userId) => {
        if (!userId) return;

        setLoading(true);
        setFavoritesError(null);
        try {
            const response = await fetch(`/api/favorites/${userId}`);
            if (!response.ok) {
                throw new Error('Ошибка при получении избранных квартир');
            }
            const data = await response.json();
            setFavorites(data.favorites || []);
        } catch (err) {
            setFavoritesError(err.message);
            console.error("Ошибка при получении избранных квартир:", err);
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
        console.log('addFavorite', flatId);
        if (!user?.id) return;

        setLoading(true);
        setFavoritesError(null);
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
                throw new Error('Ошибка при добавлении в избранное');
            }
            await loadFavorites(user.id);
        } catch (err) {
            setFavoritesError(err.message);
            console.error("Ошибка при добавлении в избранное:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (flatId) => {
        if (!user?.id) return;
        setLoading(true);
        setFavoritesError(null);
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
                throw new Error('Ошибка при удалении из избранного');
            }
            await loadFavorites(user.id);
        } catch (err) {
            setFavoritesError(err.message);
            console.error("Ошибка при удалении из избранного:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const isFavorite = (flatId) => {
        return favorites.some(f => f === flatId);
    };


    return(
        <FavoritesContext.Provider value={{
            favorites,
            loading,
            favoritesError,
            addFavorite,
            removeFavorite,
            isFavorite,
            /*loadFavorites*/
        }}
        >
            { children }
        </FavoritesContext.Provider>
    )
};

export const useFavorites = () => useContext(FavoritesContext);