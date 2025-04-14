from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///datta.db'
db = SQLAlchemy(app)

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(30), nullable=False)
    lastName = db.Column(db.String(30), nullable=True)
    middleName = db.Column(db.String(30), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    email = db.Column(db.String(256), unique=True, nullable=False)
    password = db.Column(db.String(30), nullable=False)
    signInDate = db.Column(db.DateTime, default=datetime.utcnow)
    flatPreferences = db.Column(db.JSON, nullable=True)
    rentPreferences = db.Column(db.JSON, nullable=True)
    def __repr__(self):
        return '<User_id %r  name: %r >' % (self.id, self.name)

app.app_context().push()

@app.route('/api/users')
def posts():
    Users = UserProfile.query.order_by(UserProfile.signInDate.desc()).all()  # обратиться к базе данных через класс,
    # order_by - сортировка данных по полю, all - взять все записи, desc() - формат уменьшения значения
    return render_template('users.html', users=Users) # передали в шаблон данные

@app.route('/api/signIn', methods=['POST'])
def signIn():
    data = request.json # Получаем данные из запроса
    if not data or not data.get('firstName') or not data.get('email') or not data.get('password'):
        return jsonify({"status": "error", "message": "Missing data"}), 400
    if UserProfile.query.filter_by(email=data['email']).first():
        return jsonify({"status": "error", "message": "Email already exists"}), 400

    new_user = UserProfile(
        firstName=data['firstName'],
        email=data['email'],
        password=data['password']
    )

    db.session.add(new_user)
    db.session.commit()
    return jsonify({"status": "success", "message": "User registered"}), 201

@app.route('/api/logIn', methods=['POST'])
def logIn():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"status": "error", "message":"Missing data"}), 400

    user = UserProfile.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    if user.password != data['password']:
        return jsonify({"status": "error", "message": "Invalid password"}), 401

    return jsonify({
        "status": "success",
        "message": "Login success",
        "user": {
            "id": user.id,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "middleName": user.middleName,
            "gender": user.gender,
            "phone": user.phone,
            "email": user.email,
            "password": user.password,
            "date": user.signInDate,
        }
    }), 200


@app.route('/api/savePreferences', methods=['POST'])
def savePreferences():
    data = request.json
    if not data or not data.get('user_id'):
        return jsonify({"status": "error", "message": "Missing user ID"}), 400

    user = UserProfile.query.get(data['user_id'])
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    if 'flatPreferences' in data:
        user.flatPreferences = data['flatPreferences']
    if 'rentPreferences' in data:
        user.rentPreferences = data['rentPreferences']

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Preferences saved successfully"
    }), 200


@app.route('/api/getPreferences/<int:user_id>', methods=['GET'])
def getPreferences(user_id):
    user = UserProfile.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    return jsonify({
        "status": "success",
        "flatPreferences": user.flatPreferences,
        "rentPreferences": user.rentPreferences
    }), 200


@app.route('/api/getUserData/<int:user_id>', methods=['GET'])
def getUserData(user_id):
    user = UserProfile.query.get(user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    return jsonify({
        "status": "success",
        "user": {
            "id": user.id,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "middleName": user.middleName,
            "email": user.email,
            "phone": user.phone,
            "gender": user.gender,
            "signInDate": user.signInDate.isoformat()
        }
    }), 200

@app.route('/api/saveUserData', methods=['POST'])
def saveUserData():
    data = request.json
    if not data or not data.get('id'):
        return jsonify({"status": "error", "message": "Missing user ID"}), 400

    user = UserProfile.query.get(data['id'])
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    if 'firstName' in data:
        user.firstName = data['firstName']
    if 'lastName' in data:
        user.lastName = data['lastName']
    if 'middleName' in data:
        user.middleName = data['middleName']
    if 'phone' in data:
        user.phone = data['phone']
    if 'gender' in data:
        user.gender = data['gender']

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "User data updated success"
    }), 200

@app.route('/api')
def index():
    return 'index'
if __name__ == '__main__':
    app.run(debug = True)