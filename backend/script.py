import psycopg2
from config import host, user, password, port, db_name
import random


districts = [
    "адмиралтейский",
    "василеостровский",
    "выборгский",
    "калининский",
    "кировский",
    "колпинский",
    "красногвардейский",
    "красносельский",
    "кронштадтский",
    "курортный",
    "московский",
    "невский",
    "петроградский",
    "петродворцовый",
    "приморский",
    "пушкинский",
    "фрунзенский",
    "центральный"
]


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

    cursor.execute("""select id from apartment_data""")
    ids = cursor.fetchall()
    for _id in ids:
        random_district = random.choice(districts)
        cursor.execute("""
            UPDATE apartment_data
            SET district = %s
            WHERE id = %s""",
                (random_district, _id[0]))
        connection.commit()

except Exception as e:
    print(f"[INFO] Error while working with PostgreSQL: {e}")
finally:
    if connection:
        cursor.close()
        connection.close()
        print(f"[INFO] PostgreSQL connection closed")