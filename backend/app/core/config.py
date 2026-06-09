import os
from dotenv import load_dotenv

if not os.getenv("RENDER"):
    load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-this")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    def __init__(self):
        if not self.DATABASE_URL:
            raise ValueError("❌ DATABASE_URL environment variable is not set!")

settings = Settings()