import s from './fields.module.css';


export const LoadingText = () => {
    return (
        <div className={s.mainContainer}>
            <div className={s.loading}>Загрузка...</div>
        </div>
    );
}

export const ErrorText = ({children}) => {
    return (
        <div className={s.mainContainer}>
            <div className={s.error}>{children}</div>
        </div>
    );
}

export const EmptyText = ({children}) => {
    return (
        <div className={s.mainContainer}>
            <div className={s.loading}>{children}</div>
        </div>
    );
}

