# app/auth.py
import os
from datetime import datetime, timedelta

import jwt
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

from app import db

from ....models.models import User

auth = Blueprint("auth", __name__)
SECRET_KEY = os.getenv("SECRET_KEY")


@auth.route("/signup", methods=["POST"])
def signup():
    """Creates a new user account."""
    try:
        data = request.get_json()
        username = data["username"]
        password = data["password"]

        # Check if the username already exists
        existing_user = db.users.find_one({"username": username})
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400

        # Create a new user and save it to the database
        new_user = User(username, password)
        db.users.insert_one(new_user.__dict__)
        return jsonify({"message": "User created successfully"}), 201

    except KeyError:
        return jsonify({"error": "Missing username or password"}), 400


@auth.route("/login", methods=["POST"])
def login():
    """Authenticates a user and returns a JWT token."""
    try:
        data = request.get_json()
        username = data["username"]
        password = data["password"]

        user_data = db.users.find_one({"username": username})
        if user_data:
            user = User(user_data["username"], "")
            user._id = user_data["_id"]
            user.password_hash = user_data["password_hash"]
            if user.check_password(password):
                # Generate a JWT token
                delta = timedelta(days=int(1))
                access_token = create_access_token(
                    identity=str(user._id),
                    expires_delta=delta,
                    additional_claims={"user_id": str(user._id)},
                )

                return jsonify({"token": access_token}), 200
            else:
                return jsonify({"error": "Invalid username or password"}), 401
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    except KeyError:
        return jsonify({"error": "Missing username or password"}), 400
