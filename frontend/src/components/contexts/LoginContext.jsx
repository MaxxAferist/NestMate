import { createContext, useState, useEffect, useCallback } from 'react'

export const LoginContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
});

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
        budgetMin: '', //бюджет
        budgetMax: '',
        areaMin: '', //площадь
        areaMax: '',
        region: '', // регион
        city: '', // город
        district: '', // район
        roomCount: [], // кол-во комнат
        apartmentType: 'неважно', // тип квартиры (вторичка/новостройка)
        balconyType: 'неважно', // балкон/лоджия
        ceilingHeight: '', // высота потолков
        minFloor: '', // этаж
        maxFloor: '',
        floorsInBuildingMin: '', // этажей в доме
        floorsInBuildingMax: '',
        houseMaterial: [], // материал дома
        renovationCondition: 'неважно', // состояние ремонта
        amenities: [], // удобства
        kitchenStove: 'неважно', // тип кухонной плиты
        viewFromWindows: [], // вид из окон
        infrastructure: { // инфраструктура района
            parks: '',
            hospitals: '',
            shoppingCenters: '',
            shops: '',
            schools: '',
            kindergartens: '',
        },
        transportAccessibility: { // транспортная доступность
            publicTransportStops: '',
            metroDistance: '',
            metroTransportTime: '',
        },
        comparisonMatrix: (() => {
            const params = [
                'budget', 'area', 'roomCount', 'apartmentType', 'balconyType',
                'ceilingHeight', 'floor', 'floorsInBuilding', 'houseMaterial',
                'renovationCondition', 'amenities',
                'infrastructure', 'transportAccessibility'
            ];
            const matrix = {};
            params.forEach(param1 => {
                matrix[param1] = {};
                params.forEach(param2 => {
                    matrix[param1][param2] = 1;
                });
            });
            return matrix;
        })(),
        priorities: {
            budget: 1/13,
            area: 1/13,
            roomCount: 1/13,
            apartmentType: 1/13,
            balconyType: 1/13,
            ceilingHeight: 1/13,
            floor: 1/13,
            floorsInBuilding: 1/13,
            houseMaterial: 1/13,
            renovationCondition: 1/13,
            amenities: 1/13,
            infrastructure: 1/13,
            transportAccessibility: 1/13
        }
    });
    const [rentPreferences, setRentPreferences] = useState({
        rentPayment: { // условия аренды
            rentPriceMin: '', // цена аренды
            rentPriceMax: '',
            rentPeriod: "неважно", // период аренды
        },
        rentalTerms: { // условия проживания
            petsAllowed: false, // можно с животными
            childrenAllowed: false, // можно с детьми
            immediateMoveIn: false, // немедленное заселение
            smokingAllowed: false, // курение разрешено
        },
        numberOfBeds: '', // количество спальных мест
        comparisonMatrix: (() => {
            const params = [
                'rentPayment','rentalTerms','numberOfBeds','area', 'roomCount', 'balconyType',
                'ceilingHeight', 'floor', 'floorsInBuilding', 'houseMaterial',
                'renovationCondition', 'amenities',
                'infrastructure', 'transportAccessibility'
            ];
            const matrix = {};
            params.forEach(param1 => {
                matrix[param1] = {};
                params.forEach(param2 => {
                    matrix[param1][param2] = 1;
                });
            });
            return matrix;
        })(),
        priorities: {
            rentPayment: 1/14,
            rentalTerms: 1/14,
            numberOfBeds: 1/14,
            area: 1/14,
            roomCount: 1/14,
            balconyType: 1/14,
            ceilingHeight: 1/14,
            floor: 1/14,
            floorsInBuilding: 1/14,
            houseMaterial: 1/14,
            renovationCondition: 1/14,
            amenities: 1/14,
            infrastructure: 1/14,
            transportAccessibility: 1/14
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
                setError('Ошибка загрузки данных пользователя');
                return;
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
                setError('Ошибка загрузки параметров');
                return;
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
        const fetchUserData = async () => {
            const storedUser = localStorage.getItem("user");  //получить сохранённые данные
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser); //преобразует строку обратно в json
                setUser(parsedUser);
                await loadUserData(parsedUser.id);
                await loadPreferences(parsedUser.id);
            }
        };
        fetchUserData().catch((error) => {
            console.error("Ошибка загрузки данных:", error);
        });
    }, [loadUserData, loadPreferences]);

   /* useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            loadUserData(parsedUser.id);
            loadPreferences(parsedUser.id);
        }
    }, [loadUserData, loadPreferences]);*/

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
                setError(errorData.message || 'Ошибка обновления данных пользователя');
                return;
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
                setError(errorData.message || 'Ошибка регистрации');
                return;
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
                setError(errorData.message || 'Ошибка авторизации');
                return;
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
                setError(errorData.message || 'Ошибка при сохранении параметров');
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
            budgetMin: '', //бюджет
            budgetMax: '',
            areaMin: '', //площадь
            areaMax: '',
            region: '', // регион
            city: '', // город
            district: '', // район
            roomCount: [], // кол-во комнат
            apartmentType: 'неважно', // тип квартиры (вторичка/новостройка)
            balconyType: 'неважно', // балкон/лоджия
            ceilingHeight: '', // высота потолков
            minFloor: '', // этаж
            maxFloor: '',
            floorsInBuildingMin: '', // этажей в доме
            floorsInBuildingMax: '',
            houseMaterial: [], // материал дома
            renovationCondition: 'неважно', // состояние ремонта
            amenities: [], // удобства
            kitchenStove: 'неважно', // тип кухонной плиты
            viewFromWindows: [], // вид из окон
            infrastructure: { // инфраструктура района
                parks: '',
                hospitals: '',
                shoppingCenters: '',
                shops: '',
                schools: '',
                kindergartens: '',
            },
            transportAccessibility: { // транспортная доступность
                publicTransportStops: '',
                metroDistance: '',
                metroTransportTime: '',
            },
            comparisonMatrix: (() => {
                const params = [
                    'budget', 'area', 'roomCount', 'apartmentType', 'balconyType',
                    'ceilingHeight', 'floor', 'floorsInBuilding', 'houseMaterial',
                    'renovationCondition', 'amenities',
                    'infrastructure', 'transportAccessibility'
                ];
                const matrix = {};
                params.forEach(param1 => {
                    matrix[param1] = {};
                    params.forEach(param2 => {
                        matrix[param1][param2] = 1;
                    });
                });
                return matrix;
            })(),
            priorities: {
                budget: 1/13,
                area: 1/13,
                roomCount: 1/13,
                apartmentType: 1/13,
                balconyType: 1/13,
                ceilingHeight: 1/13,
                floor: 1/13,
                floorsInBuilding: 1/13,
                houseMaterial: 1/13,
                renovationCondition: 1/13,
                amenities: 1/13,
                infrastructure: 1/13,
                transportAccessibility: 1/13
            }
        });

        setRentPreferences({
            rentPayment: { // условия аренды
                rentPrice: '', // цена аренды
                rentPeriod: "неважно", // период аренды
            },
            rentalTerms: { // условия проживания
                petsAllowed: false, // можно с животными
                childrenAllowed: false, // можно с детьми
                immediateMoveIn: false, // немедленное заселение
                smokingAllowed: false, // курение разрешено
            },
            numberOfBeds: '', // количество спальных мест
            comparisonMatrix: (() => {
                const params = [
                    'rentPayment','rentalTerms','numberOfBeds','area', 'roomCount', 'balconyType',
                    'ceilingHeight', 'floor', 'floorsInBuilding', 'houseMaterial',
                    'renovationCondition', 'amenities',
                    'infrastructure', 'transportAccessibility'
                ];
                const matrix = {};
                params.forEach(param1 => {
                    matrix[param1] = {};
                    params.forEach(param2 => {
                        matrix[param1][param2] = 1;
                    });
                });
                return matrix;
            })(),
            priorities: {
                rentPayment: 1/14,
                rentalTerms: 1/14,
                numberOfBeds: 1/14,
                area: 1/14,
                roomCount: 1/14,
                balconyType: 1/14,
                ceilingHeight: 1/14,
                floor: 1/14,
                floorsInBuilding: 1/14,
                houseMaterial: 1/14,
                renovationCondition: 1/14,
                amenities: 1/14,
                infrastructure: 1/14,
                transportAccessibility: 1/14
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