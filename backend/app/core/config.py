import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    #DATABASE_URL: str = os.getenv("DATABASE_URL")
    DATABASE_URL: str = "postgresql+psycopg2://peritas:peritas123@db:5432/peritas_db"

settings = Settings()
