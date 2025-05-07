# from app import Application
import numpy as np
import math


def getSortedApartments(app, flat_preferences: dict, rent_preferences, type_sdelki: int):
    matrix_priorities = []
    if type_sdelki == 0:
        priorities = flat_preferences.get("priorities")
    else:
        priorities = rent_preferences.get("priorities")
    if not priorities:
        print(f"priorities: {priorities}")
        return []
    vector_priorities = []
    for priority in priorities.keys():
        try:
            vector_priorities.append(priorities.get(priority))
            if priority == "budget":
                budget_min = flat_preferences.get("budgetMin")
                budget_max = flat_preferences.get("budgetMax")
                budget_min = int(budget_min) if budget_min.isdigit() else -1
                budget_max = int(budget_max) if budget_max.isdigit() else -1
                matrix, summa = getMatrixAndSummaByBudget(app, budget_min, budget_max, type_sdelki)
            elif priority == "area":
                area_min = flat_preferences.get("areaMin")
                area_max = flat_preferences.get("areaMax")
                area_min = int(area_min) if area_min.isdigit() else -1
                area_max = int(area_max) if area_max.isdigit() else -1
                matrix, summa = getMatrixAndSummaByArea(app, area_min, area_max, type_sdelki)
            elif priority == "roomCount":
                room_count = flat_preferences.get("roomCount")
                matrix, summa = getMatrixAndSummaByRoomCount(app, room_count, type_sdelki)
            elif priority == "apartmentType":
                apartment_type = flat_preferences.get("apartmentType")
                matrix, summa = getMatrixAndSummaByApartmentType(app, apartment_type, type_sdelki)
            elif priority == "balconyType":
                balcony_type = flat_preferences.get("balconyType")
                matrix, summa = getMatrixAndSummaByBalconyType(app, balcony_type, type_sdelki)
            elif priority == "ceilingHeight":
                height = flat_preferences.get("ceilingHeight")
                matrix, summa = getMatrixAndSummaByCeilingHeight(app, height, type_sdelki)
            elif priority == "floor":
                floor_min = flat_preferences.get("minFloor")
                floor_max = flat_preferences.get("maxFloor")
                floor_min = int(floor_min) if floor_min.isdigit() else -1
                floor_max = int(floor_max) if floor_max.isdigit() else -1
                matrix, summa = getMatrixAndSummaByFloor(app, floor_min, floor_max, type_sdelki)
            elif priority == "floorsInBuilding":
                floor_count_min = flat_preferences.get("floorsInBuildingMin")
                floor_count_max = flat_preferences.get("floorsInBuildingMax")
                floor_count_min = int(floor_count_min) if floor_count_min.isdigit() else -1
                floor_count_max = int(floor_count_max) if floor_count_max.isdigit() else -1
                matrix, summa = getMatrixAndSummaByFloorCount(app, floor_count_min, floor_count_max, type_sdelki)
            elif priority == "houseMaterial":
                material = flat_preferences.get("houseMaterial")
                matrix, summa = getMatrixAndSummaByHouseMaterial(app, material, type_sdelki)
            elif priority == "renovationCondition":
                renovation_condition = flat_preferences.get("renovationCondition")
                matrix, summa = getMatrixAndSummaByRenovationCondition(app, renovation_condition, type_sdelki)
            elif priority == "amenities":
                amenities = flat_preferences.get("amenities")
                matrix, summa = getMatrixAndSummaByAmenities(app, amenities, type_sdelki)
            elif priority == "infrastructure":
                infrastructure = flat_preferences.get("infrastructure")
                matrix, summa = getMatrixAndSummaByInfrastructure(app, infrastructure, type_sdelki)
            elif priority == "transportAccessibility":
                transport = flat_preferences.get("transportAccessibility")
                matrix, summa = getMatrixAndSummaByTransport(app, transport, type_sdelki)
            elif priority == "rentPayment":
                budget_min = rent_preferences.get("rentPayment").get("rentPriceMin")
                budget_max = rent_preferences.get("rentPayment").get("rentPriceMax")
                budget_min = int(budget_min) if budget_min.isdigit() else -1
                budget_max = int(budget_max) if budget_max.isdigit() else -1
                matrix, summa = getMatrixAndSummaByBudget(app, budget_min, budget_max, type_sdelki)
            elif priority == "rentalTerms":
                rental_terms = rent_preferences.get("rentalTerms")
                matrix, summa = getMatrixAndSummaByRentalTerms(app, rental_terms, type_sdelki)
            elif priority == "numberOfBeds":
                number_of_beds = rent_preferences.get("numberOfBeds", "")
                number_of_beds = int(number_of_beds) if number_of_beds.isdigit() else -1
                matrix, summa = getMatrixAndSummaByNumberOfBeds(app, number_of_beds, type_sdelki)
            else:
                print(f"[ERROR] unexpected = {priority}")
            
            matrix = np.array(matrix) / np.array(summa)
            vector = matrix.mean(axis = 1)
            # if priority == "numberOfBeds":
            #     conn = app.connection_pool.getconn()
            #     with conn.cursor() as cursor:
            #         cursor.execute("SELECT id, count_of_guests FROM apartment_data WHERE type_sdelki = 1")
            #         apartments = cursor.fetchall()
            #     a = []
            #     for i in range(len(apartments)):
            #         a.append([apartments[i][0], apartments[i][1], vector[i]])
            #     a.sort(key=lambda x: x[2], reverse=True)
            #     for elem in a:
            #         print(f"{elem[0]}\t{elem[1]}\t{elem[2]}")
            matrix_priorities.append(vector)
        except Exception as e:
            print(f"[MAI ERROR] Error: {e}")
    
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT id FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        
        result_priorities = list(np.dot(np.array(matrix_priorities).T, np.array(vector_priorities)))
        
        for i in range(len(result_priorities)):
            apartments[i] = [apartments[i][0], result_priorities[i]]
        apartments.sort(key=lambda x: x[1], reverse=True)
        return apartments
    except Exception as e:
        print(f"[ERROR] Error: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByBudget(app, budget_min, budget_max, type_sdelki): # Составление матрицы весов для критерия "Бюджет"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT price FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for j in range(N)] for i in range(N)]
        
        if budget_min == budget_max == -1:
            summa = [N for i in range(N)]
            return matrix, summa
        summa = [1 for i in range(N)]

        for i in range(N):
            for j in range(i + 1, N):
                price_i = apartments[i][0]
                price_j = apartments[j][0]
                weight = getWeightByBudget(price_i, price_j, budget_min, budget_max)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]

                summa[j] += weight[0]
                summa[i] += weight[1]
        return matrix, summa
    finally:
        app.connection_pool.putconn(conn)


def getWeightByBudget(price_i, price_j, budget_min, budget_max):
    try:
        if price_i == price_j: return [1, 1]
        if budget_max == budget_min:
            budget_min -= 1000
            budget_max += 1000
        if budget_min < 0: budget_min = 0
        if price_i < budget_min:
            koef_i = 0.5 * price_i / (budget_min + 0.001)
        elif price_i > budget_max:
            koef_i = 0.5 * budget_max / (price_i + 0.001)
        else:
            koef_i = 0.5 + 0.5 * (1 - (price_i - budget_min) / (budget_max - budget_min + 0.001))
        if price_j < budget_min:
            koef_j = 0.5 * price_j / (budget_min + 0.001)
        elif price_j > budget_max:
            koef_j = 0.5 * budget_max / (price_j + 0.0001)
        else:
            koef_j = 0.5 + 0.5 * (1 - (price_j - budget_min) / (budget_max - budget_min + 0.001))
        return to_saaty_weight(koef_i / (koef_j + 0.001), koef_j / (koef_i + 0.001))
    except Exception as e:
        print(f"[ERROR] Calculating Budget: {e}")
        return [1, 1]


def getMatrixAndSummaByArea(app, area_min, area_max, type_sdelki): # Составление матрицы весов для критерия "Площадь"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT area FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for j in range(N)] for i in range(N)]
        
        if area_min == area_max == -1:
            summa = [N for i in range(N)]
            return matrix, summa
        summa = [1 for i in range(N)]

        for i in range(N):
            for j in range(i + 1, N):
                area_i = apartments[i][0]
                area_j = apartments[j][0]
                weight = getWeightByArea(area_i, area_j, area_min, area_max)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]

                summa[j] += weight[0]
                summa[i] += weight[1]
        return matrix, summa
    finally:
        app.connection_pool.putconn(conn)


def getWeightByArea(area_i, area_j, area_min, area_max):
    try:
        if area_i == area_j: return [1, 1]
        if area_i < area_min:
            koef_i = 0.5 * area_i / (area_min + 0.001)
        elif area_i > area_max:
            koef_i = 0.5 * area_max / (area_i + 0.001)
        else:
            koef_i = 0.5 + 0.5 * (1 - (area_i - area_min) / (area_max - area_min + 0.001))
        if area_j < area_min:
            koef_j = 0.5 * area_j / (area_min + 0.001)
        elif area_j > area_max:
            koef_j = 0.5 * area_max / (area_j + 0.001)
        else:
            koef_j = 0.5 + 0.5 * (1 - (area_j - area_min) / (area_max - area_min + 0.001))
        return to_saaty_weight(koef_i / (koef_j + 0.001), koef_j / (koef_i + 0.001))
    except Exception as e:
        print(f"[ERROR] Calculating Area: {e}")
        return [1, 1]
        

def getMatrixAndSummaByRoomCount(app, room_count, type_sdelki): # Составление матрицы весов для критерия "Кол-во комнат"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT count_rooms FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        if room_count == []:
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]

        for i in range(N):
            for j in range(i + 1, N):
                count_i = apartments[i][0]
                count_j = apartments[j][0]

                if count_i in room_count and count_j in room_count:
                    matrix[i][j] = 1
                    matrix[j][i] = 1
                elif count_i in room_count:
                    matrix[i][j] = 9
                    matrix[j][i] = 1 / 9
                elif count_j in room_count:
                    matrix[i][j] = 1 / 9
                    matrix[j][i] = 9
                else:
                    matrix[i][j] = 1
                    matrix[j][i] = 1

                summa[j] += matrix[i][j]
                summa[i] += matrix[j][i]
        return matrix, summa
    except Exception as e:
        print(f"[ERROR] Calculating Room Count: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByApartmentType(app, apartment_type, type_sdelki): # Составление матрицы весов для критерия "Вторичка/"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT type_apartment FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        if apartment_type == "неважно":
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]

        if apartment_type == "новостройка":
            apartment_type = 0
        else:
            apartment_type = 1

        for i in range(N):
            for j in range(i + 1, N):
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
    except Exception as e:
        print(f"[ERROR] Calculating Apartment Type: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByBalconyType(app, balcony_type, type_sdelki): # Составление матрицы весов для критерия "Балкон/Лоджия"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT balcony FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        if balcony_type == "неважно":
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]
        balcony_type = balcony_type.capitalize()

        for i in range(N):
            for j in range(i + 1, N):
                balcony_type_i = apartments[i][0]
                balcony_type_j = apartments[j][0]

                if balcony_type_i == balcony_type_j:
                    matrix[i][j] = 1
                    matrix[j][i] = 1
                elif balcony_type_i == balcony_type:
                    matrix[i][j] = 9
                    matrix[j][i] = 1 / 9
                elif balcony_type_j == balcony_type:
                    matrix[i][j] = 1 / 9
                    matrix[j][i] = 9
                else:
                    matrix[i][j] = 1
                    matrix[j][i] = 1

                summa[j] += matrix[i][j]
                summa[i] += matrix[j][i]
        return matrix, summa
    except Exception as e:
        print(f"[ERROR] Calculating Balcony type: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByCeilingHeight(app, height, type_sdelki): # Составление матрицы весов для критерия "Высота потолков"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT ceiling_height FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        if height == "неважно":
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]
        height = float(height)

        for i in range(N):
            for j in range(i + 1, N):
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
    except Exception as e:
        print(f"[ERROR] Calculating ceiling height: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByFloor(app, floor_min, floor_max, type_sdelki): # Составление матрицы весов для критерия "Этаж"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT floor FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for j in range(N)] for i in range(N)]
        
        if floor_min == floor_max == -1:
            summa = [N for i in range(N)]
            return matrix, summa
        summa = [1 for i in range(N)]

        for i in range(N):
            for j in range(i + 1, N):
                floor_i = apartments[i][0]
                floor_j = apartments[j][0]

                weight = getWeightByFloor(floor_i, floor_j, floor_min, floor_max)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]

                summa[j] += weight[0]
                summa[i] += weight[1]
        return matrix, summa
    finally:
        app.connection_pool.putconn(conn)


def getWeightByFloor(floor_i, floor_j, floor_min, floor_max):
    try:
        if floor_i == floor_j: return [1, 1]
        if floor_i < floor_min:
            koef_i = floor_i / (floor_min + 0.001)
        elif floor_i > floor_max:
            koef_i = floor_max / (floor_i + 0.001)
        else:
            koef_i = 1
        if floor_j < floor_min:
            koef_j = floor_j / (floor_min + 0.001)
        elif floor_j > floor_max:
            koef_j = floor_max / (floor_j + 0.001)
        else:
            koef_j = 1
        
        return to_saaty_weight(koef_i / (koef_j + 0.001), koef_j / (koef_i + 0.001))
    except Exception as e:
        print(f"[ERROR] Calculating Floor: {e}")
        return [1, 1]


def getMatrixAndSummaByFloorCount(app, floor_count_min, floor_count_max, type_sdelki): # Составление матрицы весов для критерия "Кол-во этажей"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT count_floors FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        
        if floor_count_min == floor_count_max == -1:
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]

        for i in range(N):
            for j in range(i + 1, N):
                floor_count_i = apartments[i][0]
                floor_count_j = apartments[j][0]

                weight = getWeightByFloorCount(floor_count_i, floor_count_j, floor_count_min, floor_count_max)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]

                summa[j] += matrix[i][j]
                summa[i] += matrix[j][i]
        return matrix, summa
    finally:
        app.connection_pool.putconn(conn)


def getWeightByFloorCount(floor_count_i, floor_count_j, floor_count_min, floor_count_max):
    try:
        if floor_count_i == floor_count_j: return [1, 1]
        if floor_count_i < floor_count_min:
            koef_i = floor_count_i / (floor_count_min + 0.001)
        elif floor_count_i > floor_count_max:
            koef_i = floor_count_max / (floor_count_i + 0.001)
        else:
            koef_i = 1
        if floor_count_j < floor_count_min:
            koef_j = floor_count_j / (floor_count_min + 0.001)
        elif floor_count_j > floor_count_max:
            koef_j = floor_count_max / (floor_count_j + 0.001)
        else:
            koef_j = 1
        
        return to_saaty_weight(koef_i / (koef_j + 0.001), koef_j / (koef_i + 0.001))
    except Exception as e:
        print(f"[ERROR] Calculating Floor Count: {e}")
        return [1, 1]
    

def getMatrixAndSummaByHouseMaterial(app, material, type_sdelki): # Составление матрицы весов для критерия "Материал дома"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT material_house FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        if material == []:
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]

        for i in range(N):
            for j in range(i + 1, N):
                material_i = apartments[i][0]
                material_j = apartments[j][0]

                if material_i in material and material_j in material:
                    matrix[i][j] = 1
                    matrix[j][i] = 1
                elif material_i in material:
                    matrix[i][j] = 9
                    matrix[j][i] = 1 / 9
                elif material_j in material:
                    matrix[i][j] = 1 / 9
                    matrix[j][i] = 9
                else:
                    matrix[i][j] = 1
                    matrix[j][i] = 1

                summa[j] += matrix[i][j]
                summa[i] += matrix[j][i]
        return matrix, summa
    except Exception as e:
        print(f"[ERROR] Calculating house material: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByRenovationCondition(app, renovation_condition, type_sdelki): # Составление матрицы весов для критерия "Ремонт"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT remont FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        if renovation_condition == "неважно":
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]

        for i in range(N):
            for j in range(i + 1, N):
                renovation_condition_i = apartments[i][0]
                if renovation_condition_i == "":
                    renovation_condition_i = "требует ремонта"
                else:
                    renovation_condition_i = "новый"
                renovation_condition_j = apartments[j][0]
                if renovation_condition_j == "":
                    renovation_condition_j = "требует ремонта"
                else:
                    renovation_condition_j = "новый"

                if renovation_condition_i == renovation_condition_j:
                    matrix[i][j] = 1
                    matrix[j][i] = 1
                elif renovation_condition_i == renovation_condition:
                    matrix[i][j] = 9
                    matrix[j][i] = 1 / 9
                elif renovation_condition_j == renovation_condition:
                    matrix[i][j] = 1 / 9
                    matrix[j][i] = 9
                else:
                    matrix[i][j] = 1
                    matrix[j][i] = 1

                summa[j] += matrix[i][j]
                summa[i] += matrix[j][i]
        return matrix, summa
    except Exception as e:
        print(f"[ERROR] Calculating remont: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByAmenities(app, amenities, type_sdelki): # Составление матрицы весов для критерия "Дополнения"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT additional_amenities, furniture, technique FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        if amenities == []:
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]
        amenities = list(map(lambda x: x.lower(), amenities))
        ind = amenities.index("микроволновая печь")
        if ind != -1:
            amenities[ind] = "микроволновка"
        for i in range(N):
            for j in range(i + 1, N):
                amenities_i = list(apartments[i])
                amenities_i[0] = amenities_i[0][0].split(", ")
                amenities_j = list(apartments[j])
                amenities_j[0] = amenities_j[0][0].split(", ")

                amenities_i[0].extend(amenities_i[1][0].split(", "))
                amenities_i[0].extend(amenities_i[2][0].split(", "))
                amenities_i = amenities_i[0]
                set_amen_i = set(amenities_i)

                amenities_j[0].extend(amenities_j[1][0].split(", "))
                amenities_j[0].extend(amenities_j[2][0].split(", "))
                amenities_j = amenities_j[0]
                set_amen_j = set(amenities_j)

                count_i = sum([1 for x in amenities if x not in set_amen_i]) + 0.001
                count_j = sum([1 for x in amenities if x not in set_amen_j]) + 0.001

                weight = to_saaty_weight(count_j / count_i, count_i / count_j)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
                summa[j] += matrix[i][j]
                summa[i] += matrix[j][i]
        return matrix, summa
    finally:
        app.connection_pool.putconn(conn)


def getMatrixAndSummaByInfrastructure(app, infrastructure, type_sdelki): # Составление матрицы весов для критерия "Инфраструктура"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT minuts_for_park, minuts_for_hospital, minuts_for_mall, minuts_for_store, minuts_for_school, minuts_for_kindergarten FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        if sum(map(int, infrastructure.values())) == 0:
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]
        name_minuts = {
            "hospitals": 1,
            "kindergartens": 5,
            "parks": 0,
            "schools": 4,
            "shoppingCenters": 2,
            "shops": 3
        }
        for i in range(N):
            for j in range(i + 1, N):
                infrastructure_i = apartments[i]
                infrastructure_j = apartments[j]

                count_i = 0
                count_j = 0
                sum_minuts = 0
                for key in infrastructure:
                    count_i += infrastructure_i[name_minuts[key]]
                    count_j += infrastructure_j[name_minuts[key]]
                    sum_minuts += int(infrastructure[key])

                weight = getWeightByInfrastructure(count_i, count_j, sum_minuts)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
                summa[j] += weight[0]
                summa[i] += weight[1]
        return matrix, summa
    finally:
        app.connection_pool.putconn(conn)


def getWeightByInfrastructure(count_i, count_j, sum_minuts):
    try:
        if count_i == count_j: return [1, 1]
        if count_i < sum_minuts:
            koef_i = 1 - 0.5 * (count_i / (sum_minuts + 0.001))
        else:
            koef_i = 0.5 * (sum_minuts / (count_i + 0.001))
        if count_j < sum_minuts:
            koef_j = 1 - 0.5 * (count_j / (sum_minuts + 0.001))  # Вес от 0.5 до 1
        else:
            koef_j = 0.5 * (sum_minuts / (count_j + 0.001))
        return to_saaty_weight(koef_i / (koef_j + 0.001), koef_j / (koef_i + 0.001))
    except Exception as e:
        print(f"[ERROR] Calculating infrastructure: {e}")
        return [1, 1]
    

def getMatrixAndSummaByTransport(app, transport, type_sdelki): # Составление матрицы весов для критерия "Транспортная доступность"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT minuts_for_busstop, minuts_for_subway FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        if sum(map(int, (transport.values()))) == 0:
            summa = [N for _ in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]
        name_minuts = {
            "metroDistance": 1,
            "publicTransportStops": 0
        }

        for i in range(N):
            for j in range(i + 1, N):
                transport_i = apartments[i]
                transport_j = apartments[j]

                count_i = 0
                count_j = 0
                sum_minuts = 0
                for key in transport:
                    count_i += transport_i[name_minuts[key]]
                    count_j += transport_j[name_minuts[key]]
                    sum_minuts += int(transport[key])

                weight = getWeightByTransport(count_i, count_j, sum_minuts)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
                summa[j] += weight[0]
                summa[i] += weight[1]
        return matrix, summa
    except Exception as e:
        print(f"[ERROR] Calculating infrastructure: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getWeightByTransport(count_i, count_j, sum_minuts):
    try:
        if count_i == count_j: return [1, 1]
        if count_i < sum_minuts:
            koef_i = 1 - 0.5 * (count_i / (sum_minuts + 0.001))
        else:
            koef_i = 0.5 * (sum_minuts / (count_i + 0.001))
        if count_j < sum_minuts:
            koef_j = 1 - 0.5 * (count_j / (sum_minuts + 0.001))  # Вес от 0.5 до 1
        else:
            koef_j = 0.5 * (sum_minuts / (count_j + 0.001))
        return to_saaty_weight(koef_i / (koef_j + 0.001), koef_j / (koef_i + 0.001))
    except Exception as e:
        print(f"[ERROR] Calculating infrastructure: {e}")
        return [1, 1]


def getMatrixAndSummaByRentalTerms(app, rental_terms, type_sdelki):
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT kids, animals, smoking FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        summa = [1 for _ in range(N)]
        name_flags = {
            "childrenAllowed": 0,
            "petsAllowed": 1,
            "smokingAllowed": 2
        }

        for i in range(N):
            for j in range(i + 1, N):
                flags_i = apartments[i]
                flags_j = apartments[j]

                count_i = 0
                count_j = 0
                for key in rental_terms:
                    count_i += 1 if flags_i[name_flags[key]] == rental_terms[key] else 0
                    count_j += 1 if flags_j[name_flags[key]] == rental_terms[key] else 0
                
                res = count_i - count_j
                weight = getWeightByRentalTerms(res)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
                summa[j] += weight[0]
                summa[i] += weight[1]
        return matrix, summa
    except Exception as e:
        print(f"[ERROR] Calculating rental terms: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getWeightByRentalTerms(res):
    if res == -3:
        return [1 / 7, 7]
    elif res == -2:
        return [1 / 5, 5]
    elif res == -1:
        return [1 / 3, 3]
    elif res == 0:
        return [1, 1]
    elif res == 1:
        return [3, 1 / 3]
    elif res == 2:
        return [5, 1 / 5]
    elif res == 3:
        return [7, 1 / 7]


def getMatrixAndSummaByNumberOfBeds(app, number_of_beds, type_sdelki): # Составление матрицы весов для критерия "Кол-во гостей"
    conn = app.connection_pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT count_of_guests FROM apartment_data WHERE type_sdelki = {type_sdelki}")
            apartments = cursor.fetchall()
        N = len(apartments)
        matrix = [[1 for _ in range(N)] for _ in range(N)]
        apartments = [0 if apartment[0] == -1 else apartment[0] for apartment in apartments]
        if number_of_beds == -1:
            summa = [N for i in range(N)]
            return matrix, summa
        summa = [1 for _ in range(N)]
        for i in range(N):
            for j in range(i + 1, N):
                count_i = apartments[i]
                count_j = apartments[j]

                weight = getWeightByCountOfGuest(count_i, count_j, number_of_beds)
                matrix[i][j] = weight[0]
                matrix[j][i] = weight[1]
                summa[j] += weight[0]
                summa[i] += weight[1]
        return matrix, summa
    except Exception as e:
        print(f"[ERROR] Calculating infrastructure: {e}")
    finally:
        app.connection_pool.putconn(conn)


def getWeightByCountOfGuest(count_i, count_j, number_of_beds):
    try:
        if number_of_beds < 0:
            raise f"numbres_of_beds is {number_of_beds}"
        if count_i == count_j: return [1, 1]
        if count_i < number_of_beds:
            koef_i = 0.5 * (count_i / (number_of_beds + 0.001))
        else:
            koef_i = 0.5 + 0.1 * min((count_i - number_of_beds) / (number_of_beds + 0.001), 1)
        if count_j < number_of_beds:
            koef_j = 0.5 * (count_j / (number_of_beds + 0.001))  # Вес от 0.5 до 1
        else:
            koef_j = 0.5 + 0.1 * min((count_j - number_of_beds) / (number_of_beds + 0.001), 1)
        return to_saaty_weight(koef_i / (koef_j + 0.001), koef_j / (koef_i + 0.001))
    except Exception as e:
        print(f"[ERROR] Calculating count of guests: {e}")
        return [1, 1]
    

def to_saaty_weight(x, y):
    try:
        if x == y:
            return [1, 1]
        if x > y:
            x = min(9, math.ceil(x))
            return [x, 1 / x]
        else:
            y = min(9, math.ceil(y))
            return [1 / y, y]
    except Exception as e:
        print(f"[ERROR] Calculating saaty: {e}, {x}, {y}")