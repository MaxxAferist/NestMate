import { createContext, useContext, useEffect, useState } from 'react';

const ComparisonContext = createContext(null);

export const ComparisonProvider = ({ children }) => {
    //const [comparisonFlats, setComparisonFlats] = useState(JSON.parse(localStorage.getItem('comparisonFlats')) || []);
    const [comparisonFlats, setComparisonFlats] = useState(() => {
        const savedFlats = localStorage.getItem('comparisonFlats');
        return savedFlats ? JSON.parse(savedFlats) : [];
    });

    // сохранение в хранилище
    useEffect(() => {
        localStorage.setItem('comparisonFlats', JSON.stringify(comparisonFlats));
    }, [comparisonFlats]);

    // загрузка из хранилищя
    useEffect(() => {
        const savedFlats = localStorage.getItem('comparisonFlats');
        if (savedFlats) {
            setComparisonFlats(JSON.parse(savedFlats));
        }
    }, []); // только при первом рендере


    const addToComparison = (flat) => {
        if (comparisonFlats.length >= 3) return; // не больше 3 квартир
        if (!comparisonFlats.some(f => f.id === flat.id)) {
            setComparisonFlats([...comparisonFlats, flat]);
        }
    };

    const removeFromComparison = (flatId) => {
        setComparisonFlats(comparisonFlats.filter(f => f.id !== flatId));
    };

    const clearComparison = () => {
        setComparisonFlats([]);
    };

    const isInComparison = (id) => {
        return comparisonFlats.some(f => f.id === id);
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