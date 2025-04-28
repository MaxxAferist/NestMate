import numpy as np

matrix = np.array([
    [10, 20, 30],
    [40, 50, 60],
    [70, 80, 90]
])

summa = [10, 5, 2]

# Делим каждый столбец на соответствующее значение из списка
result = matrix / np.array(summa)

print(result)
