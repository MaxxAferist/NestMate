import s from './ProfilePage.module.css'
import {useEffect, useState, } from "react";



export const ProfileParameterRow = ({ name, value, className = '' }) => {
    return (
        <div className={`${s.parameterRow} ${className}`}> {/*className для дополнительных стилей*/}
            <strong className={s.parameterName}>{name}:</strong>
            <span className={s.userParameterValue}>{value || ''}</span>
        </div>
    );
};

export const FormInputField = ({
                                   name,
                                   label,
                                   type = 'text',
                                   value,
                                   onChange,
                                   options = null,
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

export const InlineCheckboxField = ({
                                        name,
                                        label,
                                        type = 'checkbox',
                                        checked,
                                        onChange,
                                }) => {
    return (
        <div className={s.inlineCheckboxGroup}>
            <label>{label}</label>
            <input
                type={type}
                name={name}
                checked={checked}
                onChange={onChange}
            />
        </div>
    )
}
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

export const FlatParameterRow = ({
                                     children,
                                     name,
                                     value,
                                     priority,
                                     isArray = false,
                                     isRange = false,
                                     defaultValue = 'не указан',
}) => {
    const renderValue = () => {
        if (isArray) {
            return value.length > 0 ? value.join(', ') : defaultValue;
        }
        if (isRange) {
            return (<>{children}</>);
        }
        return value || defaultValue;
    };
    return (
        <div className={s.parameterRow}>
            <strong className={s.parameterName}>{name}:</strong>
            <span className={s.parameterValue}>{renderValue()}</span>
            {(0<=priority) && (
                <span className={s.parameterPriority}>приоритет: {priority}</span>
            )}
        </div>
    );
};

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

export const ComparisonMatrix = ({ parameters, parametersNames, flatPreferences, onSave, cancelChanging }) => {
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [visibleMatrix, setVisibleMatrix] = useState({});
    const [isConsistent, setIsConsistent] = useState(true);
    const [fullMatrix, setFullMatrix] = useState(flatPreferences.comparisonMatrix);
    const [consistentErrors, setConsistentErrors] = useState([]);
    const [saveError, setSaveError] = useState(null);

    useEffect(() => {
        const initialColumns = parameters.slice(0, 5);
        setSelectedColumns(initialColumns);
        updateVisibleMatrix(fullMatrix, initialColumns);
    }, [parameters]);


    const updateVisibleMatrix = (matrix, columns) => {
        const subMatrix = {};
        columns.forEach(param1 => {
            subMatrix[param1] = {};
            columns.forEach(param2 => {
                subMatrix[param1][param2] = matrix[param1][param2];
            });
        });
        setVisibleMatrix(subMatrix);
    };

    const handleColumnChange = (columnIndex, newParameter) => {
        if (selectedColumns.includes(newParameter)) return;

        setSelectedColumns(prev => {
            const newColumns = [...prev];
            newColumns[columnIndex] = newParameter;
            updateVisibleMatrix(fullMatrix, newColumns);
            return newColumns;
        });
    };

    const handleCellChange = (rowParameter, colParameter, value) => {
        const newValue = Number(value);
        const reciprocalValue = oppositeValue(newValue);

        const updatedFullMatrix = {
            ...fullMatrix,
            [rowParameter]: {
                ...fullMatrix[rowParameter],
                [colParameter]: newValue
            }
        };

        if (rowParameter !== colParameter) {
            updatedFullMatrix[colParameter] = {
                ...updatedFullMatrix[colParameter],
                [rowParameter]: reciprocalValue
            };
        }

        const updatedVisibleMatrix = {};
        selectedColumns.forEach(param1 => {
            updatedVisibleMatrix[param1] = {};
            selectedColumns.forEach(param2 => {
                updatedVisibleMatrix[param1][param2] = updatedFullMatrix[param1]?.[param2] ?? 1; // если будет отсутствовать
            });
        });



        const errors = checkConsistency(updatedVisibleMatrix);
        setConsistentErrors(errors);
        if (errors.length > 0) {
            setSaveError("Обнаружены противоречия в сравнениях, исправьте их перед сохранением.");
        } else {
            setSaveError(null);
        }

        setFullMatrix(updatedFullMatrix);
        setVisibleMatrix(updatedVisibleMatrix);
    };

    const handleClearMatrix = () => {
        if (!window.confirm('Вы уверены, что хотите сбросить все сравнения? Все значения будут установлены в 1.')) {
            return;
        }

        const resetMatrix = {};
        parameters.forEach(param1 => {
            resetMatrix[param1] = {};
            parameters.forEach(param2 => {
                resetMatrix[param1][param2] = 1; // Все ячейки = 1
            });
        });

        setFullMatrix(resetMatrix);
        updateVisibleMatrix(resetMatrix, selectedColumns);
        setConsistentErrors([]);
        setSaveError(null);
    };



    const oppositeValue = (value) => {
        if (value === null) return null;

        if (typeof value === 'string' && value.includes('/')) {
            const [numerator, denominator] = value.split('/').map(Number);
            return denominator / numerator;
        }

        const numValue = typeof value === 'string' ? parseFloat(value) : value;

        const reciprocalPairs = {
            9: 0.111,
            8: 1/8,
            7: 0.143,
            6: 0.167,
            5: 1/5,
            4: 1/4,
            3: 0.333,
            2: 1/2,
            1: 1,
            0.111: 9,
            0.125: 8,
            0.143: 7,
            0.167: 6,
            0.2: 5,
            0.25: 4,
            0.333: 3,
            0.5: 2
        };
        if (reciprocalPairs.hasOwnProperty(numValue)) {
            return reciprocalPairs[numValue];
        }
        return 1 / numValue;
    };

    const findLambdaMax = (matrix, weights) => {
        const parameters = Object.keys(matrix);
        let lambdaSum = 0;

        parameters.forEach(param1 => {
            let rowSum = 0;
            parameters.forEach(param2 => {
                rowSum += matrix[param1][param2] * weights[param2];
            });
            lambdaSum += rowSum / weights[param1];
        });

        return lambdaSum / parameters.length;
    };

    const findConsistencyIndex = (matrix, weights) => {
        const n = Object.keys(matrix).length;
        if (n <= 2) return 0;

        const lambdaMax = findLambdaMax(matrix, weights);
        const CI = (lambdaMax - n) / (n - 1);


        const RI_TABLE = { 3: 0.58, 4: 0.9, 5: 1.12,
            6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
            11: 1.51, 12: 1.48, 13: 1.56, 14: 1.57, 15: 1.59};
        const RI = RI_TABLE[n] || 1.49;

        const CR = CI / RI;
        return CR;
    };

    const checkConsistentIndex = (matrix, weights) => {
        const CR = findConsistencyIndex(matrix, weights);
        if (CR > 0.1) {
            setIsConsistent(false);
            return false;
        }else{
            return true;
        }
    };

    const checkConsistency = (matrix) => {
        const parametersList = Object.keys(matrix);

        for (let i = 0; i < parametersList.length; i++) {
            for (let j = 0; j < parametersList.length; j++) {
                for (let k = 0; k < parametersList.length; k++) {
                    const A = parametersList[i];
                    const B = parametersList[j];
                    const C = parametersList[k];

                    const AB = matrix[A][B];
                    const BC = matrix[B][C];
                    const AC = matrix[A][C];

                    if (AB && BC && AC) {
                        if (AB > 1 && BC > 1 && AC <= 1) {
                            consistentErrors.push({
                                errorCells: [
                                    [A, B],
                                    [B, C],
                                    [A, C]
                                ],

                                chain: `"${parametersNames[A]}" важнее "${parametersNames[B]}" в ${AB} ${(AB>=2 && AB<=4) ? 'раза' : 'раз' }, 
                                "${parametersNames[B]}" важнее "${parametersNames[C]}" в ${BC} ${(BC>=2 && BC<=4) ? 'раза' : 'раз' }, 
                                но "${parametersNames[A]}" менее важен чем "${parametersNames[C]}" в ${AC} ${(AC>=2 && AC<=4) ? 'раза' : 'раз' }`,

                                suggestion: `Исправьте значение в данных ячейках: [${parametersNames[A]}]&[${parametersNames[B]}]
                                или  [${parametersNames[B]}]&[${parametersNames[C]}]
                                или [${parametersNames[A]}]&[${parametersNames[C]}]`
                            });
                        }
                    }
                }
            }
        }
        /*setIsConsistent(consistentErrors.length === 0);*/
        return consistentErrors;
    };

    const isErrorCell = (rowParam, colParam) => {
        return consistentErrors.some(error =>
            error.errorCells.some(([p1, p2]) =>
                (p1 === rowParam && p2 === colParam) ||
                (p1 === colParam && p2 === rowParam)
            )
        );
    };

    const calculateWeights = (matrix) => {
        const parametersList = Object.keys(matrix);
        if (parametersList.length === 0) return {};

        const weights = {};
        const n = parametersList.length;

        parametersList.forEach(parameter => {
            let product = 1;
            parametersList.forEach(otherParameter => {
                product *= matrix[parameter][otherParameter] || 1; // чтобы не было 0
            });
            weights[parameter] = Math.pow(product, 1/n);
        });

        const sum = Object.values(weights).reduce((a, b) => a + b, 0); // сложение всех весов начиная с 0
        parametersList.forEach(param => {
            weights[param] = weights[param] / sum;
        });

        return weights;
    };

    const handleSave = () => {
        const weights = calculateWeights(fullMatrix);
        checkConsistentIndex(fullMatrix, weights);

        if (!isConsistent || consistentErrors.length > 0) {
            setSaveError("Обнаружены противоречия в матрице. Исправьте их перед сохранением.");
            return;
        }

        onSave(fullMatrix, weights);
    };

    /*
const handleSave = () => {
    if (consistentErrors.length > 0) {
        setSaveError("Исправьте противоречия в матрице перед сохранением");
        return;
    }

    const weights = calculateWeights(fullMatrix);
    onSave(fullMatrix, weights);
};*/


    return (
        <div className={s.matrixContainer}>
            <h3>Парные сравнения критериев</h3>
            <div className={s.instructionsContainer}>
                <h4 className={s.instructionsTitle}>Описание:</h4>
                <ul className={s.instructionsList}>
                    <li className={s.instructionItem}>
                        Вес каждого параметра оценивается с помощью матрицы парных сравнений.
                    </li>
                    <li className={s.instructionItem}>
                        Сравнения параметров происходит попарно по их важности.
                    </li>
                    <li className={s.instructionItem}>
                        Параметры для сравнений находятся в строках и столбцах матрицы.
                    </li>
                    <li className={s.instructionItem}>
                        Каждая ячейка матрицы определяет во сколько раз параметр в строке важнее чем параметр в столбце.
                    </li>
                </ul>
                <h4 className={s.instructionsTitle}>Инструкция по заполнению матрицы:</h4>

                <ul className={s.instructionsList}>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        В верхней части матрицы выберите 5 параметров для сравнения из списков
                    </li>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        Сравнение происходит попарно, по шкале Саати:
                    </li>
                    <ul className={s.saatiScale}>
                        <li><span className={s.scaleValue}>1</span> - равная важность</li>
                        <li><span className={s.scaleValue}>3</span> - немного важнее</li>
                        <li><span className={s.scaleValue}>5</span> - важнее</li>
                        <li><span className={s.scaleValue}>7</span> - значительно важнее</li>
                        <li><span className={s.scaleValue}>9</span> - гораздо важнее</li>
                        <li><span className={s.scaleValue}>2,4,6,8</span> - промежуточные значения</li>
                        <li><span className={s.scaleValue}>1/2, 1/3, 1/5</span> и т.д. – обратные случаи (если параметр менее важен)</li>
                    </ul>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        Среди строк найдите нужный вам параметр для парного сравнения.
                    </li>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        Среди столбцов найдите параметр, с которым вы хотите произвести сравнение.
                    </li>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        В ячейке пересечения строки и столбца выберите насколько для вас параметр в строке важнее, чем параметр в столбце.
                    </li>
                    <div className={s.example}>
                        <div className={s.exampleTitle}>Пример:</div>
                        <div className={s.exampleText}>
                            Если для вас "Цена" важнее "Площади" → выберите значение по шкале Саати (в данном случае <span className={s.highlight}>5</span> )
                            в пересечении строки "Цена" и столбца "Площадь" ( в ячейке <span className={s.highlight}> [Цена]&[Площадь]</span>)
                        </div>
                    </div>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        Если вы выбрали значение 5 в ячейке <span className={s.highlight}>[Цена]&[Площадь]</span>,
                        то система автоматически проставит значение 1/5 в ячейке <span className={s.highlight}>[Площадь]&[Цена]</span>
                        для более удобного заполнения матрицы.
                    </li>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        Старайтесь оценивать параметры последовательно.
                        <div className={s.example}>
                            <div className={s.exampleTitle}>Например:</div>
                            <div className={s.exampleText}>
                                Если "Цена" важнее "Площади", а "Площадь" немного важнее "Этажа", то "Цена" должна быть значительно важнее "Этажа".
                            </div>
                        </div>
                        Система проверит согласованность ваших оценок.
                    </li>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        Для сохранения матрицы парных сравнений нажмите кнопку <span className={s.highlight}>"Сохранить сравнения"</span>.
                    </li>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        Кнопка <span className={s.highlight}>"Сбросить сравнения"</span> сбросит все выставленные вами значения
                        в матрице парных сравнений. Во все ячейки будет установлено стандартное значение: 1.
                    </li>
                    <li className={s.instructionItem}>
                        После заполнения матрицы и сохранения сравнений система автоматически рассчитает веса параметров.
                        Чем выше вес, тем важнее параметр и тем сильнее он будет влиять на дальнейший подбор квартиры.
                    </li>
                </ul>
            </div>

            <div className={s.columnSelectors}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className={s.columnSelector}>
                        <label>Столбец {index + 1}:</label>
                        <select
                            value={selectedColumns[index] || ''}
                            onChange={(e) => handleColumnChange(index, e.target.value)}
                        >
                            <option value="">Выберите параметр</option>
                            {parameters.map(param => (
                                <option
                                    key={param}
                                    value={param}
                                    disabled={selectedColumns.includes(param) && selectedColumns[index] !== param}
                                >
                                    {parametersNames[param]}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            {selectedColumns.length > 0 && (
                <table className={s.comparisonTable}>
                    <thead>
                    <tr>
                        <th className={s.colName}>Критерий</th>
                        {selectedColumns.map(parameter => (
                            <th className={s.colName} key={parameter}>
                                {parametersNames[parameter]}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {selectedColumns.map(rowParameter => (
                        <tr key={rowParameter} >
                            <td className={s.rowName}>
                                <label >{parametersNames[rowParameter]}</label>
                            </td>

                            {selectedColumns.map(colParameter => (
                                <td key={`${rowParameter}-${colParameter}`}
                                    className={rowParameter !== colParameter && isErrorCell(rowParameter, colParameter) ? s.errorCell : s.normalCell}>
                                        {rowParameter === colParameter ? (
                                        <span>1</span>
                                    ) : (
                                        <select
                                            value={visibleMatrix[rowParameter]?.[colParameter] || ''}
                                            onChange={(e) => handleCellChange(
                                                rowParameter,
                                                colParameter,
                                                e.target.value
                                            )}
                                        >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                            <option value="9">9</option>
                                            <option value="0.5">1/2</option>
                                            <option value="0.333">1/3</option>
                                            <option value="0.25">1/4</option>
                                            <option value="0.2">1/5</option>
                                            <option value="0.167">1/6</option>
                                            <option value="0.143">1/7</option>
                                            <option value="0.125">1/8</option>
                                            <option value="0.111">1/9</option>
                                        </select>
                                    )}
                                    {rowParameter !== colParameter && visibleMatrix[colParameter]?.[rowParameter] && (
                                        <div className={s.oppositeValue}>
                                            {visibleMatrix[colParameter][rowParameter].toFixed(3)}
                                        </div>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
            <div className={s.errorContainer}>
                {consistentErrors.length > 0 && (
                    <div className={s.consistencyError}>
                        <h4 className={s.errorTitle}>Обнаружены противоречия в сравнениях:</h4>
                        <div className={s.errorList}>
                            {consistentErrors.map((item, index) => (
                                <div key={index} className={s.errorItem}>
                                    <div className={s.errorChain}>
                                        <span className={s.errorIcon}>⚠</span>
                                        {item.chain}
                                    </div>
                                    <div className={s.errorSuggestion}>
                                        {item.suggestion}
                                    </div>
                                    {index < consistentErrors.length - 1 && (
                                        <div className={s.errorSpacer}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/*{!isConsistent && (
                    <div className={s.consistencyError}>
                        <h4>Несогласованность матрицы (CR > 0.1):</h4>
                        <p>Проверьте сравнения параметров, так как они противоречивы.</p>
                    </div>
                )}*/}
                {saveError && (
                    <div className={s.saveError}>
                        <span className={s.errorIcon}>❌</span>
                        {saveError}
                    </div>
                )}
            </div>
            <div className={s.matrixButtonGroup}>
                <button
                    onClick={handleSave}
                    className={s.saveButton}
                    disabled={consistentErrors.length > 0}
                >
                    Сохранить сравнения
                </button>
                <button
                    onClick={cancelChanging}
                    className={s.cancelButton}
                >
                    Отменить изменения
                </button>
                <button
                    onClick={handleClearMatrix}
                    className={s.clearButton}
                    title="Сбросить все сравнения"
                >
                    Сбросить сравнения
                </button>
            </div>
        </div>
    );
};

/*useEffect(() => {
       if (flatPreferences.comparisonMatrix && Object.keys(flatPreferences.comparisonMatrix).length > 0) {
           const savedMatrix = flatPreferences.comparisonMatrix;
           setMatrix(savedMatrix);
           setSelectedColumns(Object.keys(savedMatrix));
       } else {
           const initialColumns = parameters.slice(0, 5);
           const initialMatrix = {};

           initialColumns.forEach(param1 => {
               initialMatrix[param1] = {};
               initialColumns.forEach(param2 => {
                   initialMatrix[param1][param2] = param1 === param2 ? 1 : null;
               });
           });

           setSelectedColumns(initialColumns);
           setMatrix(initialMatrix);
       }
   }, [flatPreferences.comparisonMatrix, parameters]);*/

/*useEffect(() => {
    if (!flatPreferences.comparisonMatrix || Object.keys(flatPreferences.comparisonMatrix).length === 0) {
        const newMatrix = {};
        selectedColumns.forEach(param1 => {
            newMatrix[param1] = {};
            selectedColumns.forEach(param2 => {
                newMatrix[param1][param2] = param1 === param2 ? 1 : null;
            });
        });
        setMatrix(newMatrix);
    }
}, [selectedColumns, flatPreferences.comparisonMatrix]);*/

/*useEffect(() => {
    if (flatPreferences.comparisonMatrix && Object.keys(flatPreferences.comparisonMatrix).length > 0) {
        setMatrix(flatPreferences.comparisonMatrix);
        setSelectedColumns(Object.keys(flatPreferences.comparisonMatrix));
    } else {
        const initialColumns = parameters.slice(0, 5);
        setSelectedColumns(initialColumns);
    }
}, []);*/

/*const handleColumnChange = (columnIndex, newParameter) => {
    if (selectedColumns.includes(newParameter)) return;

    setSelectedColumns(prev => {
        const newColumns = [...prev];
        newColumns[columnIndex] = newParameter;
        return newColumns;
    });
};
*/

/*const handleSave = () => {
        const weights = calculateWeights();
        onSave(matrix, weights);
    };
*/

/*const handleCellChange = (rowParameter, colParameter, value) => {
       const newValue = Number(value);
       const reciprocalValue = oppositeValue(newValue);

       setMatrix(prevMatrix => {
           const newMatrix = { ...prevMatrix };

           newMatrix[rowParameter] = { ...newMatrix[rowParameter] };
           newMatrix[rowParameter][colParameter] = newValue;

           if (rowParameter !== colParameter) {
               newMatrix[colParameter] = { ...newMatrix[colParameter] };
               newMatrix[colParameter][rowParameter] = reciprocalValue;
           }

           checkConsistency(newMatrix);
           return newMatrix;
       });
   };*/

/*const checkConsistency = (matrix) => {
        let isConsistent = true;
        const parametersList = Object.keys(matrix);

        for (let i = 0; i < parametersList.length; i++) {
            for (let j = 0; j < parametersList.length; j++) {
                for (let k = 0; k < parametersList.length; k++) {
                    const a = matrix[parametersList[i]][parametersList[j]];
                    const b = matrix[parametersList[j]][parametersList[k]];
                    const c = matrix[parametersList[i]][parametersList[k]];

                    if (a && b && c) {
                        if (a > 1 && b > 1 && c <= 1) {
                            isConsistent = false;
                            break;
                        }
                    }
                }
                if (!isConsistent) break;
            }
            if (!isConsistent) break;
        }

        setIsConsistent(isConsistent);
    };*/

{/*{!isConsistent && (
                <div className={s.consistencyError}>
                    Внимание: обнаружены противоречия в сравнениях. Пожалуйста, проверьте ваши оценки.
                </div>
            )}*/}
/*
{consistentErrors.length > 0 && (
    <div className={s.consistencyError}>
        <h4>Обнаружены противоречия:</h4>
        <ul>
            {consistentErrors.map((item, index) => (
                <li key={index}>
                    {item.chain} → {item.suggestion}
                </li>
            ))}
        </ul>
    </div>
)}
<button onClick={handleSave} className={s.saveButton}>
    Сохранить веса критериев
</button>*/

/*const updatedVisibleMatrix = {
            ...visibleMatrix,
            [rowParameter]: {
                ...visibleMatrix[rowParameter],
                [colParameter]: newValue
            }
        };

        if (rowParameter !== colParameter) {
            updatedVisibleMatrix[colParameter] = {
                ...updatedVisibleMatrix[colParameter],
                [rowParameter]: reciprocalValue
            };
        }
*/

{/*<div className={s.textContainer}>
                <p>
                    Вес каждого параметра оценивается с помощью матрицы парных сравнений.
                    Сравнения параметров происходит попарно по их важности.
                    Параметры для сравнений находятся в строках и столбцах матрицы.
                    Каждая ячейка матрицы определяет во сколько раз параметр в строке важнее чем параметр в столбце.
                    В верхней части матрицы выберите 5 параметров для сравнения из списков.
                    Сравнение происходит попарно, на сколько один параметр важнее другого определяется по шкале Саати:
                    1 - равная важность
                    3 - немного важнее
                    5 - важнее
                    7 - значительно важнее
                    9 - гораздо важнее
                    2,4,6,8 - промежуточные значения
                    Дробные значения (1/2, 1/3, 1/5 и т.д.) – обратные случаи (если параметр менее важен).

                    Пример: Если для вас "Цена" важнее "Площади" → выберите значение по шкале Саати (в данном случае 5)
                    в пересечении строки "Цена" и столбца "Площадь" (в ячейке [Цена]&[Площадь]).
                    Если вы выбрали значение 5 в ячейке [Цена]&[Площадь],
                    то система автоматически проставит значение 1/5 в ячейке [Площадь]&[Цена] для более удобного заполнения матрицы.

                    Старайтесь оценивать параметры последовательно.
                    Например, если "Цена" важнее "Площади", а "Площадь" немного важнее "Этажа", то "Цена" должна быть значительно важнее "Этажа".
                    Система проверит согласованность ваших оценок.

                    После заполнения матрицы и сохранения сравнений система автоматически рассчитает веса параметров.
                    Чем выше вес, тем важнее параметр и тем сильнее он будет влиять на дальнейший подбор квартиры.
                </p>
            </div>*/}


