import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from catalog.models import Book, Edition
from ai_engine.models import AIAvatar

print(f"Total Books: {Book.objects.count()}")
print(f"Total Editions: {Edition.objects.count()}")
print(f"Total Avatars: {AIAvatar.objects.count()}")
print("-" * 50)

for book in Book.objects.all():
    editions = Edition.objects.filter(book=book)
    avatars_count = AIAvatar.objects.filter(edition__book=book).count()
    print(f"Book: {book.title} (ID: {book.id}) -> Editions: {editions.count()}, Avatars: {avatars_count}")
    for a in AIAvatar.objects.filter(edition__book=book):
        print(f"   └─ Avatar: {a.name} (ID: {a.id}, Unlock Cap: {a.unlock_at_chapter}, Author: {a.is_author})")
