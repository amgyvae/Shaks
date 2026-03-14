from decouple import Config, RepositoryEnv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

config = Config(RepositoryEnv(BASE_DIR / "settings" / ".env"))

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", cast=bool)
BLOG_ENV_ID = config("BLOG_ENV_ID", default="local")