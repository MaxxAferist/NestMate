from flask import jsonify, request, render_template
from datetime import datetime
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
import signal
# from app import Application
import MAI


def init_routes(app):#: Application):
    @app.app.route('/api/users')
    def posts():
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
        SELECT * FROM users
        ORDER BY sign_in_date DESC;         
        """)
                users = list(cursor.fetchall())
            return render_template('users.html', users=users)
        finally:
            app.connection_pool.putconn(conn)

    @app.app.route('/api/signIn', methods=['POST'])
    def signIn():
        data = request.json # Получаем данные из запроса
        if not data or not data.get('firstName') or not data.get('email') or not data.get('password'):
            return jsonify({"status": "error", "message": "Missing data"}), 400
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT email FROM users
WHERE email = %s""",
(data["email"],))
                email = cursor.fetchone()
                if email:
                    return jsonify({"status": "error", "message": "Email already exists"}), 400
                
                hashed_password = generate_password_hash(data['password'])

                cursor.execute("""
INSERT INTO users (first_name, email, password)
VALUES (%s, %s, %s)""",
(data["firstName"], data["email"], hashed_password))
            conn.commit()
            return jsonify({"status": "success", "message": "User registered"}), 201
        finally:
            app.connection_pool.putconn(conn)

    @app.app.route('/api/logIn', methods=['POST'])
    def logIn():
        data = request.json
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"status": "error", "message":"Missing data"}), 400
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT * FROM users
WHERE email = %s""",
(data["email"],))
                user = cursor.fetchone()

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
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/savePreferences', methods=['POST'])
    def savePreferences():
        data = request.json
        if not data or not data.get('user_id'):
            return jsonify({"status": "error", "message": "Missing user ID"}), 400
        
        # with open ("flat_preferences.json", "w") as file:
        #     json.dump(data['flatPreferences'], file, ensure_ascii=False, indent=4)

        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT * FROM users
WHERE id = %s""",
(data["user_id"],))
                user = cursor.fetchone()

                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 404

                if 'flatPreferences' in data:
                    cursor.execute("""
UPDATE users
SET flat_preferences = %s
WHERE id = %s""",
(json.dumps(data['flatPreferences']), user[0]))
                if 'rentPreferences' in data:
                    cursor.execute("""
UPDATE users
SET rent_preferences = %s
WHERE id = %s""",
(json.dumps(data['rentPreferences']), user[0]))
                
            conn.commit()
            return jsonify({
                "status": "success",
                "message": "Preferences saved successfully"
            }), 200
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/getPreferences/<int:user_id>', methods=['GET'])
    def getPreferences(user_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT * FROM users
WHERE id = %s""",
(user_id,))
                user = cursor.fetchone()
                cursor.close()
                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 404
                
                # with open ("flat_preferences.json", "w") as file:
                #     json.dump(user[9], file, ensure_ascii=False, indent=4)

                
                # priorities = user[9].get("priorities")
                res = 0
                # for key in priorities.keys():
                #     res += priorities.get(key)
                print("summa =", res)
            return jsonify({
                "status": "success",
                "flatPreferences": user[9],
                "rentPreferences": user[10]
            }), 200
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/getUserData/<int:user_id>', methods=['GET'])
    def getUserData(user_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT * FROM users
WHERE id = %s""",
(user_id,))
                user = cursor.fetchone()
                # print(f"/api/getUserData: {user}")
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
        finally:
            app.connection_pool.putconn(conn)

    @app.app.route('/api/saveUserData', methods=['POST'])
    def saveUserData():
        data = request.json
        if not data or not data.get('id'):
            return jsonify({"status": "error", "message": "Missing user ID"}), 400
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT * FROM users
WHERE id = %s""",
(data["id"],))
                user = cursor.fetchone()

                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 404

                if 'firstName' in data:
                    cursor.execute("""
UPDATE users
SET first_name = %s
WHERE id = %s""",
(data['firstName'], user[0]))
                if 'lastName' in data:
                    cursor.execute("""
UPDATE users
SET last_name = %s
WHERE id = %s""",
(data['lastName'], user[0]))
                if 'middleName' in data:
                    cursor.execute("""
UPDATE users
SET middle_name = %s
WHERE id = %s""",
(data['middleName'], user[0]))
                if 'phone' in data:
                    cursor.execute("""
UPDATE users
SET phone = %s
WHERE id = %s""",
(data['phone'], user[0]))
                if 'gender' in data:
                    cursor.execute("""
UPDATE users
SET gender = %s
WHERE id = %s""",
(data['gender'], user[0]))

            conn.commit()
            return jsonify({
                "status": "success",
                "message": "User data updated success"
            }), 200
        finally:
            app.connection_pool.putconn(conn)
    

    @app.app.route('/api/getSortedAppartments/<int:user_id>', methods=['GET'])
    def getSortedAppartments(user_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT * FROM users
WHERE id = %s""",
(user_id,))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 404
                
                flat_preferences = user[9]
            return jsonify(MAI.getSortedApartments(app, flat_preferences)), 200
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/favorites/add', methods=['POST'])
    def add_favorite():
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400
        if 'user_id' not in data:
            return jsonify({"status": "error", "message": "Missing user ID"}), 400
        if 'flat_id' not in data:
            return jsonify({"status": "error", "message": "Missing flat ID"}), 400

        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT favorites FROM users
WHERE id = %s""",
(data['user_id'],))
                user = cursor.fetchone()

                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 404
                try:
                    flat_id = int(data['flat_id'])
                except ValueError:
                    return jsonify({"status": "error", "message": "Invalid flat ID format"}), 400

                current_favorites = user
                if flat_id in current_favorites:
                    return jsonify({'success': False, 'message': 'Flat already in favorites'}), 200

                try:
                    current_favorites.append(flat_id)
                    cursor.execute("""
UPDATE users
SET favorites = %s
WHERE id = %s""",
(current_favorites, data['user_id']))
                    app.logger.info(f"Updating favorites for user {user.id}: {current_favorites}")
                    conn.commit()
                    return jsonify({'success': True}), 200
                except Exception as e:
                    app.logger.error(f"Error adding favorite: {str(e)}")
                    return jsonify({'success': False, 'message': 'Database error'}), 500
                finally:
                    app.connection_pool.putconn(conn)
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/favorites/remove', methods=['DELETE'])
    def remove_favorite():
        data = request.json
        if not data or not data.get('user_id'):
            return jsonify({"status": "error", "message": "Missing user ID"}), 400

        if not data.get('flat_id'):
            return jsonify({"status": "error", "message": "Missing flat ID"}), 400

        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT favorites FROM users
WHERE id = %s""",
(data['user_id'],))
                user = cursor.fetchone()
                if not user and user != []:
                    return jsonify({"status": "error", "message": "User not found"}), 404

                favorites = user

                if data['flat_id'] in favorites:
                    new_favorites = [f for f in favorites if f != data['flat_id']]
                    cursor.execute("""
UPDATE users
SET favorites = %s
WHERE id = %s""",
(new_favorites, data['user_id']))

                    try:
                        conn.commit()
                        return jsonify({'success': True})
                    except Exception as e:
                        return jsonify({'success': False, 'message': str(e)}), 500
            return jsonify({'success': False, 'message': 'Flat not found in favorites'})
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/favorites/<int:user_id>')
    def get_favorites(user_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT favorites FROM users
WHERE id = %s""",
(user_id,))
                favorites = cursor.fetchone()
                if not favorites and favorites != []:
                    return jsonify({"status": "error", "message": "User not found"}), 404

                # print("favorites =", favorites)
            return jsonify({'status': 'success', "favorites": favorites})
        finally:
            app.connection_pool.putconn(conn)
        

    @app.app.route('/api')
    def index():
        return 'index'
    

    @app.app.route('/api/shutdown', methods=['POST'])
    def shutdown():
        if request.headers.get('X-Shutdown-Token') != 'exit_token)))':
            return {"status": "error", "message": "Forbidden"}, 403
        os.kill(os.getpid(), signal.SIGINT)
        return {"status": "success", "message": "Выключение сервера..."}
    
