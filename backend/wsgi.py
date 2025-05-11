from app import Application

app = Application(__name__).app

if __name__ == '__main__':
    app.run()