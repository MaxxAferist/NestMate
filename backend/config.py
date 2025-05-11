from dotenv import load_dotenv
import os
load_dotenv()


# host = os.getenv("db_host")
# user = os.getenv("db_user")
# password = os.getenv("db_password")
# port = os.getenv("db_port")
# db_name = os.getenv("db_name")

database_url = os.getenv("FLASK_DATASOURCE_URL")
flask_run_host = os.getenv("FLASK_RUN_HOST")
flask_run_port = os.getenv("FLASK_RUN_PORT")