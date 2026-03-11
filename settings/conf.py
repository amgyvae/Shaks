<<<<<<< HEAD
# Project modules
from decouple import config

# ----------------------------------------------
# Env id
#
ENV_POSSIBLE_OPTIONS = (
    "local",
    "prod",
)
ENV_ID = config("DJANGORLAR_ENV_ID", cast=str)
SECRET_KEY = "django-insecure-(m&m_9askj11ocrr%5okj37ll&*c3r!nc$)0!!xm@cxeygbuc9"
=======
from decouple import Config, RepositoryEnv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

config = Config(RepositoryEnv(BASE_DIR / "settings" / ".env"))

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", cast=bool)
BLOG_ENV_ID = config("BLOG_ENV_ID", default="local")
>>>>>>> 8b8d9f28565ec785158feefecda8de01869b8e04
