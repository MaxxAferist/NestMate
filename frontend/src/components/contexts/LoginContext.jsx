import {createContext, useState, useEffect, useCallback} from 'react'
import { useComparison } from './ComparisonContext';

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

    const { clearComparison } = useComparison();

    function getDefaultFlatPreferences() { //парамтры для покупки
        return {
            budgetMin: '',
            budgetMax: '',
            areaMin: '',
            areaMax: '',
            region: 'Санкт-Петербург',
            city: 'Санкт-Петербург',
            district: 'Адмиралтейский',
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
    const [error, setError] = useState(null); // ошибки

    //useCallback - возвращает один и тот же экземпляр функции между рендерами, пока не изменятся указанные зависимости.
    const loadAllUserData = useCallback(async (userId) => { // загрузка данных пользователя
        if (!userId || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/getAllUserData/${userId}`); // апи запрос
            if (!response.ok) {
                setError('Ошибка загрузки данных пользователя');
                return;
            }

            const data = await response.json();
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
            setError(err.message);
            console.error("Ошибка загрузки данных пользователя:", err);
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
            await loadAllUserData(user.id); // загрузка актуальных данных
        } catch (err) {
            setError(err.message);
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
            setError(err.message || 'Ошибка регистрации');
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
            setError(e.message || 'Ошибка авторизации');
            throw e;
        }
    }

    // сохранение параметров подбора квартиры
    const savePreferences = async (flatPreferencesToSave, rentPreferencesToSave) => {
        if (!user?.id || isLoading) return;

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
                    flatPreferences: flatPreferencesToSave || flatPreferences,
                    rentPreferences: rentPreferencesToSave || rentPreferences
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка при сохранении параметров');
            }
            await loadAllUserData(user.id);
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
        setFlatPreferences(null);
        setRentPreferences(null);
        localStorage.removeItem("user");
        clearComparison();
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
            error,
        }}
        >
            { children }
        </LoginContext.Provider>
    );
}

/*export const useLogin = () => useContext(LoginContext)*/

/*const loadAllUserData = useCallback(async (userId) => {
       if (isLoading) return;

       setIsLoading(true);
       setError(null);
       try {
           const response = await fetch(`/api/getAllUserData/${userId}`);
           if (!response.ok) {
               setError('Ошибка загрузки данных пользователя');
               return;
           }

           const data = await response.json();

           setUser(data.user);

           if (data.flatPreferences) {
               setFlatPreferences(data.flatPreferences);
           }
           if (data.rentPreferences) {
               setRentPreferences(data.rentPreferences);
           }
       } catch (err) {
           setError(err.message);
           console.error("Ошибка загрузки данных пользователя:", err);
       } finally {
           setIsLoading(false);
       }
   }, []);*/

/*useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) {
            loadAllUserData(parsedUser.id);
        }
    } catch (error) {
        console.error("Failed to load user data", error);
    }
}, [loadAllUserData]);*/

/*loadAllUserData*/

/*const [user, setUser] = useState(() => {
       const storedUser = localStorage.getItem("user");
       return storedUser ? JSON.parse(storedUser) : null;
   });*/

/*const savePreferences = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        setError(null);
        console.log('Отправка на сервер', flatPreferences)
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
            await loadPreferences(user.id);
        } catch (err) {
            setError(err.message);
            console.error("Ошибка сохранения параметров:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };*/

/*const loadAllUserData = useCallback(async (userId) => {
      setIsLoading(true);
      setError(null);
      try {
          // Параллельная загрузка всех данных
          const [userResponse, preferencesResponse] = await Promise.all([
              fetch(`/api/getUserData/${userId}`),
              fetch(`/api/getPreferences/${userId}`)
          ]);

          if (!userResponse.ok || !preferencesResponse.ok) {
              setError('Ошибка загрузки данных пользователя');
              return;
          }

          const userData = await userResponse.json();
          const preferencesData = await preferencesResponse.json();

          // Обновление состояния
          setUser(userData.user);

          if (preferencesData.flatPreferences) {
              setFlatPreferences(preferencesData.flatPreferences);
          }
          if (preferencesData.rentPreferences) {
              setRentPreferences(preferencesData.rentPreferences);
          }
      } catch (err) {
          setError(err.message);
          console.error("Ошибка загрузки данных пользователя:", err);
      } finally {
          setIsLoading(false);
      }
  }, []);*/
/* const [userData, setUserData] = useState({
    id: '',
    firstName: "",
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    gender: '',
});*/


/*const loadUserData = useCallback(async (userId) => {
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
}, []);*/

/*const saveUserData = async (newData) => {
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
};*/
/* const register = async(userData) => {
     try{
         const response = await fetch('/api/signIn',{  /!*адрес отправки*!/
             method: 'POST', /!*метод*!/
             headers: {  /!*информация о запросе*!/
                 'Content-Type': 'application/json', /!*формат тела запроса*!/
             }, /!*данные, которые отправляются*!/
             body: JSON.stringify(userData), /!*тело запроса *!/
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
 }*/

/*const login = async (userData) =>{
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
}*/

/* const register = async(registrationData) => {
        try {
            // начальные данные
            const initialUserData = {
                ...registrationData,
                lastName: '',
                gender: '',
                flatPreferences: {
                    budgetMin: '', //бюджет
                    budgetMax: '',
                    areaMin: '', //площадь
                    areaMax: '',
                    region: 'Санкт-Петербург', // регион
                    city: 'Санкт-Петербург', // город
                    district: 'Адмиралтейский', // район
                    roomCount: [], // кол-во комнат
                    apartmentType: 'неважно', // тип квартиры (вторичка/новостройка)
                    balconyType: 'неважно', // балкон/лоджия
                    ceilingHeight: 'неважно', // высота потолков
                    minFloor: '', // этаж
                    maxFloor: '',
                    floorsInBuildingMin: '', // этажей в доме
                    floorsInBuildingMax: '',
                    houseMaterial: [], // материал дома
                    renovationCondition: 'неважно', // состояние ремонта
                    amenities: [], // удобства
                    kitchenStove: 'неважно', // тип кухонной плиты
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
                    },
                    comparisonMatrix: {
                        matrix: {},
                        columnsOrder: [] // порядок столбцов
                    },
                    priorities: {}
                },
                rentPreferences: {
                    rentPayment: { // условия аренды
                        rentPriceMin: '', // цена аренды
                        rentPriceMax: '',
                        rentPeriod: "неважно", // период аренды
                    },
                    rentalTerms: { // условия проживания
                        petsAllowed: false, // можно с животными
                        childrenAllowed: false, // можно с детьми
                        smokingAllowed: false, // курение разрешено
                    },
                    numberOfBeds: '', // количество спальных мест
                    comparisonMatrix: {
                        matrix: {},
                        columnsOrder: [] // порядок столбцов
                    },
                    priorities: {}
                }
            };

            const response = await fetch('/api/signIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(initialUserData),
            });

            if(!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка регистрации');
                return;
            }

            const data = await response.json();
            await loadAllUserData(data.user_id);
            /!*setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));*!/
            return data;
        } catch(err) {
            console.error("Ошибка регистрации", err);
            throw err;
        }
    }*/

