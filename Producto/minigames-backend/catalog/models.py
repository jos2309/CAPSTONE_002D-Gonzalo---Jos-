from django.db import models
from django.utils.text import slugify
from core.models import TimeStampedModel

class Book(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=512, unique=True, blank=True)
    synopsis = models.TextField(blank=True, default='')
    cover_image = models.ImageField(upload_to='book_covers/', null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Chapter(TimeStampedModel):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=255, blank=True, default='')
    order = models.PositiveIntegerField()
    content_html = models.TextField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.book.title} - Cap {self.order}: {self.title}"