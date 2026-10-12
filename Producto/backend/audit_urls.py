import os
import sys

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.urls import get_resolver

resolver = get_resolver()

def list_urls(lis, prefix=''):
    for pat in lis:
        if hasattr(pat, 'url_patterns'):
            list_urls(pat.url_patterns, prefix + str(pat.pattern))
        else:
            name = pat.callback.__name__ if hasattr(pat.callback, '__name__') else pat.callback.__class__.__name__
            mod = pat.callback.__module__
            print(f"  - {prefix}{pat.pattern}  ==>  {mod}.{name}")

print("=== ALL ACTIVE REGISTERED ENDPOINTS ===")
list_urls(resolver.url_patterns)
