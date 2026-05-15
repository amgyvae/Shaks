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
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and that "
            "you activated a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
