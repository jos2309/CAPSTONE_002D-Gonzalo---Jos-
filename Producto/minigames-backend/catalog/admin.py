from django.contrib import admin
from .models import Book, Chapter

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_active', 'created_at')
    search_fields = ('title',)

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('book', 'order', 'title')
    list_filter = ('book',)