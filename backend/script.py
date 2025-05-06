a = """id SERIAL PRIMARY KEY,
link TEXT,
type_sdelki SMALLINT,
type_apartment SMALLINT,
pictures TEXT[],
address TEXT,
coord_lat VARCHAR(50),
coord_lng VARCHAR(50),
region VARCHAR(50),
city VARCHAR(50),
district VARCHAR(50),
price INTEGER,
count_rooms VARCHAR(50),
balcony VARCHAR(50),
ceiling_height REAL,
floor SMALLINT,
count_floors SMALLINT,
area SMALLINT,
material_house VARCHAR(50),
remont VARCHAR(50),
additional_amenities TEXT[],
minuts_for_park SMALLINT,
minuts_for_hospital SMALLINT,
minuts_for_mall SMALLINT,
minuts_for_kindergarten SMALLINT,
minuts_for_school SMALLINT,
minuts_for_store SMALLINT,
minuts_for_busstop SMALLINT,
minuts_for_subway SMALLINT,
kids BOOLEAN DEFAULT FALSE,
animals BOOLEAN DEFAULT FALSE,
smoking BOOLEAN DEFAULT FALSE,
sanuzel VARCHAR(50),
multimedia TEXT[],
count_of_guests SMALLINT,
description TEXT,
year_of_construction SMALLINT,
count_of_passenger_elevators SMALLINT,
count_of_freight_elevators SMALLINT,
furniture TEXT[],
technique TEXT[]"""

i = 0
for elem in a.split("\n"):
    var = elem.split()[0]
    print(f'"{var}": {var},')
    i += 1

    def getMatrixAndSummaByBudget(app, budget_min, budget_max): # Составление матрицы весов для критерия "Бюджет"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT price FROM apartment_data WHERE type_sdelki = 1")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for j in range(N)] for i in range(N)]
        
        if budget_min == budget_max == -1:
            summa = [N for i in range(N)]
            return matrix, summa
        summa = [1 for i in range(N)]

        for i in range(N):
            for j in range(i, N):
                if i == j:
                    continue

                price_i = apartments[i][0]
                price_j = apartments[j][0]
                if price_i < price_j:
                    weight = getWeightByBudget(price_i, price_j, budget_min, budget_max)
                    matrix[i][j] = weight[0]
                    matrix[j][i] = weight[1]
                else:
                    weight = getWeightByBudget(price_j, price_i, budget_min, budget_max)
                    matrix[i][j] = weight[1]
                    matrix[j][i] = weight[0]
                summa[j] += matrix[i][j]
                summa[i] += matrix[j][i]
        return matrix, summa
    finally:
        app.connection_pool.putconn(conn)


def getWeightByBudget(price_i, price_j, budget_min, budget_max):
    try:
        if price_i == price_j: return [1, 1]
        if price_j <= budget_min:
            difference = budget_min / (price_j - price_i)
            if difference < 2:
                return [1 / 3, 3]
            elif difference < 4:
                return [1 / 2, 2]
            else:
                return [1, 1]
        elif price_i >= budget_max:
            difference = budget_max / (price_j - price_i)
            if difference > 10:
                return [1, 1]
            elif difference > 4:
                return [3, 1 / 3]
            else:
                return [5, 1 / 5]
        elif budget_min <= price_i <= price_j <= budget_max:
            difference = (price_j - price_i) / (budget_max + budget_min) * 2
            if difference < 2:
                return [7, 1 / 7]
            elif difference < 3:
                return [5, 1 / 5]
            elif difference < 4:
                return [4, 1 / 4]
            elif difference < 5:
                return [3, 1 / 3]
            else:
                return [1, 1]
        else:
            if price_i <= budget_min <= budget_max <= price_j:
                return [3, 1 / 3]
            elif price_i <= budget_min:
                return [1 / 8, 8]
            else:
                return [9, 1 / 9]
    except Exception as e:
        print(f"[ERROR] Calculating Budget: {e}")
        return [1, 1]