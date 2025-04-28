from app import Application
import numpy as np


def getSortedApartments(app: Application, flat_preferences: dict):
    matrix_priorities = []
    priorities = flat_preferences.get("priorities")
    vector_priorities = []
    for priority in priorities.keys():
        vector_priorities.append(priorities.get(priority))
        if priority == "budget":
            budget_min = flat_preferences.get("budgetMin")
            budget_max = flat_preferences.get("budgetMax")
            matrix, summa = getMatrixAndSummaByBudget(app, budget_min, budget_max)
        elif priority == "area":
            area_min = flat_preferences.get("areaMin")
            area_max = flat_preferences.get("areaMax")
            matrix, summa = getMatrixAndSummaByArea(app, area_min, area_max)
        elif priority == "roomCount":
            room_count = flat_preferences.get("roomCount")
            matrix, summa = getMatrixAndSummaByRoomCount(app, room_count)
        elif priority == "apartmentType":
            apartment_type = flat_preferences.get("apartmentType")
            matrix, summa = getMatrixAndSummaByApartmentType(app, apartment_type)
        elif priority == "balconyType":
            balcony_type = flat_preferences.get("balconyType")
            matrix, summa = getMatrixAndSummaByBalconyType(app, balcony_type)
        elif priority == "ceilingHeight":
            height = flat_preferences.get("ceilingHeight")
            matrix, summa = getMatrixAndSummaByCeilingHeight(app, height)
        elif priority == "floor":
            floor_min = flat_preferences.get("minFloor")
            floor_max = flat_preferences.get("maxFloor")
            matrix, summa = getMatrixAndSummaByFloor(app, floor_min, floor_max)
        elif priority == "floorsInBuilding":
            floor_count_min = flat_preferences.get("floorsInBuildingMin")
            floor_count_max = flat_preferences.get("floorsInBuildingMax")
            matrix, summa = getMatrixAndSummaByFloorCount(app, floor_count_min, floor_count_max)
        elif priority == "houseMaterial":
            material = flat_preferences.get("houseMaterial")
            matrix, summa = getMatrixAndSummaByHouseMaterial(app, material)
        elif priority == "renovationCondition":
            renovation_condition = flat_preferences.get("renovationCondition")
            matrix, summa = getMatrixAndSummaByRenovationCondition(app, renovation_condition)
        elif priority == "amenities":
            amenities = flat_preferences.get("amenities")
            matrix, summa = getMatrixAndSummaByAmenities(app, amenities)
        elif priority == "infrastructure":
            infrastructure = flat_preferences.get("infrastructure")
            matrix, summa = getMatrixAndSummaByInfrastructure(app, infrastructure)
        elif priority == "transportAccessibility":
            transport = flat_preferences.get("transportAccessibility")
            matrix, summa = getMatrixAndSummaByTransport(app, transport)
        else:
            print(f"[ERROR] unexpected = {priority}")
        
        matrix = np.array(matrix) / np.array(summa)
        vector = matrix.mean(axis = 1)
        matrix_priorities.append(vector)
    result_priorities = np.dot(np.array(matrix_priorities), np.array(vector_priorities))


def getMatrixAndSummaByBudget(app: Application, budget_min, budget_max): # Составление матрицы весов для критерия "Бюджет"
    app.cursor_apartments.execute("SELECT price FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
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

            price_i = apartments[i]
            price_j = apartments[j]
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


def getMatrixAndSummaByArea(app: Application, area_min, area_max): # Составление матрицы весов для критерия "Площадь"
    app.cursor_apartments.execute("SELECT area FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for j in range(N)] for i in range(N)]
    
    if area_min == area_max == -1:
        summa = [N for i in range(N)]
        return matrix, summa
    summa = [1 for i in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue

            area_i = apartments[i]
            area_j = apartments[j]
            if area_i < area_j:
                weight = getWeightByArea(area_i, area_j, area_min, area_max)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
            else:
                weight = getWeightByArea(area_j, area_i, area_min, area_max)
                matrix[i][j] = weight[1]
                matrix[j][i] = weight[0]
            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getWeightByArea(area_i, area_j, area_min, area_max):
    try:
        if area_i == area_j: return [1, 1]
        if area_j <= area_min:
            difference = area_min / (area_j - area_i)
            if difference < 2:
                return [1 / 3, 3]
            elif difference < 4:
                return [1 / 2, 2]
            else:
                return [1, 1]
        elif area_i >= area_max:
            difference = area_max / (area_j - area_i)
            if difference > 10:
                return [1, 1]
            elif difference > 4:
                return [3, 1 / 3]
            else:
                return [5, 1 / 5]
        elif area_min <= area_i <= area_j <= area_max:
            difference = (area_j - area_i) / (area_max + area_min) * 2
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
            if area_i <= area_min <= area_max <= area_j:
                return [3, 1 / 3]
            elif area_i <= area_min:
                return [1 / 8, 8]
            else:
                return [9, 1 / 9]
    except Exception as e:
        print(f"[ERROR] Calculating Area: {e}")
        return [1, 1]
        

def getMatrixAndSummaByRoomCount(app: Application, room_count): # Составление матрицы весов для критерия "Кол-во комнат"
    app.cursor_apartments.execute("SELECT count_rooms FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for _ in range(N)] for _ in range(N)]
    if room_count == -1:
        summa = [N for _ in range(N)]
        return matrix, summa
    summa = [1 for _ in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue
            count_i = abs(apartments[i] - count_i)
            count_j = abs(apartments[j] - count_j)
            if count_i < count_j:
                weight = getWeightByRoomCount(count_i, count_j)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
            else:
                weight = getWeightByRoomCount(count_j, count_i)
                matrix[i][j] = weight[1]
                matrix[j][i] = weight[0]
            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getWeightByRoomCount(count_i, count_j):
    if count_i == count_j: return [1, 1]
    difference = count_j - count_i
    if difference < 2: return [2, 1 / 2]
    elif difference < 3: return [3, 1 / 3]
    elif difference < 4: return [4, 1 / 4]
    elif difference < 5: return [5, 1 / 5]
    else: return [6, 1 / 6]


def getMatrixAndSummaByApartmentType(app: Application, apartment_type): # Составление матрицы весов для критерия "Вторичка/"
    app.cursor_apartments.execute("SELECT type_apartment FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for _ in range(N)] for _ in range(N)]
    if apartment_type == "неважно":
        summa = [N for _ in range(N)]
        return matrix, summa
    summa = [1 for _ in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue
            apartment_type_i = apartments[i]
            apartment_type_j = apartments[j]

            if apartment_type_i == apartment_type_j:
                matrix[i][j] = 1
                matrix[j][i] = 1
            elif apartment_type_i == apartment_type:
                matrix[i][j] = 9
                matrix[j][i] = 1 / 9
            else:
                matrix[i][j] = 1 / 9
                matrix[j][i] = 9

            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getMatrixAndSummaByBalconyType(app: Application, balcony_type): # Составление матрицы весов для критерия "Балкон/Лоджия"
    app.cursor_apartments.execute("SELECT balcony FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for _ in range(N)] for _ in range(N)]
    if balcony_type == "неважно":
        summa = [N for _ in range(N)]
        return matrix, summa
    summa = [1 for _ in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue
            balcony_type_i = apartments[i]
            balcony_type_j = apartments[j]

            if balcony_type_i == balcony_type_j:
                matrix[i][j] = 1
                matrix[j][i] = 1
            elif balcony_type_i == balcony_type:
                matrix[i][j] = 9
                matrix[j][i] = 1 / 9
            else:
                matrix[i][j] = 1 / 9
                matrix[j][i] = 9

            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getMatrixAndSummaByCeilingHeight(app: Application, height): # Составление матрицы весов для критерия "Высота потолков"
    app.cursor_apartments.execute("SELECT ceiling_height FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for _ in range(N)] for _ in range(N)]
    if height == "неважно":
        summa = [N for _ in range(N)]
        return matrix, summa
    summa = [1 for _ in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue
            height_i = apartments[i]
            height_j = apartments[j]

            if height_i == height_j:
                matrix[i][j] = 1
                matrix[j][i] = 1
            elif height_i == height:
                matrix[i][j] = 9
                matrix[j][i] = 1 / 9
            elif height_j == height:
                matrix[i][j] = 1 / 9
                matrix[j][i] = 9
            else:
                matrix[i][j] = 1
                matrix[j][i] = 1

            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getMatrixAndSummaByFloor(app: Application, floor_min, floor_max): # Составление матрицы весов для критерия "Этаж"
    app.cursor_apartments.execute("SELECT floor FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for j in range(N)] for i in range(N)]
    
    if floor_min == floor_max == -1:
        summa = [N for i in range(N)]
        return matrix, summa
    summa = [1 for i in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue

            floor_i = apartments[i]
            floor_j = apartments[j]
            if floor_i < floor_j:
                weight = getWeightByFloor(floor_i, floor_j, floor_min, floor_max)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
            else:
                weight = getWeightByFloor(floor_j, floor_i, floor_min, floor_max)
                matrix[i][j] = weight[1]
                matrix[j][i] = weight[0]
            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getWeightByFloor(floor_i, floor_j, floor_min, floor_max):
    try:
        if floor_i == floor_j: return [1, 1]
        if floor_j < floor_min:
            difference = floor_min / (floor_j - floor_i)
            if difference < 2:
                return [1 / 3, 3]
            elif difference < 4:
                return [1 / 2, 2]
            else:
                return [1, 1]
        elif floor_i > floor_max:
            difference = floor_max / (floor_j - floor_i)
            if difference > 10:
                return [1, 1]
            elif difference > 4:
                return [3, 1 / 3]
            else:
                return [5, 1 / 5]
        elif floor_min < floor_i < floor_j < floor_max:
            difference = (floor_j - floor_i) / (floor_max + floor_min) * 2
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
            if floor_i < floor_min < floor_max < floor_j:
                return [3, 1 / 3]
            elif floor_i < floor_min:
                return [1 / 8, 8]
            else:
                return [9, 1 / 9]
    except Exception as e:
        print(f"[ERROR] Calculating Floor: {e}")
        return [1, 1]


def getMatrixAndSummaByFloorCount(app: Application, floor_count_min, floor_count_max): # Составление матрицы весов для критерия "Кол-во этажей"
    app.cursor_apartments.execute("SELECT count_floors FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for j in range(N)] for i in range(N)]
    
    if floor_count_min == floor_count_max == -1:
        summa = [N for i in range(N)]
        return matrix, summa
    summa = [1 for i in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue

            floor_count_i = apartments[i]
            floor_count_j = apartments[j]
            if floor_count_i < floor_count_j:
                weight = getWeightByFloorCount(floor_count_i, floor_count_j, floor_count_min, floor_count_max)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
            else:
                weight = getWeightByFloorCount(floor_count_j, floor_count_i, floor_count_min, floor_count_max)
                matrix[i][j] = weight[1]
                matrix[j][i] = weight[0]
            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getWeightByFloorCount(floor_count_i, floor_count_j, floor_count_min, floor_count_max):
    try:
        if floor_count_i == floor_count_j: return [1, 1]
        if floor_count_j < floor_count_min:
            difference = floor_count_min / (floor_count_j - floor_count_i)
            if difference < 2:
                return [1 / 3, 3]
            elif difference < 4:
                return [1 / 2, 2]
            else:
                return [1, 1]
        elif floor_count_i > floor_count_max:
            difference = floor_count_max / (floor_count_j - floor_count_i)
            if difference > 10:
                return [1, 1]
            elif difference > 4:
                return [3, 1 / 3]
            else:
                return [5, 1 / 5]
        elif floor_count_min < floor_count_i < floor_count_j < floor_count_max:
            difference = (floor_count_j - floor_count_i) / (floor_count_max + floor_count_min) * 2
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
            if floor_count_i < floor_count_min < floor_count_max < floor_count_j:
                return [3, 1 / 3]
            elif floor_count_i < floor_count_min:
                return [1 / 8, 8]
            else:
                return [9, 1 / 9]
    except Exception as e:
        print(f"[ERROR] Calculating Floor Count: {e}")
        return [1, 1]
    

def getMatrixAndSummaByHouseMaterial(app: Application, material): # Составление матрицы весов для критерия "Материал дома"
    app.cursor_apartments.execute("SELECT material_house FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for _ in range(N)] for _ in range(N)]
    if material == []:
        summa = [N for _ in range(N)]
        return matrix, summa
    summa = [1 for _ in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue
            material_i = apartments[i]
            material_j = apartments[j]

            if material_i in material and material_j in material:
                matrix[i][j] = 1
                matrix[j][i] = 1
            elif material_i in material:
                matrix[i][j] = 9
                matrix[j][i] = 1 / 9
            else:
                matrix[i][j] = 1 / 9
                matrix[j][i] = 9

            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]

    return matrix, summa


def getMatrixAndSummaByRenovationCondition(app: Application, renovation_condition): # Составление матрицы весов для критерия "Ремонт"
    app.cursor_apartments.execute("SELECT remont FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for _ in range(N)] for _ in range(N)]
    if renovation_condition == "неважно":
        summa = [N for _ in range(N)]
        return matrix, summa
    summa = [1 for _ in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue
            renovation_condition_i = apartments[i]
            renovation_condition_j = apartments[j]

            if renovation_condition_i == renovation_condition_j:
                matrix[i][j] = 1
                matrix[j][i] = 1
            elif renovation_condition_i == renovation_condition:
                matrix[i][j] = 9
                matrix[j][i] = 1 / 9
            else:
                matrix[i][j] = 1 / 9
                matrix[j][i] = 9

            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getMatrixAndSummaByAmenities(app: Application, amenities): # Составление матрицы весов для критерия "Дополнения"
    app.cursor_apartments.execute("SELECT (additional_amenities, furniture, technique) FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for _ in range(N)] for _ in range(N)]
    if amenities == []:
        summa = [N for _ in range(N)]
        return matrix, summa
    summa = [1 for _ in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue
            amenties_i = apartments[i]
            amenties_j = apartments[j]

            amenties_i[0].extend(amenties_i[1])
            amenties_i[0].extend(amenties_i[2])
            amenties_i = amenties_i[0]
            set_amen_i = set(amenties_i)
            amenties_j[0].extend(amenties_j[1])
            amenties_j[0].extend(amenties_j[2])
            amenties_j = amenties_j[0]
            set_amen_j = set(amenties_j)
            count_i = sum([1 for x in amenities if x not in set_amen_i])
            count_j = sum([1 for x in amenities if x not in set_amen_j])

            if count_i < count_j:
                weight = getWeightByAmenties(count_i, count_j)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
            else:
                weight = getWeightByAmenties(count_j, count_i)
                matrix[i][j] = weight[1]
                matrix[j][i] = weight[0]
            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getWeightByAmenties(count_i, count_j):
    if count_i == count_j: return [1, 1]
    difference = count_j - count_i
    if difference < 2: return [2, 1 / 2]
    elif difference < 3: return [3, 1 / 3]
    elif difference < 4: return [4, 1 / 4]
    elif difference < 5: return [5, 1 / 5]
    elif difference < 6: return [6, 1 / 6]
    elif difference < 7: return [7, 1 / 7]
    elif difference < 8: return [8, 1 / 8]
    else: return [9, 1 / 9]


def getMatrixAndSummaByInfrastructure(app: Application, infrastructure): # Составление матрицы весов для критерия "Инфраструктура"
    app.cursor_apartments.execute("SELECT (minuts_for_park, minuts_for_hospital, minuts_for_mall, minuts_for_store, minuts_for_school, minuts_for_kindergarten) FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for _ in range(N)] for _ in range(N)]
    if sum(infrastructure.values()) == 0:
        summa = [N for _ in range(N)]
        return matrix, summa
    summa = [1 for _ in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue
            infrastructure_i = apartments[i]
            infrastructure_j = apartments[j]

            count_i = 0
            count_j = 0
            i = 0
            sum_minuts = 0
            for key in infrastructure:
                if infrastructure[key]:
                    count_i += infrastructure_i[i]
                    count_j += infrastructure_j[i]
                    sum_minuts += infrastructure[key]
            count_i = sum_minuts - count_i
            count_j = sum_minuts - count_j

            if count_i < count_j:
                weight = getWeightByInfrastructure(count_i, count_j, sum_minuts)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
            else:
                weight = getWeightByInfrastructure(count_j, count_i, sum_minuts)
                matrix[i][j] = weight[1]
                matrix[j][i] = weight[0]
            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getWeightByInfrastructure(count_i, count_j, sum_minuts):
    if count_i == count_j: return [1, 1]
    difference = sum_minuts / (count_j - count_i)
    if difference < 2: return [9, 1 / 9]
    elif difference < 4: return [7, 1 / 7]
    elif difference < 6: return [5, 1 / 5]
    elif difference < 8: return [3, 1 / 3]
    else: return [1, 1]


def getMatrixAndSummaByTransport(app: Application, transport): # Составление матрицы весов для критерия "Транспортная доступность"
    app.cursor_apartments.execute("SELECT (minuts_for_busstop, minuts_for_subway) FROM apartment_data WHERE type_sdelki = 0")
    apartments = app.cursor_apartments.fetchall()
    N = len(apartments)
    matrix = [[1 for _ in range(N)] for _ in range(N)]
    if sum(transport.values()) == 0:
        summa = [N for _ in range(N)]
        return matrix, summa
    summa = [1 for _ in range(N)]

    for i in range(N):
        for j in range(i, N):
            if i == j:
                continue
            transport_i = apartments[i]
            transport_j = apartments[j]

            count_i = 0
            count_j = 0
            i = 0
            sum_minuts = 0
            for key in transport:
                if transport[key]:
                    count_i += transport_i[i]
                    count_j += transport_j[i]
                    sum_minuts += transport[key]
            count_i = sum_minuts - count_i
            count_j = sum_minuts - count_j

            if count_i < count_j:
                weight = getWeightByTransport(count_i, count_j, sum_minuts)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
            else:
                weight = getWeightByTransport(count_j, count_i, sum_minuts)
                matrix[i][j] = weight[1]
                matrix[j][i] = weight[0]
            summa[j] += matrix[i][j]
            summa[i] += matrix[j][i]
    return matrix, summa


def getWeightByTransport(count_i, count_j, sum_minuts):
    if count_i == count_j: return [1, 1]
    difference = sum_minuts / (count_j - count_i)
    if difference < 2: return [9, 1 / 9]
    elif difference < 4: return [7, 1 / 7]
    elif difference < 6: return [5, 1 / 5]
    elif difference < 8: return [3, 1 / 3]
    else: return [1, 1]
