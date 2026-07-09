import os
from dotenv import load_dotenv

if not os.getenv("RENDER"):
    load_dotenv()


class Settings:
    def __init__(self):
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        self.SECRET_KEY = os.getenv("SECRET_KEY")
        self.ALGORITHM = os.getenv("ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "129600")
        )

        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL is missing.")

        # Render sometimes provides postgres://
        if self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace(
                "postgres://",
                "postgresql://",
                1,
            )

        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY is missing.")


settings = Settings()