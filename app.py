from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///datta.db'
db = SQLAlchemy(app)

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"message": "Hello from Flask!"})


class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userName = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(256), unique=True, nullable=False)
    password = db.Column(db.String(30), nullable=False)
    signInDate = db.Column(db.DateTime, default=datetime.utcnow)
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
    if not data or not data.get('userName') or not data.get('email') or not data.get('password'):
        return jsonify({"status": "error", "message": "Missing data"}), 400
    if UserProfile.query.filter_by(email=data['email']).first():
        return jsonify({"status": "error", "message": "Email already exists"}), 400

    new_user = UserProfile(
        userName=data['userName'],
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
            "userName": user.userName,
            "email": user.email,
            "password": user.password,
            "date": user.signInDate,
        }
    }), 200

@app.route('/api')
def index():
    return 'index'
if __name__ == '__main__':
    app.run(debug = True)