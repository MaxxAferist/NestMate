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
            /*для всплывающего окна подсказки*/
            if (error.isComparisonLimitError && event) {
                const window = document.createElement('div'); /*объект div*/
                /*document - страница*/
                window.textContent = error.message; /*текст*/



                // возле курсора
                window.style.position = 'fixed';
                window.style.left = `${event.clientX + 10}px`; // правее курсора
                window.style.top = `${event.clientY + 10}px`; // ниже
                window.style.backgroundColor = '#fffce6';
                window.style.padding = '8px 12px';
                window.style.borderRadius = '4px';
                window.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                window.style.zIndex = '9999'; // над всеми элементами
                window.style.color = '#bf5617';
                window.style.border = '1px solid #ffcdd2';
                window.style.maxWidth = '250px';

                document.body.appendChild(window); /*добавляет объект*/

                setTimeout(() => { /*удаляет через 2 секунды */
                    window.style.opacity = '0'; // плавное удаление
                    window.style.transition = 'opacity 0.3s ease'; // анимация дляпрозрачности
                    setTimeout(() => window.remove(), 300); // удаление
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
                const errorMessage = await response.json();
                throw new Error(`Ошибка при получении квартир в сравнении: ${errorMessage.message}`);
            }
            const data = await response.json();
            setComparisonFlats(data.comparison.comparison_list || []);
        } catch (err) {
            console.error(err);
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
                const errorMessage = await response.json();
                throw new Error(`Ошибка при добавлении в сравнение: ${errorMessage.message}`);
            }else{
                setComparisonFlats([...comparisonFlats, flatId]);
            }
        } catch (err) {
            console.error(err);
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
                const errorMessage = await response.json();
                throw new Error(`Ошибка при удалении из сравнения ${errorMessage.message}`);
            }else{
                setComparisonFlats(comparisonFlats.filter(f => f !== flatId));
            }
        } catch (err) {
            console.error(err);
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
                const errorMessage = await response.json();
                throw new Error(`Ошибка при очистки сравнения: ${errorMessage.message}`);
            }else{
                setComparisonFlats([])
            }
        } catch (err) {
            console.error(err);
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
            setComparisonFlats,
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