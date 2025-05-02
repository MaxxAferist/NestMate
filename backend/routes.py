from flask import jsonify, request, render_template
from datetime import datetime
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
import signal
# from app import Application
import MAI
import utils


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
            return jsonify({"status": "success", "message": "User registered"}), 200
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
                    return jsonify({"status": "error", "message": "User not found"}), 401
                
                if not check_password_hash(user[5], data['password']):
                    return jsonify({"status": "error", "message": "Invalid password"}), 401

            return jsonify({
                "status": "success",
                "message": "Login success",
                "user": {
                    "id": user[0],
                    "firstName": user[1],
                    "lastName": user[2],
                    "gender": user[3],
                    "email": user[4],
                    "password": user[5],
                    "date": user[6],
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
                    return jsonify({"status": "error", "message": "User not found"}), 401

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


    @app.app.route('/api/getAllUserData/<int:user_id>', methods=['GET'])
    def getAllUserData(user_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT * FROM users
WHERE id = %s""",
(user_id,))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 401
                
            with open ("flat_preferences.json", "w") as file:
                json.dump(user[7], file, ensure_ascii=False, indent=4)

            if user[7]:
                priorities = user[7].get("priorities")
                res = 0
                for key in priorities.keys():
                    res += priorities.get(key)
                print("summa =", res)
                
            response_data = {
                "status": "success",
                "user": {
                    "id": user[0],
                    "firstName": user[1],
                    "lastName": user[2],
                    "email": user[4],
                    "gender": user[3],
                    "signInDate": user[6].isoformat()
                },
                "flatPreferences": user[7] if user[7] else {},
                "rentPreferences": user[8] if user[8] else {}
            }
            return jsonify(response_data), 200
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
                    return jsonify({"status": "error", "message": "User not found"}), 401

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
                    return jsonify({"status": "error", "message": "User not found"}), 401
                try:
                    flat_id = int(data['flat_id'])
                except ValueError:
                    return jsonify({"status": "error", "message": "Invalid flat ID format"}), 400

                current_favorites = user[0]
                if not current_favorites:
                    current_favorites = []
                if flat_id in current_favorites:
                    return jsonify({'success': False, 'message': 'Flat already in favorites'}), 200

                try:
                    current_favorites.append(flat_id)
                    cursor.execute("""
UPDATE users
SET favorites = %s
WHERE id = %s""",
(current_favorites, data['user_id']))
                    app.app.logger.info(f"Updating favorites for user {data['user_id']}: {current_favorites}")
                    conn.commit()
                    return jsonify({'success': True}), 200
                except Exception as e:
                    app.app.logger.error(f"Error adding favorite: {str(e)}")
                    return jsonify({'success': False, 'message': 'Database error'}), 500
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
                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 401
                favorites = user[0]
                if not favorites:
                    favorites = []
                if data['flat_id'] in favorites:
                    new_favorites = [f for f in favorites if f != data['flat_id']]
                    cursor.execute("""
UPDATE users
SET favorites = %s
WHERE id = %s""",
(new_favorites, data['user_id']))
                else:
                    return jsonify({'success': False, 'message': 'Flat not found in favorites'}), 404
                
            try:
                conn.commit()
                return jsonify({'success': True}), 200
            except Exception as e:
                return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/favorites/<int:user_id>', methods=['GET'])
    def get_favorites(user_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT favorites, comparison FROM users
WHERE id = %s""",
(user_id,))
                apartments = cursor.fetchone()
                if not apartments:
                    return jsonify({"status": "error", "message": "User not found"}), 401

                favorites = apartments[0]
                if not favorites:
                    return jsonify({"status": "succes", "message": "User do not have favorites apartments"}), 201
                favorites = list(map(int, favorites))

                comparison = apartments[1]
                if not comparison:
                    comparison = [] 
                comparison = list(map(int, comparison))

                json_favorites = {
                    "apartments": [],
                    "favorites_list": favorites
                }
                apartments_info = utils.getJsonInformationAboutApartments(conn, favorites, favorites, comparison)
                json_favorites["apartments"] = apartments_info

            return jsonify({'status': 'success', "favorites": json_favorites}), 200
        except Exception as e:
            return jsonify({'status': 'error', "message": f"Error with getting favorites: {e}"}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/favorites_list/<int:user_id>', methods=['GET'])
    def get_favoritesList(user_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT favorites FROM users
WHERE id = %s""",
(user_id,))
                favorites = cursor.fetchone()

            if not favorites:
                return jsonify({"status": "error", "message": "User not found"}), 401

            favorites = favorites[0]
            if not favorites:
                favorites = []
            favorites = list(map(int, favorites))
            json_favorites = {
                "favorites_list": favorites
            }
            return jsonify({'status': 'success', "favorites": json_favorites}), 200
        except Exception as e:
            return jsonify({'status': 'error', "message": f"Error with getting favorites: {e}"}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/comparison/add', methods=['POST'])
    def add_comparison_item():
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
SELECT comparison FROM users
WHERE id = %s""",
(data['user_id'],))
                user = cursor.fetchone()

                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 401
                try:
                    flat_id = int(data['flat_id'])
                except ValueError:
                    return jsonify({"status": "error", "message": "Invalid flat_ID format"}), 400

                current_comparison = user[0]
                if not current_comparison:
                    current_comparison = []
                if flat_id in current_comparison:
                    return jsonify({'success': False, 'message': 'Flat already in comparison'}), 200

                try:
                    current_comparison.append(flat_id)
                    cursor.execute("""
UPDATE users
SET comparison = %s
WHERE id = %s""",
(current_comparison, data['user_id']))
                    app.app.logger.info(f"Updating comparison for user {data['user_id']}: {current_comparison}")
                    conn.commit()
                    return jsonify({'success': True}), 200
                except Exception as e:
                    app.app.logger.error(f"Error adding comparison item: {str(e)}")
                    return jsonify({'success': False, 'message': 'Database error'}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/comparison/remove', methods=['DELETE'])
    def remove_comparison():
        data = request.json
        if not data or not data.get('user_id'):
            return jsonify({"status": "error", "message": "Missing user ID"}), 400

        if not data.get('flat_id'):
            return jsonify({"status": "error", "message": "Missing flat ID"}), 400

        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT comparison FROM users
WHERE id = %s""",
(data['user_id'],))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 401
                comparison = user[0]
                if not comparison:
                    comparison = []

                if data['flat_id'] in comparison:
                    new_favorites = [f for f in comparison if f != data['flat_id']]
                    cursor.execute("""
UPDATE users
SET comparison = %s
WHERE id = %s""",
(new_favorites, data['user_id']))
                else:
                    return jsonify({'success': False, 'message': 'Flat not found in comparison'}), 404
            try:
                conn.commit()
                return jsonify({'success': True})
            except Exception as e:
                return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/comparison/<int:user_id>', methods=['GET'])
    def get_comparison(user_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT comparison, favorites FROM users
WHERE id = %s""",
(user_id,))
                apartments = cursor.fetchone()
                if not apartments:
                    return jsonify({"status": "error", "message": "User not found"}), 401

                comparison = apartments[0]
                if not comparison:
                    return jsonify({"status": "succes", "message": "User do not have comparison apartments"}), 201
                comparison = list(map(int, comparison))

                favorites = apartments[1]
                if not favorites:
                    favorites = []
                favorites = list(map(int, comparison))
    
                json_comparison = {
                    "apartments": [],
                    "comparison_list": comparison
                }
                apartments_info = utils.getJsonInformationAboutApartmentsForComparison(conn, comparison, favorites)
                json_comparison["apartments"] = apartments_info

            return jsonify({'status': 'success', "comparison": json_comparison}), 200
        except Exception as e:
            return jsonify({'status': 'error', "message": f"Error with getting comparison: {e}"}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/mainIndex/<int:user_id>/<int:page>', methods=['GET'])
    def getApartmentsForMainIndex(user_id, page):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT ids_last_MAI, favorites, comparison FROM users
WHERE id = %s""",
(user_id,))
                apartments = cursor.fetchone()
                if not apartments:
                    return jsonify({"status": "error", "message": "User not found"}), 401
                
                ids = apartments[0]
                favorites = apartments[1]
                if not favorites:
                    favorites = []
                else:
                    favorites = list(map(int, favorites))
                
                comparison = apartments[2]
                if not comparison:
                    comparison = []
                else:
                    comparison = list(map(int, comparison))

                json_apartments = {
                    "apartments": [],
                    "favorites_list": favorites,
                    "comparison_list": comparison
                }
                if not ids:
                    try:
                        ids = utils.idsFromPage(conn, 0, page, 25)
                        apartments_info = utils.getJsonInformationAboutApartments(conn, ids, favorites, comparison)
                    except Exception as e:
                        print(f"[ERROR] error get json: {e}")
                else:
                    ids = list(map(int, ids))
                    apartments_info = utils.getJsonInformationAboutApartments(conn, ids, favorites, comparison)
                json_apartments["apartments"] = apartments_info
            return jsonify({'status': 'success', "apartments": json_apartments}), 200
        except Exception as e:
            return jsonify({'status': 'error', "message": f"Error with getting apartments: {e}"}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/sorted_mai/<int:user_id>', methods=['POST'])
    def sortedApartmentsByMAI(user_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
SELECT flat_preferences FROM users
WHERE id = %s""",
(user_id,))
                flat_preferences = cursor.fetchone()
                if not flat_preferences:
                    return jsonify({"status": "error", "message": "User not found"}), 401
                
                flat_preferences = flat_preferences[0]
                if not flat_preferences:
                    return jsonify({"status": "success", "message": "Flat preferences dos not exist"}), 201
                
                ids_and_weights = MAI.getSortedApartments(app, flat_preferences)
                for elem in ids_and_weights:
                    print(elem)
                    # apartments_info = utils.getJsonInformationAboutApartments(conn, ids, favorites, comparison)
                # json_apartments["apartments"] = apartments_info
            return jsonify({'status': 'success', "apartments": {}}), 200
        except Exception as e:
            return jsonify({'status': 'error', "message": f"Error with getting apartments: {e}"}), 500
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
    
