import os
from pathlib import Path
import dj_database_url
from corsheaders.defaults import default_headers

# BASE DIR
BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET KEY
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-p8dn&&na8r2weuu#6e)@0%s*ykk*(-xtrya%l@4!&0e!v&qyg*",
)

# DEBUG
DEBUG = os.environ.get("DEBUG", "True") == "True"

# ALLOWED HOSTS
ALLOWED_HOSTS = ["inventory-backend-02vy.onrender.com", "localhost", "127.0.0.1"]


# APPLICATIONS
INSTALLED_APPS = [
    # Django apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # 3rd party
    "rest_framework",
    "corsheaders",
    "cloudinary",
    "cloudinary_storage",

    # Your ap
    "inventory",
]

# MIDDLEWARE
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ✅ Allow only your Netlify site
CORS_ALLOWED_ORIGINS = [
    "https://bright-marshmallow-2675ab.netlify.app",
]

# ✅ Allow PDF blob download (binary data)
CORS_ALLOW_HEADERS = list(default_headers) + [
    "content-disposition",  # required for file downloads like PDFs
]

# ✅ (Optional but safe) Allow credentials if you use auth
CORS_ALLOW_CREDENTIALS = True


ROOT_URLCONF = "backend.urls"

# TEMPLATES
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# DATABASES
DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get(
            "DATABASE_URL",
            f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
        ),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# PASSWORD VALIDATION
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# INTERNATIONALIZATION
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# STATIC FILES
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Cloudinary settings....
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get("CLOUDINARY_CLOUD_NAME", "dvvjsbqqt"),
    'API_KEY': os.environ.get("CLOUDINARY_API_KEY", "692831147957173"),
    'API_SECRET': os.environ.get("CLOUDINARY_API_SECRET", "1rF4lDsBEJN2m4NpHp5PsW6TzP0"),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
