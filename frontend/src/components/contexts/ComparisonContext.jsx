import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import { LoginContext } from './LoginContext';

const ComparisonContext = createContext(null);

export const ComparisonProvider = ({ children }) => {
    const [comparisonFlats, setComparisonFlats] = useState([]);
    const { user} = useContext(LoginContext);
    const [loading, setLoading] = useState(false);

    const handleComparisonClick = async (flatId, event) => {
        try {
            if(isInComparison(flatId)) {
                await removeFromComparison(flatId);
            } else {
                await addToComparison(flatId);
            }
        } catch(error) {
            console.error("Ошибка при изменении сравнения:", error);

            // Показываем сообщение только для ошибки лимита
            if (error.isComparisonLimitError && event) {
                const tooltip = document.createElement('div');
                tooltip.className = 'comparison-error-tooltip';
                tooltip.textContent = error.message;



                // возле курсора
                tooltip.style.position = 'fixed';
                tooltip.style.left = `${event.clientX + 10}px`;
                tooltip.style.top = `${event.clientY + 10}px`;
                tooltip.style.backgroundColor = '#fffce6';
                tooltip.style.padding = '8px 12px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                tooltip.style.zIndex = '9999';
                tooltip.style.color = '#bf5617';
                tooltip.style.border = '1px solid #ffcdd2';
                tooltip.style.maxWidth = '250px';

                document.body.appendChild(tooltip);

                setTimeout(() => {
                    tooltip.style.opacity = '0';
                    tooltip.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => tooltip.remove(), 300);
                }, 2000);
            }
        }
    }


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
        if (!user?.id || loading) return;
        if (comparisonFlats.length >= 4) {
            const error = new Error('Всего можно сравнивать до 4-х квартир!');
            error.isComparisonLimitError = true;
            throw error;
        }
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
            }else{
                setComparisonFlats([...comparisonFlats, flatId]);
            }
            /*await loadComparison(user.id);*/
        } catch (err) {
            console.error("Ошибка при добавлении в сравнение:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

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
            }else{
                setComparisonFlats(comparisonFlats.filter(f => f !== flatId));
            }
            /*await loadComparison(user.id);*/
        } catch (err) {
            console.error("Ошибка при удалении из сравнения:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    const clearComparison = async () => {
        if (!user?.id || loading) return;
        setLoading(true);
        try {
            const response = await fetch('/api/comparison/clear', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при очистки сравнения');
            }
            await loadComparison(user.id);
        } catch (err) {
            console.error("Ошибка при очистки сравнения:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }

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
            handleComparisonClick
        }}>
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => useContext(ComparisonContext);