import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import { LoginContext } from './LoginContext';

const ComparisonContext = createContext(null);

export const ComparisonProvider = ({ children }) => {
    const [comparisonFlats, setComparisonFlats] = useState([]);
    const { user} = useContext(LoginContext);
    const [loading, setLoading] = useState(false);

    /*const [comparisonFlats, setComparisonFlats] = useState(() => {
        const savedFlats = localStorage.getItem('comparisonFlats');
        return savedFlats ? JSON.parse(savedFlats) : [];
    });
*/

    /*const [comparisonError, setComparisonError] = useState(null);*/
   /* // сохранение в хранилище
    useEffect(() => {
        localStorage.setItem('comparisonFlats', JSON.stringify(comparisonFlats));
    }, [comparisonFlats]);

    // загрузка из хранилищя
    useEffect(() => {
        const savedFlats = localStorage.getItem('comparisonFlats');
        if (savedFlats) {
            setComparisonFlats(JSON.parse(savedFlats));
        }
    }, []); // только при первом рендере*/

    const loadComparison = useCallback(async (userId) => {
        if (!userId || loading) return;

        setLoading(true);

        try {
            const response = await fetch(`/api/comparison_list/${userId}`);
            if (!response.ok) {
                throw new Error('Ошибка при получении квартир в сравнении');
            }
            const data = await response.json();
            setComparisonFlats(data.comparison.comparison_list || []);
        } catch (err) {
            console.error("Ошибка при получении избранных квартир:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.id) {
            loadComparison(user.id);
        } else {
            setComparisonFlats([]);
            setLoading(false);
        }
    }, [user?.id]);


    const addToComparison = async (flatId) => {
        if (!user?.id || comparisonFlats.length >= 3 || loading) return;

        setLoading(true);

        try {
            const response = await fetch('/api/comparison/add', {
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
                throw new Error('Ошибка при добавлении в сравнение');
            }
            await loadComparison(user.id);
        } catch (err) {
            console.error("Ошибка при добавлении в сравнение:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

   /* const addToComparison = (flat) => {
        if (comparisonFlats.length >= 3) return; // не больше 3 квартир
        if (!comparisonFlats.some(f => f.id === flat.id)) {
            setComparisonFlats([...comparisonFlats, flat]);
        }
    };*/

    const removeFromComparison = async (flatId) => {
        if (!user?.id || loading) return;
        setLoading(true);

        try {
            const response = await fetch('/api/comparison/remove', {
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
                throw new Error('Ошибка при удалении из сравнения');
            }
            await loadComparison(user.id);
        } catch (err) {
            console.error("Ошибка при удалении из сравнения:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /*const removeFromComparison = (flatId) => {
        setComparisonFlats(comparisonFlats.filter(f => f.id !== flatId));
    };*/

    const clearComparison = () => {
        setComparisonFlats([]);
        /*localStorage.removeItem('comparisonFlats');*/
    };

    const isInComparison = (id) => {
        return comparisonFlats.some(f => f === id);
    }

    return (
        <ComparisonContext.Provider value={{
            comparisonFlats,
            addToComparison,
            removeFromComparison,
            clearComparison,
            isInComparison,
        }}>
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => useContext(ComparisonContext);