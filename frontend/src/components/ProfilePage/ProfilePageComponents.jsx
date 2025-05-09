import s from './ProfilePage.module.css'

/*отображение личных данных*/
export const ProfileParameterRow = ({ name, value, className = '' }) => {
    return (
        <div className={`${s.parameterRow} ${className}`}> {/*className для дополнительных стилей*/}
            <strong className={s.parameterName}>{name}:</strong>
            <span className={s.userParameterValue}>{value || ''}</span>
        </div>
    );
};

/*Ввод всех основных данных*/
export const FormInputField = ({
                                   name,
                                   label,
                                   type = 'text',
                                   value,
                                   onChange,
                                   options = null,
                                   className = '',
                                   inputClassName = s.input,
                                   required = false, /*необходимость заполнения*/
                                   placeholder = '',
                                   errorClassName = s.error,
                                   error = null,
                                   step = null, /*шаг ввода для чисел*/
                                   minuteLabel=''
}) => {
    return (
        /*для применения разных стилей*/
        <div className={`${s.formGroup} ${className}`}>
            <label>{label}</label>
            {options ? (
                <select
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className={inputClassName}
                    required={required}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={inputClassName}
                    step={step}
                    required={required}
                />
            )}
            {minuteLabel && <span className={s.inlineLabel}>{minuteLabel}</span>}
            {error && <span className={errorClassName}>{error}</span>}
        </div>
    );
};

export const ButtonSave = ({ children, type, className = '' }) => {
    return (
        <button className={`${s.buttonSave} ${className}`} type={type}>
            {children}
        </button>
    )
}

/*ввод инлайн данных*/
export const InlineFromField = ({
                                    name,
                                    label,
                                    type = 'text',
                                    value,
                                    onChange,
                                    className = '',
                                    inputClassName = s.input,
                                    required = false,
                                    placeholder = '',
                                    errorClassName = s.error,
                                    error = null,
                                    step = null,
                                    minuteLabel=''
                                }) => {
    return (
        <>
            <div className={`${s.inlineFormGroup} ${className}`}>
                <label>{label}</label>
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={inputClassName}
                    step={step}
                    required={required}
                />
                {minuteLabel && <span className={s.inlineLabel}>{minuteLabel}</span>}
            </div>
            {error && <span className={errorClassName}>{error}</span>}
        </>

    )
}

/*ввод инлайн чекбоксов*/
export const InlineCheckboxField = ({
                                        name,
                                        label,
                                        type = 'checkbox',
                                        checked,
                                        onChange,
                                }) => {
    return (
        <div className={s.inlineCheckboxRow}>
            <label className={s.checkboxLabel}>
                <input
                    type={type}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    className={s.checkboxInput}
                />
                <span>{label}</span>
            </label>
        </div>
    )
}

/*ввод значений с диапазонами*/
export const RangeInput = ({
                        label,
                        minName,
                        maxName,
                        minValue,
                        maxValue,
                        onChange,
                        minPlaceholder = 'от',
                        maxPlaceholder = 'до',
                        minError = null,
                        maxError = null,
                        className = '',
                        inputClassName = s.range,
                        errorClassName = s.error
                    }) => {
    return (
        <div className={`${s.formGroup} ${className}`}>
            <label>{label}:</label>
            <div className={s.rangeFields}>
                <input
                    type="number"
                    name={minName}
                    value={minValue || ''}
                    onChange={onChange}
                    className={inputClassName}
                    placeholder={minPlaceholder}
                />
                <input
                    type="number"
                    name={maxName}
                    value={maxValue || ''}
                    onChange={onChange}
                    className={inputClassName}
                    placeholder={maxPlaceholder}
                />
            </div>
            {minError && <span className={errorClassName}>{minError}</span>}
            {!minError && maxError && <span className={errorClassName}>{maxError}</span>}
        </div>
    );
};

/*отображение параметров квартиры*/
export const FlatParameterRow = ({
                                     children,
                                     name,
                                     value,
                                     priority,
                                     rentPriority,
                                     isArray = false,
                                     isRange = false,
                                     defaultValue = 'не указан',
}) => {
    const formatValue = () => {
        if (isArray) {
            return value.length > 0 ? value.join(', ') : defaultValue;
        }
        if (isRange) {
            return (<>{children}</>);
        }
        return value || defaultValue;
    };
    const formatPriority = (priorityValue) => {
        if (priorityValue === undefined || priorityValue === null) return null;
        return `${(priorityValue * 100).toFixed(1)}%`;
    };

    const flatPriorityText = formatPriority(priority);

    const rentPriorityText = formatPriority(rentPriority);

    return (
        <div className={s.parameterRow}>
            <strong className={s.parameterName}>{name}:</strong>
            <span className={s.parameterValue}>{formatValue()}</span>
            {(flatPriorityText || rentPriorityText) && (
                <div className={s.priorityContainer}>
                    {flatPriorityText && (
                        <span className={s.flatPriority}>
                            вес при подборе: {flatPriorityText}
                        </span>
                    )}
                    {rentPriorityText && (
                        <span className={s.rentPriority}>
                            вес при аренде: {rentPriorityText}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

/*строки для инфраструктуры и транспортной доступности*/
export const InfrastructureParameterRow = ({ name, value, defaultValue = 'расстояние не указано' }) => {
    return (
        <div className={s.parameterRow}>
            <span className={s.parameterName}>{name}:</span>
            <span className={s.parameterValue}>
        {value ? `Пешком не более ${value} минут` : defaultValue}
      </span>
        </div>
    );
};

/*поля ошибок*/
export const SaveErrorField = ({children}) =>{
    return (
        <div className={s.saveErrorField}>
            <span className={s.saveError}>{children}</span>
        </div>
    );
}





