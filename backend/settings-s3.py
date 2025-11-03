# -*- encoding: UTF-8 -*-
# Django settings for myproject project.

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Thor Joerund Nydal', 'jnydal@gmail.com'),
)

#SITE_NAME ="felizdate.com"

AUTH_PROFILE_MODULE = 'main.models.UserProfile'

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'happydate',                      # Or path to database file if using sqlite3.
        'USER': 'postgres',                      # Not used with sqlite3.
        'PASSWORD': os.getenv("PG_PASSWORD", "unsafe-default-key"),                  # Not used with sqlite3.
        'HOST': 'localhost',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '5432',                      # Set to empty string for default. Not used with sqlite3.
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Europe/Oslo'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'
REFERENCE_LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = 'C:/Users/jny/Dropbox/Utvikling/Eclipse python27 workspace/xdate/media/'

MEDIA_URL = 'http://localhost:8000/media/'

STATIC_ROOT = 'C:/Users/jny/Dropbox/Utvikling/Eclipse python27 workspace/xdate/static/'

STATIC_URL = '/static/'

# S3/BOTO settings
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "unsafe-default-key")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "unsafe-default-key")
AWS_STORAGE_BUCKET_NAME = 'luckydate.s3.amazonaws.com'
# see http://developer.yahoo.com/performance/rules.html#expires
AWS_HEADERS = {
    'Expires': 'Thu, 15 Apr 2010 20:00:00 GMT',
    'Cache-Control': 'max-age=86400',
}
#STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'

# URL prefix for admin static files -- CSS, JavaScript and images.
# Make sure to use a trailing slash.
# Examples: "http://foo.com/static/admin/", "/static/admin/".
ADMIN_MEDIA_PREFIX = '/static/admin/'

# Additional locations of static files
STATICFILES_DIRS = (
    #'C:/Users/jny/Dropbox/Utvikling/Eclipse python27 workspace/django_tornado/static/'    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    #'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

ADMIN_MEDIA_PREFIX = '/static/admin/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = os.getenv("SECRET_KEY", "unsafe-default-key")

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'urls'

TEMPLATE_DIRS = (
    'C:/Users/jny/Dropbox/Utvikling/Eclipse python27 workspace/xdate/views/'
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    'django.contrib.admindocs',
    'main',
)

AUTHENTICATION_BACKENDS = (
    'backends.EmailAuthBackEnd',
    'django.contrib.auth.backends.ModelBackend'
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

# send mail settings
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = "587"
EMAIL_HOST_USER = 'jnydal@gmail.com'
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "unsafe-default-key")
EMAIL_USE_TLS = True

"""
   app internals
"""
# general
NOTIFICATION_MESSAGES_LIMIT = 5
DEFAULT_CONVERSATION_COUNT_LIMIT = 100
STORAGE_FILENAME_INSTANCE_SEPERATOR = '_'

# images
PROFILE_IMAGE_PATH = 'profileImages/'
TUMB_PROFILE_IMAGE_PATH = 'tumbProfileImages/'
MICRO_PROFILE_IMAGE_PATH = 'microProfileImages/'
TEMPORARY_IMAGE_PATH = "temp/"
TEMPORARY_PROFILE_IMAGE_PATH = "temp/profileImages/"
TEMPORARY_TUMB_PROFILE_IMAGE_PATH = "temp/tumbProfileImages/"
TEMPORARY_MICRO_PROFILE_IMAGE_PATH = "temp/microProfileImages/"

DEFAULT_PROFILE_IMAGE_INITIAL_HEIGHT = 700
DEFAULT_PROFILE_IMAGE_HEIGHT = 300
DEFAULT_PROFILE_IMAGE_THUMBNAIL_HEIGHT = 100
DEFAULT_PROFILE_IMAGE_MICRO_HEIGHT = 32
DEFAULT_IMAGE_FORMAT = "PNG"

MINIMUM_AGE = 16
