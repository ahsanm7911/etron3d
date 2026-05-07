from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password=None, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError("The Email field must be set")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    PLAN_CHOICES = [
        ("free", "Free"),
        ("pro", "Pro"),
        ("studio", "Studio"),
        ("enterprise", "Enterprise"),
    ]
    username = None
    email = models.EmailField(unique=True)

    google_id = models.CharField(max_length=255, blank=True, null=True)
    plan = models.CharField(choices=PLAN_CHOICES, default="free")
    credits = models.PositiveIntegerField(default=50)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # no extra required fields for createsuperuser

    objects = UserManager()

    def __str__(self):
        return self.email
