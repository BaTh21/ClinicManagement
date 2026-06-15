import os
from dotenv import load_dotenv

if not os.getenv("RENDER"):
    load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "129600"))

    def __init__(self):
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is not set on Render")
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY environment variable is not set on Render")

settings = Settings()