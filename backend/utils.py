from flask import jsonify
import re


def remove_html_tags_re(text):
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)


def getDescription(desc: str):
    try:
        desc_list = desc.split()
        rows = [[]]
        i = 0
        count_symbols = 0
        max_symbols_in_row = 60
        while i < 3:
            if count_symbols + len(desc_list[0]) < 60:
                rows[i].append(desc_list[0])
                count_symbols += 1 + len(desc_list[0])
                del desc_list[0]
            else:
                i += 1
                count_symbols = 0
                rows.append([])
        rows = list(map(lambda x: " ".join(x), rows))
        last_row = " ".join(desc_list)[:max_symbols_in_row - 2] + "…"
        rows[-1] = last_row
    finally:
        return rows


def getJsonInformationAboutApartments(connection, ids, favorites, comparison):
    with connection.cursor() as cursor:
        apartments_information = []
        for _id in ids:
            cursor.execute("""
            SELECT id,pictures, count_rooms, area, floor, count_floors, price, address, minuts_for_subway, type_sdelki, count_floors FROM apartment_data
            WHERE id = %s""",
                (_id,))
            apartment = cursor.fetchone()

            main_picture_url = apartment[1][0].split(", ")[0]
            if apartment[2].isdigit():
                count_room = f"{apartment[2]}-комнатная"
            else:
                count_room = "Студия"
            if apartment[9] == 0: # добавил
                type_sdelki = 'sell'
            else:
                type_sdelki = 'rent'
            id_apartment = apartment[0]
            area = apartment[3] # изменил с f"{apartment[3]} м²"
            floor = apartment[4]
            count_floors = apartment[5]
            price = apartment[6]
            address = apartment[7]
            minuts_for_subway = apartment[8]
            count_floors = apartment[10]
            is_favorite = True if apartment[0] in favorites else False
            is_comparison = True if apartment[0] in comparison else False
            apartments_information.append({
                "id": id_apartment, # добавил
                "picture": main_picture_url,
                "type": type_sdelki, # добавил
                "price": price,
                "rooms": count_room, # изменено с room_count
                "area": area,
                "floor": floor,
                "address": address,
                "buildingFloors" : count_floors, # добавил
                "metroDistance": minuts_for_subway, #  название сменил
                "is_favorite": is_favorite,
                "is_comparison": is_comparison
            })
    return apartments_information



def getJsonInformationAboutApartmentsForComparison(connection, comparison, favorites):
    with connection.cursor() as cursor:
        apartments_information = []
        cursor.execute("""
        SELECT id, pictures, address, district, price, count_rooms, area, floor, ceiling_height, balcony, remont, additional_amenities, furniture, technique, year_of_construction, count_floors, material_house, minuts_for_park, minuts_for_hospital, minuts_for_mall, minuts_for_kindergarten, minuts_for_school, minuts_for_store, minuts_for_busstop, minuts_for_subway, type_sdelki FROM apartment_data
        WHERE id = ANY(%s)""",
            (comparison,))
        comparison_apartments = cursor.fetchall()

    for apartment in comparison_apartments:
        id_apartment = apartment[0] # добавил
        main_picture_url = apartment[1][0].split(", ")[0]
        address = apartment[2]
        district = apartment[3]
        price = apartment[4]
        count_rooms = apartment[5]
        area = apartment[6]
        floor = apartment[7]
        ceiling_height = apartment[8]
        balcony = apartment[9]
        remont = apartment[10]
        additional_amenities = apartment[11]
        furniture = apartment[12]
        technique = apartment[13]
        amenties = additional_amenities + furniture + technique
        year_of_construction = apartment[14]
        count_floors = apartment[15]
        material_house = apartment[16]
        minuts_for_park = apartment[17]
        minuts_for_hospital = apartment[18]
        minuts_for_mall = apartment[19]
        minuts_for_kindergarten = apartment[20]
        minuts_for_school = apartment[21]
        minuts_for_store = apartment[22]
        minuts_for_busstop = apartment[23]
        minuts_for_subway = apartment[24]
        type_sdelki = apartment[25]

        is_favorite = True if apartment[0] in favorites else False
        apartments_information.append({ #изменил отправляемый JSON
            "id": id_apartment,
            "type": type_sdelki,
            "rooms": count_rooms,
            "ceilingHeight": ceiling_height,
            "balconyType": balcony,
            "renovationCondition": remont,
            "area": area,
            "picture": main_picture_url,
            "address": address,
            "district": district,
            "floor": floor,
            "amenities": amenties,
            "buildingFloors": count_floors,
            "buildingYear": year_of_construction,
            "buildingMaterial": material_house,
            "infrastructure": {
                "parks": minuts_for_park,
                "hospitals": minuts_for_hospital,
                "shoppingCenters": minuts_for_mall,
                "shops": minuts_for_store,
                "schools": minuts_for_school,
                "kindergartens": minuts_for_kindergarten
            },
            "transportAccessibility": {
                "publicTransportStops": minuts_for_busstop,
                "metroDistance": minuts_for_subway
            },
            "price": price
        })
    return apartments_information


def idsFromPage(connection, type_sdelki=0, n=1, counts=25):
    with connection.cursor() as cursor:
        cursor.execute("""
        SELECT id FROM apartment_data
        WHERE type_sdelki = %s""",
            (type_sdelki,))
        ids = list(map(lambda x: int(x[0]), cursor.fetchall()))
        ids = ids[(n - 1) * counts:n * counts]
        return ids
