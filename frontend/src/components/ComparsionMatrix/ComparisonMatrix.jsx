import {useEffect, useState} from "react";
import s from "./ComparisonMatrix.module.css";

export const ComparisonMatrix = ({ parameters, parametersNames, currentPreferences, onSave, cancelChanging }) => {
    const [selectedColumns, setSelectedColumns] = useState([]); // выбранные парамеры в столбцах
    const [visibleMatrix, setVisibleMatrix] = useState({}); // матрица
    const [consistentErrors, setConsistentErrors] = useState([]); // ошибки согласованности
    const [saveError, setSaveError] = useState(null); // ошибки, которые показываются при сохранении

    useEffect(() => {
        const savedColumns = currentPreferences.comparisonMatrix.columnsOrder || []; // загрузка выбранных параметров в нужном порядке
        const savedMatrix = currentPreferences.comparisonMatrix.matrix || {}; // загрузка самой матрицы

        console.log(currentPreferences.comparisonMatrix.matrix);
        const initialColumns = (savedColumns.length > 0 ? savedColumns : parameters.slice(0, 5)); // начальные столбцы матрицы

        setSelectedColumns(initialColumns);

        if (Object.keys(savedMatrix).length > 0) { // созданиематрицы из сохранённой
            const newMatrix = {};
            initialColumns.forEach(param1 => { newMatrix[param1] = {};
                initialColumns.forEach(param2 => {
                    newMatrix[param1][param2] = savedMatrix[param1]?.[param2] ?? 1; }); // чтобы не было null
            });
            setVisibleMatrix(newMatrix);
        } else { // создание новой матрицы
            const newMatrix = {};
            initialColumns.forEach(param1 => { newMatrix[param1] = {};
                initialColumns.forEach(param2 => {
                    newMatrix[param1][param2] = 1; });
            });
            setVisibleMatrix(newMatrix);
        }
    }, [parameters]);


    const updateVisibleMatrix = (newColumns) => {
        const newMatrix = {};
        newColumns.forEach(param1 => { newMatrix[param1] = {};
            newColumns.forEach(param2 => {
                if (visibleMatrix[param1] && visibleMatrix[param1][param2] !== undefined) { // чтобы не было undefined в матрице
                    newMatrix[param1][param2] = visibleMatrix[param1][param2];
                } else {
                    newMatrix[param1][param2] =  1;
                }
            });
        });
        setVisibleMatrix(newMatrix);
    };

    const handleColumnChange = (columnIndex, newParameter) => {
        if (selectedColumns.includes(newParameter)) return; // усли выбранный параметр

        setSelectedColumns(prev => {
            const newColumns = [...prev];
            newColumns[columnIndex] = newParameter;
            updateVisibleMatrix(newColumns);
            return newColumns;
        });
    };

    const handleClearMatrix = () => {
        if (!window.confirm('Вы уверены, что хотите сбросить все сравнения? Все значения будут установлены в 1.')) {
            return;
        }

        const resetMatrix = {};
        selectedColumns.forEach(param1 => { resetMatrix[param1] = {};
            selectedColumns.forEach(param2 => { resetMatrix[param1][param2] =  1; }); // все ячейки - 1
        });

        setVisibleMatrix(resetMatrix);
        setConsistentErrors([]);
        setSaveError(null);
    };

    const oppositeValue = (value) => {

        if (typeof value === 'string' && value.includes('/')) { // для дробных
            const [numerator, denominator] = value.split('/').map(Number);
            return denominator / numerator;
        }

        const numValue = typeof value === 'string' ? parseFloat(value) : value;

        const reversePairs = {
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
        if (reversePairs.hasOwnProperty(numValue)) {
            return reversePairs[numValue];
        }
        return 1 / numValue;
    };

    const findLambdaMax = (matrix, weights) => {
        const parameters = Object.keys(matrix);
        let lambdaMax = 0;

        parameters.forEach(param2 => { // расчёт собственного значения матрицы 4.1
            let columnSum = 0;
            parameters.forEach(param1 => { columnSum += matrix[param1][param2]; });
            lambdaMax += columnSum * weights[param2];
        });

        return lambdaMax;
    };

    const findConsistencyIndex = (matrix, weights) => {
        const n = Object.keys(matrix).length;
        if (n <= 2) return 0;

        const lambdaMax = findLambdaMax(matrix, weights);
        const CI = (lambdaMax - n) / (n - 1); // расчёт индекса согласованности 4.2


        const RI_TABLE = { 3: 0.58, 4: 0.9, 5: 1.12,
            6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
            11: 1.51, 12: 1.48, 13: 1.56, 14: 1.57, 15: 1.59};
        const RI = RI_TABLE[n];

        const CR = CI / RI; // расчёт отношения согласованности 4.3
        return CR;
    };


    const checkConsistency = (matrix) => {
        const currentErrors = [];
        const parametersList = Object.keys(matrix);

        for (let i = 0; i < parametersList.length; i++) { // проверка всех троек A,B,C
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
                            currentErrors.push({
                                errorCells: [ // ошибочные ячейки
                                    [A, B],
                                    [B, C],
                                    [A, C]
                                ],
                                // тексты ошибок
                                chain: `"${parametersNames[A]}" важнее "${parametersNames[B]}" в ${AB} ${(AB>=2 && AB<=4) ? 'раза' : 'раз' }, 
                                "${parametersNames[B]}" важнее "${parametersNames[C]}" в ${BC} ${(BC>=2 && BC<=4) ? 'раза' : 'раз' }, 
                                но "${parametersNames[A]}" менее важен чем "${parametersNames[C]}" в ${AC} ${(AC>=2 && AC<=4) ? 'раза' : 'раз' }`,
                                // исправление
                                suggestion: `Исправьте значение в данных ячейках: [${parametersNames[A]}]&[${parametersNames[B]}]
                                или  [${parametersNames[B]}]&[${parametersNames[C]}]
                                или [${parametersNames[A]}]&[${parametersNames[C]}]`
                            });
                        }
                    }
                }
            }
        }
        return currentErrors;
    };

    const isErrorCell = (rowParam, colParam) => { // определение ошибочных ячеек
        return consistentErrors.some(error =>
            error.errorCells.some(([p1, p2]) =>
                (p1 === rowParam && p2 === colParam) || (p1 === colParam && p2 === rowParam)));
    };

    const handleCellChange = (rowParameter, colParameter, value) => { // изменение ячеек
        const newValue = Number(value);
        const reverseValue = oppositeValue(newValue);

        const updatedMatrix = {
            ...visibleMatrix,
            [rowParameter]: { // обновляемая строка
                ...visibleMatrix[rowParameter], // полная строка
                [colParameter]: newValue // обновление ячейки на значение newValue
            }
        };

        if (rowParameter !== colParameter) { // обратное значение аналогично
            updatedMatrix[colParameter] = {
                ...updatedMatrix[colParameter],
                [rowParameter]: reverseValue
            };
        }

        const errors = checkConsistency(updatedMatrix);
        setConsistentErrors(errors);
        if (errors.length > 0) {
            setSaveError("Обнаружены противоречия в сравнениях, исправьте их перед сохранением.");
        } else {
            setSaveError(null);
        }

        setVisibleMatrix(updatedMatrix);
    };


    const calculateWeights = (matrix) => {
        const parametersList = Object.keys(matrix);
        //if (parametersList.length === 0) return {};

        const weights = {};
        const n = parametersList.length;

        parametersList.forEach(parameter => { // расчёт среднего геометрического каждой строки 3.1
            let product = 1;
            parametersList.forEach(otherParameter => {
                product *= matrix[parameter][otherParameter] || 1; // чтобы не было 0
            });
            weights[parameter] = Math.pow(product, 1/n);
        });

        // расчёт суммы средних геометрических 3.2
        const sum = Object.values(weights).reduce((a, b) => a + b, 0); // сложение всех весов начиная с 0
        parametersList.forEach(param => {  // расчёт компонентов нормализованного вектора приоритетов (НВП) 3.3
            weights[param] = weights[param] / sum;
        });

        return weights; // веса параметров
    };

    const handleSave = () => {
        const finalErrors = checkConsistency(visibleMatrix);
        setConsistentErrors(finalErrors);

        if (finalErrors.length > 0) {
            setSaveError("Обнаружены явные противоречия в сравнениях. Исправьте их перед сохранением.");
            return;
        }

        const weights = calculateWeights(visibleMatrix);
        const CR = findConsistencyIndex(visibleMatrix, weights);

        if (CR > 0.1) {
            setSaveError(`Индекс согласованности CR = ${CR.toFixed(3)} превышает допустимый порог 0.1. 
                    Упростите сравнения или сделайте их более согласованными.`);
            return;
        }
       /* const prioritiesArray = selectedColumns.map(parameter => ({
            parameter, weight: weights[parameter]
        }));*/

        onSave({
            matrix: visibleMatrix,
            columnsOrder: selectedColumns
        }, weights);
    };




    return (
        <div className={s.matrixContainer}>
            <h3>Парные сравнения критериев</h3>
            <div className={s.instructionsContainer}> {/*инструкция*/}
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
                            Если для вас "Цена" важнее "Площади" → выберите значение по шкале Саати (в данном случае <span className={s.light}>5</span> )
                            в пересечении строки "Цена" и столбца "Площадь" ( в ячейке <span className={s.light}> [Цена]&[Площадь]</span>)
                        </div>
                    </div>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        Если вы выбрали значение 5 в ячейке <span className={s.light}>[Цена]&[Площадь]</span>,
                        то система автоматически проставит значение 1/5 в ячейке <span className={s.light}>[Площадь]&[Цена]</span>
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
                        Для сохранения матрицы парных сравнений нажмите кнопку <span className={s.light}>"Сохранить сравнения"</span>.
                    </li>
                    <li className={s.instructionItem}>
                        <span className={s.bullet}>•</span>
                        Кнопка <span className={s.light}>"Сбросить сравнения"</span> сбросит все выставленные вами значения
                        в матрице парных сравнений. Во все ячейки будет установлено стандартное значение: 1.
                    </li>
                    <li className={s.instructionItem}>
                        После заполнения матрицы и сохранения сравнений система автоматически рассчитает веса параметров.
                        Чем выше вес, тем важнее параметр и тем сильнее он будет влиять на дальнейший подбор квартиры.
                    </li>
                </ul>
            </div>

            <div className={s.columnSelectors}> {/*столбцы параметров*/}
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className={s.columnSelector}>
                        <label>Столбец {index + 1}:</label>
                        <select value={selectedColumns[index] || ''}
                            onChange={(e) => handleColumnChange(index, e.target.value)}
                        >
                            {parameters.map(param => (
                                <option key={param} value={param}
                                    disabled={selectedColumns.includes(param) && selectedColumns[index] !== param} /*отключает выбранные параметры, но оставляет доступным текущий*/
                                >
                                    {parametersNames[param]}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            {/*таблица*/}
            {selectedColumns.length > 0 && (
                <table className={s.comparisonTable}>
                    <thead> {/*шапка таблицы*/}
                        <tr>
                            <th className={s.colName}>Критерий</th>
                            {selectedColumns.map(parameter => (
                                <th className={s.colName} key={parameter}>
                                    {parametersNames[parameter]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody> {/*телро таблицы*/}
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
                                            value={visibleMatrix[rowParameter]?.[colParameter]}
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
            <div className={s.errorContainer}> {/*ошибки*/}
                {consistentErrors.length > 0 && (
                    <div className={s.consistencyError}>
                        <h4 className={s.errorTitle}>Обнаружены противоречия в сравнениях:</h4>
                        <div className={s.errorList}>
                            {consistentErrors.map((item, index) => (
                                <div key={index} className={s.errorItem}>
                                    <div className={s.errorChain}>
                                        <span className={s.errorIcon}>⚠</span> {item.chain}
                                    </div>

                                    <div className={s.errorSuggestion}>{item.suggestion}</div>

                                    {index < consistentErrors.length - 1 && (
                                        <div className={s.errorSpacer}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/*ошибки при сохранении*/}
                {saveError && (
                    <div>
                        <div className={s.saveError}>
                            <span className={s.errorIcon}>❌</span>
                            {saveError}
                        </div>
                        {saveError.includes("превышает") && (
                            <div className={s.CRIndexErrorRecommendations}>
                                <h5>Как улучшить согласованность:</h5>
                                <ul>
                                    <li>Замените крайние значения (9, 7) на более умеренные (5, 3).</li>
                                    <li>Если изменения в текущей матрице не помогли, выберите другие столбцы и исправьте их.</li>
                                    <li>Если исправить матрицу не получается, отмените изменения кнопкой: "Отменить изменения".</li>
                                </ul>
                            </div>
                        )}
                    </div>

                )}
            </div>

            {/*кнопки*/}
            <div className={s.matrixButtonGroup}>
                <button onClick={handleSave} className={s.saveButton}
                    disabled={consistentErrors.length > 0}
                >
                    Сохранить сравнения
                </button>
                <button onClick={cancelChanging} className={s.cancelButton}>
                    Отменить изменения
                </button>
                <button onClick={handleClearMatrix} className={s.clearButton}
                    title="Сбросить все сравнения"
                >
                    Сбросить сравнения
                </button>
            </div>
        </div>
    );
};