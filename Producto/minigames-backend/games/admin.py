from django.contrib import admin
from .models import Minigame, BookMinigame

@admin.register(Minigame)
class MinigameAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(BookMinigame)
class BookMinigameAdmin(admin.ModelAdmin):
    list_display = ('title', 'minigame', 'book', 'chapter')
    list_filter = ('minigame', 'book')