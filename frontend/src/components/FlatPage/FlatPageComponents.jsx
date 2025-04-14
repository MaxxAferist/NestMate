import s from "./FlatPage.module.css"

export const ParameterItem = ({ label, children }) => {
    return (
        <div className={s.parameterItem}>
            <span className={s.parameterName}>{label}:</span>
            <span className={s.parameterValue}>{children}</span>
        </div>
    );
}