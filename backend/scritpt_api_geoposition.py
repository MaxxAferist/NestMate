import psycopg2
from config import host, user, password, port, db_name
import requests
import json


api_key = "5b3ce3597851110001cf6248427fc10682674c38a854eb7e9e8435cc"


connection = None
try:
    connection = psycopg2.connect(
        host=host,
        user=user,
        password=password,
        port=port,
        database=db_name
    )
    cursor = connection.cursor()

    cursor.execute("""SELECT (coord_lat, coord_lng) FROM apartment_data""")
    coords = cursor.fetchall()[:5]
    for coord in coords:
        coord = list(map(lambda x: float(x), coord[0][1:-1].split(",")))
        print(coord)
        # coords = [37.617635, 55.755814]
        url = f"https://api.openrouteservice.org/geocode/reverse?api_key={api_key}&point.lon={coord[1]}&point.lat={coord[0]}&layers=neighbourhood"
        url = f"https://api.openrouteservice.org/geocode/reverse?api_key={api_key}&point.lon={coord[1]}&point.lat={coord[0]}&layers=locality"
        response = requests.get(url)
        data = response.json()
        with open("response_geocoder.json", "w") as file:
            json.dump(data, file, indent=4)

        if data['features']:
            neighbourhood = data['features'][0]['properties']['name']
            print(f"Район: {neighbourhood}")
        else:
            print("Район не найден")

except Exception as e:
    print(f"[INFO] Error while working with PostgreSQL: {e}")
finally:
    if connection:
        cursor.close()
        connection.close()
        print(f"[INFO] PostgreSQL connection closed")