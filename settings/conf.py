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