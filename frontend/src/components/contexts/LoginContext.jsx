import {createContext, useState, useEffect, useCallback} from 'react'

export const LoginContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
});

export const LoginProvider = ({ children }) => {
    const [user, setUser] = useState(() => { //основные данные пользователя
        try {
            const storedUser = localStorage.getItem("user"); //загрузка из хранилища
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Ошибка загрузки из хранилища", error);
            return null;
        }
    });


    function getDefaultFlatPreferences() { //парамтры для покупки
        return {
            budgetMin: '',
            budgetMax: '',
            areaMin: '',
            areaMax: '',
            region: 'Санкт-Петербург',
            city: 'Санкт-Петербург',
            district: 'неважно',
            roomCount: [],
            apartmentType: 'неважно',
            balconyType: 'неважно',
            ceilingHeight: 'неважно',
            minFloor: '',
            maxFloor: '',
            floorsInBuildingMin: '',
            floorsInBuildingMax: '',
            houseMaterial: [],
            renovationCondition: 'неважно',
            amenities: [],
            kitchenStove: 'неважно',
            infrastructure: {
                parks: '',
                hospitals: '',
                shoppingCenters: '',
                shops: '',
                schools: '',
                kindergartens: '',
            },
            transportAccessibility: {
                publicTransportStops: '',
                metroDistance: '',
            },
            comparisonMatrix: {
                matrix: {},
                columnsOrder: []
            },
            priorities: {}
        };
    }

    function getDefaultRentPreferences() { //параметры для аренды
        return {
            rentPayment: {
                rentPriceMin: '',
                rentPriceMax: '',
                rentPeriod: "неважно",
            },
            rentalTerms: {
                petsAllowed: false,
                childrenAllowed: false,
                smokingAllowed: false,
            },
            numberOfBeds: '',
            comparisonMatrix: {
                matrix: {},
                columnsOrder: []
            },
            priorities: {}
        };
    }

    const [flatPreferences, setFlatPreferences] = useState(getDefaultFlatPreferences);
    const [rentPreferences, setRentPreferences] = useState(getDefaultRentPreferences);

    const [isLoading, setIsLoading] = useState(false);  // состояние загрузки
    /*const [error, setError] = useState(null); // ошибки*/

    //useCallback - возвращает один и тот же экземпляр функции между рендерами, пока не изменятся указанные зависимости.
    const loadAllUserData = useCallback(async (userId) => { // загрузка данных пользователя
        if (!userId || isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/api/getAllUserData/${userId}`); // апи запрос
            const data = await response.json();

            if (!response.ok) {
                if(data.message  === 'User not found'){
                    logout();
                    throw {
                        message: data.message || 'Ошибка загрузки данных',
                        status: response.status
                    };
                }else{
                    throw new Error('Ошибка загрузки данных пользователя: '+data.message);
                }

            }

            if (data.user) {
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            if (data.flatPreferences) {
                setFlatPreferences(data.flatPreferences);
            }

            if (data.rentPreferences) {
                setRentPreferences(data.rentPreferences);
            }
        } catch (err) {
            console.error("Ошибка загрузки данных пользователя:", err.message);
            throw new Error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);


    //для загрузки данных из хранилища при открытии сайта
    useEffect(() => {
        const loadUserSession  = async () => {
            const storedUser = localStorage.getItem("user"); // загрузка из хранилища
            if (!storedUser) return; //если нет юзера
            const parsedUser = JSON.parse(storedUser); //преобразование в json
            if (!parsedUser?.id) return; //ошибка загрузки из хранилища

            if (parsedUser?.id) {
                await loadAllUserData(parsedUser.id); // загрузка полных данных
            }
        };
        loadUserSession ().catch((error) => {
            console.error("Ошибка загрузки данных:", error);
        });

        //loadUserSession();
    }, []);

    // сохранение личных данных
    const saveUserData = async (newData) => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/saveUserData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user.id,
                    ...newData
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка обновления данных пользователя');
            }
            await loadAllUserData(user.id); // загрузка актуальных данных
        } catch (err) {
            console.error("Ошибка обновления данных пользователя:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // регистрация
    const register = async (registrationData) => {
        try {
            const initialUserData = {
                ...registrationData, // email password firstName
                lastName: '',
                gender: '',
                flatPreferences: getDefaultFlatPreferences(),
                rentPreferences: getDefaultRentPreferences()
            };

            const response = await fetch('/api/signIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(initialUserData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    message: data.message || 'Ошибка регистрации',
                    status: response.status
                };
            }


            if (data.user_id) {
                await loadAllUserData(data.user_id); // загрузка актуальных данных
            }
            return data; // сообщение для страницы регистрации
        } catch (err) {
            console.error("Ошибка регистрации", err);
            throw err;
        }
    }

    // авторизация
    const login = async (userData) => {
        try {
            const response = await fetch('/api/logIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if(!response.ok) {
                throw {
                    message: data.message || 'Ошибка входа',
                    status: response.status
                };
            }
            if (data.user_id) {
                await loadAllUserData(data.user_id);
            }
            return data; // сообщение для страницы авторизации
        } catch(e) {
            console.error("Ошибка авторизации", e)
            throw e;
        }
    }

    // сохранение параметров подбора квартиры
    const savePreferences = async (flatPreferencesToSave, rentPreferencesToSave) => {
        if (!user?.id || isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/savePreferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    flatPreferences: flatPreferencesToSave || flatPreferences,
                    rentPreferences: rentPreferencesToSave || rentPreferences
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при сохранении параметров');
            }
            await loadAllUserData(user.id);
        } catch (err) {
            console.error("Ошибка сохранения параметров:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setFlatPreferences(null);
        setRentPreferences(null);
        localStorage.removeItem("user");
    };

    return(
        <LoginContext.Provider value={{
            user,
            userData: user,
            loadUserData:loadAllUserData,
            setUserData:setUser,
            saveUserData,
            flatPreferences,
            setFlatPreferences,
            rentPreferences,
            setRentPreferences,
            savePreferences,
            register,
            login,
            logout,
            isLoading,
        }}
        >
            { children }
        </LoginContext.Provider>
    );
}

