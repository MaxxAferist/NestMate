import { createContext, useState, useEffect, useCallback } from 'react'

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const [userData, setUserData] = useState({
        id: '',
        firstName: "",
        lastName: '',
        middleName: '',
        email: '',
        phone: '',
        gender: '',
    });

    const [flatPreferences, setFlatPreferences] = useState({
        budgetMin: '',
        budgetMax: '',
        areaMin: '',
        areaMax: '',
        region: '',
        city: '',
        district: '',
        roomCount: [],
        balconyType: 'неважно',
        ceilingHeight: '',
        mortgage: 'неважно',
        minFloor: '',
        maxFloor: '',
        floorsInBuildingMin: '',
        floorsInBuildingMax: '',
        houseMaterial: [],
        renovationCondition: 'неважно',
        amenities: [],
        kitchenStove: 'неважно',
        viewFromWindows: [],
        parking: {
            countMin: '',
            type: 'неважно',
            payment: 'неважно',
        },
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
            cityCenterDistance: '',
            metroTransportTime: '',
        },
        priorities: {
            budget: 3,
            area: 3,
            roomCount: 3,
            balconyType: 3,
            ceilingHeight: 3,
            mortgage: 3,
            floor: 3,
            floorsInBuilding: 3,
            houseMaterial: 3,
            renovationCondition: 3,
            amenities: 3,
            kitchenStove: 3,
            viewFromWindows: 3,
            parking: 3,
            infrastructure: 3,
            transportAccessibility: 3
        }
    });
    const [rentPreferences, setRentPreferences] = useState({
        rentPeriod: "неважно",
        petsAllowed: false,
        childrenAllowed: false,
        immediateMoveIn: false,
        numberOfBeds: '',
        priorities: {
            rentPeriod: 3,
            petsAllowed: 3,
            childrenAllowed: 3,
            immediateMoveIn: 3,
            numberOfBeds: 3
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadUserData = useCallback(async (userId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/getUserData/${userId}`);
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных пользователя');
            }
            const data = await response.json();
            setUserData(data.user);
        } catch (err) {
            setError(err.message);
            console.error("Ошибка загрузки данных пользователя:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadPreferences = useCallback(async (userId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/getPreferences/${userId}`);
            if (!response.ok) {
                throw new Error('Ошибка загрузки параметров');
            }
            const data = await response.json();
            if (data.flatPreferences) {
                setFlatPreferences(data.flatPreferences);
            }
            if (data.rentPreferences) {
                setRentPreferences(data.rentPreferences);
            }
        } catch (err) {
            setError(err.message);
            console.error("Ошибка загрузки параметров:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        const storedUser = localStorage.getItem("user"); /*получить данные, сохранённые*/
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser); /*преобразует строку обратно в объект JavaScript*/
            setUser(parsedUser);
            loadUserData(parsedUser.id);
            loadPreferences(parsedUser.id);
        }
    }, [loadUserData, loadPreferences]);

    const saveUserData = async (newData) => {
        setIsLoading(true);
        setError(null);
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

            setUserData(prev => ({ ...prev, ...newData })); // Обновление локальных данных
        } catch (err) {
            setError(err.message);
            console.error("Ошибка обновления данных пользователя:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async(userData) => {
        try{
            const response = await fetch('/api/signIn',{  /*адрес отправки*/
                method: 'POST', /*метод*/
                headers: {  /*информация о запросе*/
                    'Content-Type': 'application/json', /*формат тела запроса*/
                }, /*данные, которые отправляются*/
                body: JSON.stringify(userData), /*тело запроса */
            });
            if(!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка регистрации');
            }

            const data = await response.json();
            setUser(data.user);
            return data;
        }catch(err){
            console.error("Ошибка регистрации", err);
            throw err;
        }
    }

    const login = async (userData) =>{
        try{
            const response = await fetch('/api/logIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка авторизации');
            }

            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));

            await loadUserData(data.user.id);
            await loadPreferences(data.user.id);
            return data;
        }catch(e){
            console.error("Ошибка авторизации", e)
            throw e;
        }
    }

    const savePreferences = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/savePreferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    flatPreferences: flatPreferences,
                    rentPreferences: rentPreferences
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при сохранении параметров');
            }
        } catch (err) {
            setError(err.message);
            console.error("Ошибка сохранения параметров:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setUserData({
            id: ' ',
            firstName: " ",
            lastName: ' ',
            middleName: ' ',
            email: ' ',
            phone: ' ',
            gender: ' ',
        });
        setFlatPreferences({
            budgetMin: '',
            budgetMax: '',
            region: '',
            city: '',
            district: '',
            roomCount: [],
            balconyType: 'неважно',
            ceilingHeight: '',
            mortgage: 'неважно',
            minFloor: '',
            maxFloor: '',
            floorsInBuildingMin: '',
            floorsInBuildingMax: '',
            houseMaterial: [],
            renovationCondition: 'неважно',
            amenities: [],
            kitchenStove: 'неважно',
            viewFromWindows: [],
            parking: {
                countMin: '',
                type: 'неважно',
                payment: 'неважно',
            },
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
                cityCenterDistance: '',
                metroTransportTime: '',
            },
            priorities: {
                budget: 3,
                roomCount: 3,
                balconyType: 3,
                ceilingHeight: 3,
                mortgage: 3,
                floor: 3,
                floorsInBuilding: 3,
                houseMaterial: 3,
                renovationCondition: 3,
                amenities: 3,
                kitchenStove: 3,
                viewFromWindows: 3,
                parking: 3,
                infrastructure: 3,
                transportAccessibility: 3
            }
        });
        setRentPreferences({
            rentPeriod: "неважно",
            petsAllowed: false,
            childrenAllowed: false,
            immediateMoveIn: false,
            numberOfBeds: '',
            priorities: {
                rentPeriod: 3,
                petsAllowed: 3,
                childrenAllowed: 3,
                immediateMoveIn: 3,
                numberOfBeds: 3
            }
        });
        localStorage.removeItem("user");
    };

    return(
        <LoginContext.Provider value={{
            user,
            loadUserData,
            userData,
            setUserData,
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
            error,
        }}
        >
            { children }
        </LoginContext.Provider>
    );
}