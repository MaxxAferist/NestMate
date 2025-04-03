from bs4 import BeautifulSoup
import requests
from urllib.parse import unquote
import json


def getAreaFromJson(json_item):
    try:
        area = json_item.get("ga")
        area = list(filter(lambda x: "area" in x.keys(), area))[0].get("area").split()[0]
        return int(area)
    except:
        return None
    


def getCountRoomsFromJson(json_item):
    try:
        rooms = json_item.get("ga")
        rooms = list(filter(lambda x: "rooms" in x.keys(), rooms))[0].get("rooms")
        return rooms
    except:
        return None


def getFloorFromJson(json_item):
    try:
        floor = json_item.get("ga")
        floor = list(filter(lambda x: "floor" in x.keys(), floor))[0].get("floor")
        return floor
    except:
        return None


def getCountFloorsFromJson(json_item):
    try:
        floors_count = json_item.get("ga")
        floors_count = list(filter(lambda x: "floors_count" in x.keys(), floors_count))[0].get("floors_count")
        return floors_count
    except:
        return None


def getSanuzelInfoFromJson(json_item):
    try:
        sanuzel = json_item.get("ga")
        sanuzel = list(filter(lambda x: "sanuzel_multiple" in x.keys(), sanuzel))[0].get("sanuzel_multiple")
        return sanuzel
    except:
        return None


def getMuntimediaFromJson(json_item):
    try:
        multimedia = json_item.get("ga")
        multimedia = list(filter(lambda x: "multimedia" in x.keys(), multimedia))[0].get("multimedia")
        return multimedia
    except:
        return None


def getAdditionalyFromJson(json_item):
    try:
        additionaly = json_item.get("paramsBlock").get("items")
        additionaly = list(filter(lambda x: x.get("title") == "Дополнительно", additionaly))[0].get("description")
        return additionaly
    except:
        return None


def getRemontFromJson(json_item):
    try:
        remont = json_item.get("paramsBlock").get("items")
        remont = list(filter(lambda x: x.get("title") == "Ремонт", remont))[0].get("description")
        return remont
    except:
        return None


def getFurnitureFromJson(json_item):
    try:
        furniture = json_item.get("paramsBlock").get("items")
        furniture = list(filter(lambda x: x.get("title") == "Мебель", furniture))[0].get("description")
        return furniture
    except:
        return None


def getTechniqueFromJson(json_item):
    try:
        technique = json_item.get("paramsBlock").get("items")
        technique = list(filter(lambda x: x.get("title") == "Техника", technique))[0].get("description")
        return technique
    except:
        return None


def getDepositFromJson(json_item):
    try:
        deposit = json_item.get("item").get("rentTermsParams").get("data").get("items")
        deposit = list(filter(lambda x: x.get("title") == "Залог", deposit))[0].get("description").split()[0]
        return int(deposit)
    except:
        return None


def getCommisionFromJson(json_item):
    try:
        commision = json_item.get("item").get("rentTermsParams").get("data").get("items")
        commision = list(filter(lambda x: x.get("title") == "Коммисия", commision))[0].get("description").split()[0]
        return int(commision)
    except:
        return None


def getCountOfGuestFromJson(json_item):
    try:
        count_of_guest = json_item.get("item").get("rulesParams").get("data").get("items")
        count_of_guest = list(filter(lambda x: x.get("title") == "Количество гостей", count_of_guest))[0].get("description")
        return int(count_of_guest)
    except:
        return None


def getPossibleWithChildrenFromJson(json_item):
    try:
        possible = json_item.get("item").get("rulesParams").get("data").get("items")
        possible = list(filter(lambda x: x.get("title") == "Можно с детьми", possible))[0].get("description")
        possible = True if possible == "да" else False
        return possible
    except:
        return None


def getPossibleWithAnimalsFromJson(json_item):
    try:
        possible = json_item.get("item").get("rulesParams").get("data").get("items")
        possible = list(filter(lambda x: x.get("title") == "Можно с животными", possible))[0].get("description")
        possible = True if possible == "да" else False
        return possible
    except:
        return None


def getPossibleSmokingFromJson(json_item):
    try:
        possible = json_item.get("item").get("rulesParams").get("data").get("items")
        possible = list(filter(lambda x: x.get("title") == "Можно курить", possible))[0].get("description")
        possible = True if possible == "да" else False
        return possible
    except:
        return None


def getDomotekaReportFromJson(json_item):
    try:
        info_list = json_item.get("domotekaReportTeaser").get("infoList")
        text = ""
        for elem in info_list:
            if elem.get("icon") == "done":
                text += "\u2713 "
            elif elem.get("icon") == "warning":
                text += "\u26a0 "
            text += elem.get("text") + "\n"
        return text
    except:
        return None


def getTypeHouseFromJson(json_item):
    try:
        type_house = json_item.get("item").get("houseParams").get("data").get("items")
        type_house = list(filter(lambda x: x.get("title") == "Тип дома", type_house))[0].get("description")
        return type_house
    except:
        return None


def getYearOfConstructionFromJson(json_item):
    try:
        year = json_item.get("item").get("houseParams").get("data").get("items")
        year = list(filter(lambda x: x.get("title") == "Год постройки", year))[0].get("description")
        return int(year)
    except:
        return None


def getCountOfPassengerElevatorsFromJson(json_item):
    try:
        count = json_item.get("item").get("houseParams").get("data").get("items")
        count = list(filter(lambda x: x.get("title") == "Пассажирский лифт", count))[0].get("description")
        return int(count)
    except:
        return None


def getCountOfFreightElevatorsFromJson(json_item):
    try:
        count = json_item.get("item").get("houseParams").get("data").get("items")
        count = list(filter(lambda x: x.get("title") == "Грузовой лифт", count))[0].get("description")
        return int(count)
    except:
        return None


def main():
    test_url = "https://www.avito.ru/sankt_peterburg_i_lo/kvartiry/sdam/na_dlitelnyy_srok-ASgBAgICAkSSA8gQ8AeQUg?cd=1&context=&localPriority=0&q=%D0%BA%D0%B2%D0%B0%D1%80%D1%82%D0%B8%D1%80%D0%B0+%D0%B4%D1%8B%D0%B1%D0%B5%D0%BD%D0%BA%D0%BE"
    domen_avito = "https://www.avito.ru"
    response = requests.get(url=test_url)
    print(response.status_code)
    html = response.text
    parse_soup = BeautifulSoup(html, "lxml")
    scripts_with_json = parse_soup.find_all("script")
    for script_rooms in scripts_with_json:
        if "сдается" in script_rooms.text.lower().replace("ё", "е"):
            json_text = script_rooms.text.replace("&quot;", '"')

            # with open("file.txt", "w", encoding="utf-8") as file:
            #     file.write(json_text)

            json_text = unquote(json_text)
            data = json.loads(json_text)

            # with open("json_file.json", "w", encoding="utf-8") as file:
            #     json.dump(data, file, ensure_ascii=False, indent=4)
        
            rooms = data.get("data").get("catalog").get("items")
            print(len(rooms))
            #for this
            room1 = rooms[0]
            url_room = domen_avito + room1.get("urlPath")
            id_room = room1.get("id")
            print(id_room)
            print(url_room)

            response = requests.get(url=url_room)
            print(response.status_code)
            html = response.text
            parse_room_soup = BeautifulSoup(html, "lxml")
            scripts_with_json_room = parse_room_soup.find_all("script")
            for script_room in scripts_with_json_room:
                # if str(id_room) in script_room.text:
                if str(id_room) in script_room.text:
                    json_text = script_room.text
                    json_text = json_text.split(";")[0].split("=")[1].strip().strip('"')

                    # with open("file.txt", "w", encoding="utf-8") as file:
                    #     file.write(json_text)

                    json_text = unquote(json_text)
                    data = json.loads(json_text)

                    # with open("json_file_room.json", "w", encoding="utf-8") as file:
                    #     json.dump(data, file, ensure_ascii=False, indent=4)

                    keys_json = data.keys()
                    key_avito_item = list(filter(lambda x: "@avito" in x, keys_json))[0]
                    item = data.get(key_avito_item).get("buyerItem")

                    # with open("json_room_content.json", "w", encoding="utf-8") as file:
                    #     json.dump(item, file, ensure_ascii=False, indent=4)

                    # About Apartment
                    price = item.get("item").get("price")
                    area = getAreaFromJson(item)
                    rooms_count = getCountRoomsFromJson(item)
                    floor = getFloorFromJson(item)
                    floors_count = getCountFloorsFromJson(item)
                    additionaly = getAdditionalyFromJson(item)
                    sanuzel = getSanuzelInfoFromJson(item)
                    remont = getRemontFromJson(item)
                    furniture = getFurnitureFromJson(item)
                    technique = getTechniqueFromJson(item)
                    multimedia = getMuntimediaFromJson(item)

                    # Rent Terms Params
                    deposit = getDepositFromJson(item)
                    commision = getCommisionFromJson(item)

                    # Rules
                    count_of_guests = getCountOfGuestFromJson(item)
                    possible_with_children = getPossibleWithChildrenFromJson(item)
                    possible_with_animals = getPossibleWithAnimalsFromJson(item)
                    possible_smoking = getPossibleSmokingFromJson(item)

                    # Domoteka Report Teaser
                    domoteka_report = getDomotekaReportFromJson(item)

                    # Geo
                    address = item.get("item").get("geo").get("address")
                    coords = item.get("item").get("geo").get("coords")
                    references = item.get("item").get("geo").get("references")

                    # Description
                    description = item.get("item").get("description")

                    # House Params
                    type_house = getTypeHouseFromJson(item)
                    year_of_construction = getYearOfConstructionFromJson(item)
                    count_of_passenger_elevators = getCountOfPassengerElevatorsFromJson(item)
                    count_of_freight_elevators = getCountOfFreightElevatorsFromJson(item)

                    print(f"""
i==========================================
Цена: {price}
О квартире
    Количество комнат: {rooms_count}
    Общая площадь: {area} м²
    Этаж: {floor} из {floors_count}
    Дополнительно: {additionaly}
    Санузел: {sanuzel}
    Ремонт: {remont}
    Мебель: {furniture}
    Техника: {technique}
    Интернет и ТВ: {multimedia}

Условия аренды
    Залог: {deposit} ₽
    Комиссия: {commision} %
    
Правила
    Количество гостей: {count_of_guests}
    Можно с детьми: {"да" if possible_with_children else "нет"}
    Можно с животными: {"да" if possible_with_animals else "нет"}
    Можно курить: {"да" if possible_smoking else "нет"}

Проверка в Росреестре
{domoteka_report}
Расположение
    Адрес: {address}
    Координаты:
{coords}
Метро:
{references}

Описание
{description}

О доме
    Тип дома: {type_house}
    Год постройки: {year_of_construction}
    Этажей в доме: {floors_count}
    Пассажирский лифт: {count_of_passenger_elevators}
    Грузовой лифт: {count_of_freight_elevators}
===========================================
""")
            print("[+]")



if __name__ == "__main__":
    main()