from flask import Flask
from datetime import datetime
from flask_cors import CORS
import config
import psycopg2
import signal
from routes import init_routes


class Application():
    def __init__(self, name):
        self.app = Flask(name)
        CORS(self.app)
        
        # Config Database
        self.app.config["bd_host"] = config.host
        self.app.config["bd_user"] = config.user
        self.app.config["bd_password"] = config.password
        self.app.config["bd_port"] = config.port
        self.app.config["db_name"] = config.db_name
        # ------------

        self.connection = None
        self.cursor_apartments = None
        self.cursor_users = None
        self.connect_to_db() # Connecting to Database

        # Created tables
        self.create_apartments_db()
        self.create_users_db()

        self.app.app_context().push()
        init_routes(self)


    def connect_to_db(self):
        try:
            self.connection = psycopg2.connect(
                host=self.app.config["bd_host"],
                user=self.app.config["bd_user"],
                password=self.app.config["bd_password"],
                port=self.app.config["bd_port"],
                database=self.app.config["db_name"]
            )

            print("[INFO] Database connected")
            self.cursor_apartments = self.connection.cursor() # Cursor for table "apartment_data"
            self.cursor_users = self.connection.cursor() # Cursor for table "usersuser_profile"

        except Exception as e:
            print(f"[INFO] Database is not connected: {e}")

    
    def create_users_db(self):
        self.cursor_users.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,                              
                first_name VARCHAR(30),
                last_name VARCHAR(30),
                middle_name VARCHAR(30),
                phone VARCHAR(20),
                gender VARCHAR(10),
                email VARCHAR(256),
                password VARCHAR(200),
                sign_in_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                flat_preferences JSON,
                rent_preferences JSON
            );""")
        self.connection.commit()
        

    def create_apartments_db(self):
        self.cursor_apartments.execute("""
            CREATE TABLE IF NOT EXISTS apartment_data (
                id SERIAL PRIMARY KEY,
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
                technique TEXT[]
            );""")
        self.connection.commit()


    def start(self):
        self.app.run(debug = True)


    def handle_shutdown(self):
        if self.cursor_apartments:
            self.cursor_apartments.close()
        if self.cursor_users:
            self.cursor_users.close()
        if self.connection:
            self.connection.close()


if __name__ == '__main__':
    app = Application(__name__)

    signal.signal(signal.SIGINT, app.handle_shutdown)
    signal.signal(signal.SIGTERM, app.handle_shutdown)

    app.start()