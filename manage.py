<<<<<<< HEAD
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from settings.conf import BLOG_ENV_ID

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    f"settings.env.{BLOG_ENV_ID}",
)

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.settings')
=======
import os
import sys
from pathlib import Path


def main() -> None:
    from decouple import AutoConfig
    _settings_dir = Path(__file__).resolve().parent / 'settings'
    _config = AutoConfig(search_path=_settings_dir)
    env_id: str = _config('SHAKS_ENV_ID', default='local')

    os.environ.setdefault(
        'DJANGO_SETTINGS_MODULE',
        f'settings.env.{env_id}',
    )
>>>>>>> final changes with requirements
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
<<<<<<< HEAD
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
=======
            "Couldn't import Django. Are you sure it's installed and that "
            "you activated a virtual environment?"
>>>>>>> final changes with requirements
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
