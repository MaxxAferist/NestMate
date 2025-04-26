import sqlite3
import json


connection = sqlite3.connect("datta.db")
cursor = connection.cursor()

connection.autocommit = True
cursor.execute("""SELECT name FROM sqlite_master WHERE type='table';""")
tables = cursor.fetchall()
print(tables)

cursor.execute("""PRAGMA table_info(user_profile);""")
fields = cursor.fetchall()
for field in fields:
    print(field)

cursor.execute("""SELECT flatPreferences FROM user_profile;""")
json_file = cursor.fetchall()[-1]
# for json_file in json_files:
print(json_file)