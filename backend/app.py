from flask import Flask
from datetime import datetime
from flask_cors import CORS
import config
import psycopg2
import signal
from routes import init_routes
from psycopg2.pool import ThreadedConnectionPool


class Application():
    def __init__(self, name):
        self.app = Flask(name)
        CORS(self.app)

        self.__setup_signals()
        
        # Config Database
        self.app.config["bd_host"] = config.host
        self.app.config["bd_user"] = config.user
        self.app.config["bd_password"] = config.password
        self.app.config["bd_port"] = config.port
        self.app.config["db_name"] = config.db_name
        # ------------
        self.connection_pool = None
        self.connect_to_db()

        # Created tables
        self.create_apartments_db()
        self.create_users_db()
        
        init_routes(self)
        self.app.app_context().push()


    def __setup_signals(self):
        signal.signal(signal.SIGINT, self.handle_signal)
        signal.signal(signal.SIGTERM, self.handle_signal)


    def connect_to_db(self):
        try:
            self.connection_pool = ThreadedConnectionPool(
                minconn =2,
                maxconn = 10,
                dsn=f"postgresql://{config.user}:{config.password}@{config.host}:{config.port}/{config.db_name}"
            )
            print("[INFO] Database connected")
        except Exception as e:
            print(f"[INFO] Database is not connected: {e}")

    
    def create_users_db(self):
        conn = self.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,                              
                    first_name VARCHAR(30),
                    last_name VARCHAR(30),
                    gender VARCHAR(10),
                    email VARCHAR(256),
                    password VARCHAR(200),
                    sign_in_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    flat_preferences JSON,
                    rent_preferences JSON,
                    favorites INTEGER[]
                );""")
            conn.commit()
        finally:
            self.connection_pool.putconn(conn)
        
        

    def create_apartments_db(self):
        conn = self.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
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
            conn.commit()
        finally:
            self.connection_pool.putconn(conn)


    def start(self):
        try:
            self.app.run(debug = True)
        except KeyboardInterrupt:
            self.handle_shutdown()


    def handle_signal(self, signum, frame):
        print(f"\nReceived signal {signum}, shutting down...")
        self.handle_shutdown()
        exit(0)


    def handle_shutdown(self):
        self.connection_pool.closeall()


if __name__ == '__main__':
    app = Application(__name__)
    app.start()