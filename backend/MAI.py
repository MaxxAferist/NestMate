# from app import Application
import numpy as np


def getSortedApartments(app, flat_preferences: dict, type_sdelki: int):
    matrix_priorities = []
    priorities = flat_preferences.get("priorities")
    vector_priorities = []
    for priority in priorities.keys():
        try:
            vector_priorities.append(priorities.get(priority))
            if priority == "budget":
                budget_min = flat_preferences.get("budgetMin")
                budget_max = flat_preferences.get("budgetMax")
                budget_min = int(budget_min) if budget_min.isdigit() else -1
                budget_max = int(budget_max) if budget_max.isdigit() else -1
                matrix, summa = getMatrixAndSummaByBudget(app, budget_min, budget_max)
            elif priority == "area":
                area_min = flat_preferences.get("areaMin")
                area_max = flat_preferences.get("areaMax")
                area_min = int(area_min) if area_min.isdigit() else -1
                area_max = int(area_max) if area_max.isdigit() else -1
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
                floor_min = int(floor_min) if floor_min.isdigit() else -1
                floor_max = int(floor_max) if floor_max.isdigit() else -1
                matrix, summa = getMatrixAndSummaByFloor(app, floor_min, floor_max)
            elif priority == "floorsInBuilding":
                floor_count_min = flat_preferences.get("floorsInBuildingMin")
                floor_count_max = flat_preferences.get("floorsInBuildingMax")
                floor_count_min = int(floor_count_min) if floor_count_min.isdigit() else -1
                floor_count_max = int(floor_count_max) if floor_count_max.isdigit() else -1
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
        except Exception as e:
            print(f"[MAI ERROR] Error: {e}")
    
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
        result_priorities = np.dot(np.array(matrix_priorities).T, np.array(vector_priorities))
        for i in range(len(result_priorities)):
            apartments[i] = [apartments[i][0], result_priorities[i]]
        apartments.sort(key=lambda x: x[1], reverse=True)
        return apartments
    except Exception as e:
        print(f"[ERROR] Error: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByBudget(app, budget_min, budget_max): # Составление матрицы весов для критерия "Бюджет"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT price FROM apartment_data WHERE type_sdelki = 0")
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


def getMatrixAndSummaByArea(app, area_min, area_max): # Составление матрицы весов для критерия "Площадь"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT area FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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

                area_i = apartments[i][0]
                area_j = apartments[j][0]
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
    finally:
        app.connection_pool.putconn(conn)


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
        

def getMatrixAndSummaByRoomCount(app, room_count): # Составление матрицы весов для критерия "Кол-во комнат"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT count_rooms FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        if room_count == []:
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]

        for i in range(N):
            for j in range(i, N):
                if i == j:
                    continue
                count_i = apartments[i][0]
                count_j = apartments[j][0]

                if count_i in room_count and count_j in room_count:
                    matrix[i][j] = 1
                    matrix[j][i] = 1
                elif count_i in room_count:
                    matrix[i][j] = 9
                    matrix[j][i] = 1 / 9
                else:
                    matrix[i][j] = 1 / 9
                    matrix[j][i] = 9

                summa[j] += matrix[i][j]
                summa[i] += matrix[j][i]
        return matrix, summa
    finally:
        app.connection_pool.putconn(conn)



def getMatrixAndSummaByApartmentType(app, apartment_type): # Составление матрицы весов для критерия "Вторичка/"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT type_apartment FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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
                apartment_type_i = apartments[i][0]
                apartment_type_j = apartments[j][0]

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
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByBalconyType(app, balcony_type): # Составление матрицы весов для критерия "Балкон/Лоджия"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT balcony FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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
                balcony_type_i = apartments[i][0]
                balcony_type_j = apartments[j][0]

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
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByCeilingHeight(app, height): # Составление матрицы весов для критерия "Высота потолков"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT ceiling_height FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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
                height_i = apartments[i][0]
                height_j = apartments[j][0]

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
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByFloor(app, floor_min, floor_max): # Составление матрицы весов для критерия "Этаж"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT floor FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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

                floor_i = apartments[i][0]
                floor_j = apartments[j][0]
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
    finally:
        app.connection_pool.putconn(conn)


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


def getMatrixAndSummaByFloorCount(app, floor_count_min, floor_count_max): # Составление матрицы весов для критерия "Кол-во этажей"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT count_floors FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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

                floor_count_i = apartments[i][0]
                floor_count_j = apartments[j][0]
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
    finally:
        app.connection_pool.putconn(conn)


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
    

def getMatrixAndSummaByHouseMaterial(app, material): # Составление матрицы весов для критерия "Материал дома"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT material_house FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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
                material_i = apartments[i][0]
                material_j = apartments[j][0]

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
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByRenovationCondition(app, renovation_condition): # Составление матрицы весов для критерия "Ремонт"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT remont FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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
                renovation_condition_i = apartments[i][0]
                renovation_condition_j = apartments[j][0]

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
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByAmenities(app, amenities): # Составление матрицы весов для критерия "Дополнения"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT additional_amenities, furniture, technique FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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
                amenties_i[0] = amenties_i[0].split(", ")
                amenties_j = apartments[j]
                amenties_j[0] = amenties_j[0].split(", ")

                amenties_i[0].extend(amenties_i[1].split(", "))
                amenties_i[0].extend(amenties_i[2].split(", "))
                amenties_i = amenties_i[0]
                set_amen_i = set(amenties_i)

                amenties_j[0].extend(amenties_j[1].split(", "))
                amenties_j[0].extend(amenties_j[2].split(", "))
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
    finally:
        app.connection_pool.putconn(conn)


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


def getMatrixAndSummaByInfrastructure(app, infrastructure): # Составление матрицы весов для критерия "Инфраструктура"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT (minuts_for_park, minuts_for_hospital, minuts_for_mall, minuts_for_store, minuts_for_school, minuts_for_kindergarten) FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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
                infrastructure_i = apartments[i][0]
                infrastructure_j = apartments[j][0]

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
    finally:
        app.connection_pool.putconn(conn)


def getWeightByInfrastructure(count_i, count_j, sum_minuts):
    if count_i == count_j: return [1, 1]
    difference = sum_minuts / (count_j - count_i)
    if difference < 2: return [9, 1 / 9]
    elif difference < 4: return [7, 1 / 7]
    elif difference < 6: return [5, 1 / 5]
    elif difference < 8: return [3, 1 / 3]
    else: return [1, 1]


def getMatrixAndSummaByTransport(app, transport): # Составление матрицы весов для критерия "Транспортная доступность"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT (minuts_for_busstop, minuts_for_subway) FROM apartment_data WHERE type_sdelki = 0")
            apartments = cursor.fetchall()
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
                transport_i = apartments[i][0]
                transport_j = apartments[j][0]

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
    finally:
        app.connection_pool.putconn(conn)


def getWeightByTransport(count_i, count_j, sum_minuts):
    if count_i == count_j: return [1, 1]
    difference = sum_minuts / (count_j - count_i)
    if difference < 2: return [9, 1 / 9]
    elif difference < 4: return [7, 1 / 7]
    elif difference < 6: return [5, 1 / 5]
    elif difference < 8: return [3, 1 / 3]
    else: return [1, 1]
