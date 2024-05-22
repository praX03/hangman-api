import os
from datetime import timedelta


class Config:
    JWT_SECRET_KEY = "please-remember-to-change-me"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=35)
    MONGO_URI = os.getenv("MONGO_URI")
    SECRET_KEY = "super_secure_secret_key"
