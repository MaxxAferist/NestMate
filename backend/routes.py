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


def init_routes(app):  #: Application):
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
        data = request.json  # Получаем данные из запроса
        print(type(data))
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
        INSERT INTO users (
                    first_name,
                    email,
                    password,
                    last_name,
                    gender,
                    flat_preferences,
                    rent_preferences,
                    favorites,
                    comparison,
                    ids_last_MAI
                            )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id""",
            (data["firstName"], data["email"], hashed_password,
                                data.get('lastName', ""), data.get('gender', ""),
                                json.dumps(data.get('flatPreferences', {})),
                                json.dumps(data.get('rentPreferences', {})), [], [], []))
                user_id = cursor.fetchone()[0]
            conn.commit()
            return jsonify({"status": "success", "message": "User registered", "user_id": user_id}), 200
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/logIn', methods=['POST'])
    def logIn():
        data = request.json
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"status": "error", "message": "Missing data"}), 400
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
                "user_id" : user[0]
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

            # with open("flat_preferences.json", "w") as file:
            #     json.dump(user[8], file, ensure_ascii=False, indent=4)

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
                    return jsonify({"status": "success", "message": "User do not have favorites apartments"}), 201
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


    @app.app.route('/api/favorites/clear', methods=['DELETE'])
    def clearFavorites():
        data = request.json
        if not data or not data.get('user_id'):
            return jsonify({"status": "error", "message": "Missing user ID"}), 400

        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
        SELECT id FROM users
        WHERE id = %s""",
            (data['user_id'],))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 401
                
                cursor.execute("""
        UPDATE users
        SET favorites = %s
        WHERE id = %s""",
            ([], data['user_id']))
            try:
                conn.commit()
                return jsonify({'success': True})
            except Exception as e:
                return jsonify({'success': False, 'message': str(e)}), 500
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
                    return jsonify({"status": "success", "message": "User do not have comparison apartments"}), 201
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


    @app.app.route('/api/comparison_list/<int:user_id>', methods=['GET']) # функция для отправки id квартир для сравнения
    def get_comparisonList(user_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
        SELECT comparison FROM users
        WHERE id = %s""",
            (user_id,))
                comparison = cursor.fetchone()

            if not comparison:
                return jsonify({"status": "error", "message": "User not found"}), 401

            comparison = comparison[0]
            if not comparison:
                comparison = []
            comparison = list(map(int, comparison))
            json_comparison = {
                "comparison_list": comparison
            }
            return jsonify({'status': 'success', "comparison": json_comparison}), 200
        except Exception as e:
            return jsonify({'status': 'error', "message": f"Error with getting comparison: {e}"}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/comparison/clear', methods=['DELETE'])
    def clearComparison():
        data = request.json
        if not data or not data.get('user_id'):
            return jsonify({"status": "error", "message": "Missing user ID"}), 400

        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
        SELECT id FROM users
        WHERE id = %s""",
            (data['user_id'],))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"status": "error", "message": "User not found"}), 401
                
                cursor.execute("""
        UPDATE users
        SET comparison = %s
        WHERE id = %s""",
            ([], data['user_id']))
            try:
                conn.commit()
                return jsonify({'success': True})
            except Exception as e:
                return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/mainIndex/<int:user_id>/<int:page>', methods=['GET'])
    def getApartmentsForMainIndexForUser(user_id, page):
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
                    # ids = list(map(lambda x: x[0], ids))
                    ids = ids[(page - 1) * 25:page * 25]
                    apartments_info = utils.getJsonInformationAboutApartments(conn, ids, favorites, comparison)
                json_apartments["apartments"] = apartments_info
            return jsonify({'status': 'success', "apartments": json_apartments}), 200
        except Exception as e:
            print(f"[ERROR]: {e}")
            return jsonify({'status': 'error', "message": f"Error with getting apartments: {e}"}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/mainIndex/<int:page>', methods=['GET'])
    def getApartmentsForMainIndex(page):
        conn = app.connection_pool.getconn()
        try:
            json_apartments = {
                "apartments": []
            }
            try:
                ids = utils.idsFromPage(conn, 0, page, 25)
                apartments_info = utils.getJsonInformationAboutApartments(conn, ids, [], [])
            except Exception as e:
                print(f"[ERROR] error get json: {e}")
            json_apartments["apartments"] = apartments_info
            return jsonify({'status': 'success', "apartments": json_apartments}), 200
        except Exception as e:
            print(f"[ERROR]: {e}")
            return jsonify({'status': 'error', "message": f"Error with getting apartments: {e}"}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route('/api/sorted_mai/<int:user_id>/<int:type_sdelki>', methods=['POST'])
    def sortedApartmentsByMAI(user_id, type_sdelki):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
        SELECT flat_preferences, rent_preferences FROM users
        WHERE id = %s""",
            (user_id,))
                preferences = cursor.fetchone()
                if not preferences:
                    return jsonify({"status": "error", "message": "User not found"}), 401

                flat_preferences = preferences[0]
                rent_preferences = preferences[1]
                if not flat_preferences:
                    return jsonify({"status": "success", "message": "Preferences dos not exist"}), 201
                if not rent_preferences and type_sdelki == 1:
                    return jsonify({"status": "success", "message": "Preferences dos not exist"}), 201
                try:
                    ids_and_weights = MAI.getSortedApartments(app, flat_preferences, rent_preferences, type_sdelki)
                    ids = list(map(lambda x: x[0], ids_and_weights))

                    cursor.execute("""
        UPDATE users
        SET ids_last_MAI = %s
        WHERE id = %s""",
            (ids, user_id))
                    conn.commit()
                except Exception as e:
                    print(f"[ERROR]: {e}")
                    return jsonify({'status': 'error', "message": f"Error with getting apartments: {e}"}), 500
                    
            return jsonify({'status': 'success', "message": "MAI finished with code 200"}), 200
        except Exception as e:
            return jsonify({'status': 'error', "message": f"Error with getting apartments: {e}"}), 500
        finally:
            app.connection_pool.putconn(conn)


    @app.app.route("/api/apartment/<int:flat_id>", methods=["GET"])
    def getApartmentCard(flat_id):
        conn = app.connection_pool.getconn()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
        SELECT * FROM apartment_data
        WHERE id = %s""",
            (flat_id,))
                apartment = cursor.fetchone()
                if not apartment:
                    return jsonify({"status": "error", "message": "Flat not found"}), 401

            link = apartment[1]

            if apartment[2] == 0:
                type_sdelki = "sell"
            else:
                type_sdelki = "rent"

            type_apartment = apartment[3]
            pictures = apartment[4][0].split(", ")
            address = apartment[5]
            coord_lat = apartment[6]
            coord_lng = apartment[7]
            region = apartment[8]
            city = apartment[9]
            district = apartment[10]
            price = apartment[11]
            count_rooms = apartment[12]
            balcony = apartment[13]
            ceiling_height = apartment[14]
            floor = apartment[15]
            count_floors = apartment[16]
            area = apartment[17]
            material_house = apartment[18]
            remont = apartment[19]
            additional_amenities = apartment[20]
            minuts_for_park = apartment[21]
            minuts_for_hospital = apartment[22]
            minuts_for_mall = apartment[23]
            minuts_for_kindergarten = apartment[24]
            minuts_for_school = apartment[25]
            minuts_for_store = apartment[26]
            minuts_for_busstop = apartment[27]
            minuts_for_subway = apartment[28]
            kids = apartment[29]
            animals = apartment[30]
            smoking = apartment[31]
            sanuzel = apartment[32]
            multimedia = apartment[33]
            count_of_guests = apartment[34]
            description = apartment[35]
            year_of_construction = apartment[36]
            count_of_passenger_elevators = apartment[37]
            count_of_freight_elevators = apartment[38]
            furniture = apartment[39]
            technique = apartment[40]

            amenities = additional_amenities + furniture + technique #

            if apartment[2] == 0:
                json_apartment = {
                    "id": flat_id,
                    "link": link,
                    "type": type_sdelki,
                    "type_apartment": type_apartment,
                    "photos": pictures, #
                    "coordinates": { #
                        "lat": coord_lat,
                        "lng": coord_lng
                    },
                    "geo": {
                        "region": region,
                        "city": city,
                        "district": district,
                        "address": address
                    },
                    "price": price,
                    "rooms": count_rooms,
                    "balconyType": balcony,
                    "ceilingHeight": ceiling_height,
                    "floor": floor,
                    "buildingFloors": count_floors,
                    "buildingYear": year_of_construction,
                    "buildingMaterial": material_house,
                    "area": area,
                    "renovationCondition": remont,
                    "amenities": amenities, #
                    "infrastructure": {
                        "parks": minuts_for_park,
                        "hospitals": minuts_for_hospital,
                        "shoppingCenters": minuts_for_mall,
                        "shops": minuts_for_store,
                        "schools": minuts_for_school,
                        "kindergartens": minuts_for_kindergarten
                    },
                    "transportAccessibility": {
                        "publicTransportStops": minuts_for_busstop,
                        "metroDistance": minuts_for_subway
                    },
                    "flags": {
                        "kids": kids,
                        "animals": animals,
                        "smoking": smoking
                    },
                    "sanuzel": sanuzel,
                    "multimedia": multimedia,
                    "count_of_guests": count_of_guests,
                    "description": description,
                    "count_of_passenger_elevators": count_of_passenger_elevators,
                    "count_of_freight_elevators": count_of_freight_elevators
                }
            elif apartment[2] == 1:
                json_apartment = {
                    "id": flat_id,
                    "link": link,
                    "type": type_sdelki,
                    "type_apartment": type_apartment,
                    "photos": pictures, #
                    "coordinates": { #
                        "lat": coord_lat,
                        "lng": coord_lng
                    },
                    "geo": {
                        "region": region,
                        "city": city,
                        "district": district,
                        "address": address
                    },
                    "price": price,
                    "rooms": count_rooms,
                    "balconyType": balcony,
                    "ceilingHeight": ceiling_height,
                    "floor": floor,
                    "buildingFloors": count_floors,
                    "buildingYear": year_of_construction,
                    "buildingMaterial": material_house,
                    "area": area,
                    "renovationCondition": remont,
                    "amenities": amenities, #
                    "infrastructure": {
                        "parks": minuts_for_park,
                        "hospitals": minuts_for_hospital,
                        "shoppingCenters": minuts_for_mall,
                        "shops": minuts_for_store,
                        "schools": minuts_for_school,
                        "kindergartens": minuts_for_kindergarten
                    },
                    "transportAccessibility": {
                        "publicTransportStops": minuts_for_busstop,
                        "metroDistance": minuts_for_subway
                    },
                    "sanuzel": sanuzel,
                    "multimedia": multimedia,
                    "count_of_guests": count_of_guests,
                    "description": description,
                    "count_of_passenger_elevators": count_of_passenger_elevators,
                    "count_of_freight_elevators": count_of_freight_elevators
                }
            return jsonify({'status': 'success', "apartments": json_apartment}), 200
        except Exception as e:
            return jsonify({'status': 'error', "message": f"Error with getting apartment: {e}"}), 500
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
