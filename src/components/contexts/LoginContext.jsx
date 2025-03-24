import { createContext, useState, useEffect } from 'react'

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user"); /*получить данные, сохранённые*/
        if (storedUser) {
            setUser(JSON.parse(storedUser)); /*преобразует строку обратно в объект JavaScript*/
        }
    }, []); /*[] эффект выполняется только один раз после первого рендера компонента.*/

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
            return data;
        }catch(e){
            console.error("Ошибка авторизации", e)
            throw e;
        }
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    }

    return(
        <LoginContext.Provider value={{user,register, login, logout}}>
            { children }
        </LoginContext.Provider>
    );
}