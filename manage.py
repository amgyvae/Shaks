#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
<<<<<<< HEAD
=======
from settings.conf import BLOG_ENV_ID

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    f"settings.env.{BLOG_ENV_ID}"
)
>>>>>>> 8b8d9f28565ec785158feefecda8de01869b8e04


def main():
    """Run administrative tasks."""
<<<<<<< HEAD
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.base")
=======
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.settings')
>>>>>>> 8b8d9f28565ec785158feefecda8de01869b8e04
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


<<<<<<< HEAD
if __name__ == "__main__":
=======
if __name__ == '__main__':
>>>>>>> 8b8d9f28565ec785158feefecda8de01869b8e04
    main()
