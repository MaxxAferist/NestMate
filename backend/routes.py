from flask import jsonify, request, render_template
from datetime import datetime
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
import signal
# from app import Application
# import MAI


def init_routes(app):#: Application):
    @app.app.route('/api/users')
    def posts():
        app.cursor_users.execute("""
SELECT * FROM users
ORDER BY sign_in_date DESC;         
""")
        users = list(app.cursor_users.fetchall())
        return render_template('users.html', users=users)

    @app.app.route('/api/signIn', methods=['POST'])
    def signIn():
        data = request.json # Получаем данные из запроса
        if not data or not data.get('firstName') or not data.get('email') or not data.get('password'):
            return jsonify({"status": "error", "message": "Missing data"}), 400
        app.cursor_users.execute("""
SELECT email FROM users
WHERE email = %s""",
(data["email"],))
        email = app.cursor_users.fetchone()
        if email:
            return jsonify({"status": "error", "message": "Email already exists"}), 400
        
        hashed_password = generate_password_hash(data['password'])

        app.cursor_users.execute("""
INSERT INTO users (first_name, email, password)
VALUES (%s, %s, %s)""",
(data["firstName"], data["email"], hashed_password))
        app.connection.commit()
        return jsonify({"status": "success", "message": "User registered"}), 201

    @app.app.route('/api/logIn', methods=['POST'])
    def logIn():
        data = request.json
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"status": "error", "message":"Missing data"}), 400

        app.cursor_users.execute("""
SELECT * FROM users
WHERE email = %s""",
(data["email"],))
        user = app.cursor_users.fetchone()

        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        if not check_password_hash(user[7], data['password']):
            return jsonify({"status": "error", "message": "Invalid password"}), 401

        return jsonify({
            "status": "success",
            "message": "Login success",
            "user": {
                "id": user[0],
                "firstName": user[1],
                "lastName": user[2],
                "middleName": user[3],
                "gender": user[4],
                "phone": user[5],
                "email": user[6],
                "password": user[7],
                "date": user[8],
            }
        }), 200


    @app.app.route('/api/savePreferences', methods=['POST'])
    def savePreferences():
        data = request.json
        if not data or not data.get('user_id'):
            return jsonify({"status": "error", "message": "Missing user ID"}), 400

        app.cursor_users.execute("""
SELECT * FROM users
WHERE id = %s""",
(data["user_id"],))
        user = app.cursor_users.fetchone()

        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        if 'flatPreferences' in data:
            app.cursor_users.execute("""
UPDATE users
SET flat_preferences = %s
WHERE id = %s""",
(json.dumps(data['flatPreferences']), user[0]))
        if 'rentPreferences' in data:
            app.cursor_users.execute("""
UPDATE users
SET rent_preferences = %s
WHERE id = %s""",
(json.dumps(data['rentPreferences']), user[0]))
        
        app.connection.commit()
        return jsonify({
            "status": "success",
            "message": "Preferences saved successfully"
        }), 200


    @app.app.route('/api/getPreferences/<int:user_id>', methods=['GET'])
    def getPreferences(user_id):
        app.cursor_users.execute("""
SELECT * FROM users
WHERE id = %s""",
(user_id,))
        user = app.cursor_users.fetchone()
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        # with open ("flat_preferences.json", "w") as file:
        #     json.dump(user[9], file, ensure_ascii=False, indent=4)

        priorities = user[9].get("priorities")
        res = 0
        for key in priorities.keys():
            res += priorities.get(key)
        print(res)
        
        return jsonify({
            "status": "success",
            "flatPreferences": user[9],
            "rentPreferences": user[10]
        }), 200


    @app.app.route('/api/getUserData/<int:user_id>', methods=['GET'])
    def getUserData(user_id):
        app.cursor_users.execute("""
SELECT * FROM users
WHERE id = %s""",
(user_id,))
        user = app.cursor_users.fetchone()
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        return jsonify({
            "status": "success",
            "user": {
                "id": user[0],
                "firstName": user[1],
                "lastName": user[2],
                "middleName": user[3],
                "gender": user[5],
                "phone": user[4],
                "email": user[6],
                "signInDate": user[8].isoformat()
            }
        }), 200

    @app.app.route('/api/saveUserData', methods=['POST'])
    def saveUserData():
        data = request.json
        if not data or not data.get('id'):
            return jsonify({"status": "error", "message": "Missing user ID"}), 400

        app.cursor_users.execute("""
SELECT * FROM users
WHERE id = %s""",
(data["id"],))
        user = app.cursor_users.fetchone()

        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        if 'firstName' in data:
            app.cursor_users.execute("""
UPDATE users
SET first_name = %s
WHERE id = %s""",
(data['firstName'], user[0]))
        if 'lastName' in data:
            app.cursor_users.execute("""
UPDATE users
SET last_name = %s
WHERE id = %s""",
(data['lastName'], user[0]))
        if 'middleName' in data:
            app.cursor_users.execute("""
UPDATE users
SET middle_name = %s
WHERE id = %s""",
(data['middleName'], user[0]))
        if 'phone' in data:
            app.cursor_users.execute("""
UPDATE users
SET phone = %s
WHERE id = %s""",
(data['phone'], user[0]))
        if 'gender' in data:
            app.cursor_users.execute("""
UPDATE users
SET gender = %s
WHERE id = %s""",
(data['gender'], user[0]))

        app.connection.commit()

        return jsonify({
            "status": "success",
            "message": "User data updated success"
        }), 200
    

    @app.app.route('/api/getSortedAppartments/<int:user_id>', methods=['GET'])
    def getSortedAppartments(user_id):
        return
        app.cursor_users.execute("""
SELECT * FROM users
WHERE id = %s""",
(user_id,))
        user = app.cursor_users.fetchone()
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        flat_preferences = user[9]
        
        # return jsonify(MAI.getSortedApartments(app, flat_preferences)), 200
        


    @app.app.route('/api')
    def index():
        return 'index'
    

    @app.app.route('/api/shutdown', methods=['POST'])
    def shutdown():
        if request.headers.get('X-Shutdown-Token') != 'exit_token)))':
            print("token govno")
            return {"status": "error", "message": "Forbidden"}, 403
        os.kill(os.getpid(), signal.SIGINT)
        return {"status": "success", "message": "Выключение сервера..."}