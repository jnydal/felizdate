# -*- encoding: UTF-8 -*-
# Django settings for bototest project.

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Thor Joerund Nydal', 'jnydal@gmail.com'),
)

AUTH_PROFILE_MODULE = 'felizdate.main.models.UserProfile'

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'felizdate',                      # Or path to database file if using sqlite3.
        'USER': 'django',                      # Not used with sqlite3.
        'PASSWORD': os.getenv("PG_PASSWORD", "unsafe-default-key"),                  # Not used with sqlite3.
        'HOST': '127.0.0.1',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '5432',                      # Set to empty string for default. Not used with sqlite3.
    }
}

AWS_CF_DISTRIBUTION_ID = 'E2L27G0BM8VKSP';
SESSION_COOKIE_HTTPONLY=False

RECAPTCHA_PRIVATE_KEY = os.getenv("RECAPTCHA_PRIVATE_KEY", "unsafe-default-key")

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
LANGUAGE_CODE = 'en'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

JS_RESPONSE_HEADER = '<script type="text/javascript" src="/static/3rdjs/08_mootools-core-1.4.1-full-nocompat.js"></script><script type="text/javascript" src="/static/js/controller/01_AbstractObject.js"></script><script type="text/javascript" src="/static/js/communication/02_ServerResponse.js"></script><script type="text/javascript" src="/static/js/controller/02_Exception.js"></script><script type="text/javascript" src="/static/js/controller/05_ActionRequest.js"></script>'

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = 'C:/users/jny/Dropbox/Utvikling/Eclipse python27 workspace/felizdate/media/'

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = 'http://dev.felizdate.com:8080/media/'

MEDIA_PATH = '/m/'

MAX_FILE_SIZE_MEDIA = 10000000

PROFILE_MEDIA_PATH = 'pm/'

TEMPORARY_PROFILE_MEDIA_PATH = 'temp/profilemedia/'

TEMP_MEDIA_URL = MEDIA_URL

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = 'C:/users/jny/Dropbox/Utvikling/Eclipse python27 workspace/felizdate/static/'

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = 'http://127.0.0.1:8000/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    'C:/Users/jny/Dropbox/Utvikling/Eclipse python27 workspace/felizdate/static/',
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

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
    #'felizdate.main.customMiddleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    #'felizdate.main.middleware.ActivityMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'felizdate.urls'

# Python dotted path to the WSGI application used by Django's runserver.
#WSGI_APPLICATION = 'felizdate.wsgi.application'

TEMPLATE_DIRS = (
    'C:/users/jny/Dropbox/Utvikling/Eclipse python27 workspace/felizdate/views/'
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.core.context_processors.i18n",
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    #'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    #'django.contrib.admindocs',
    'felizdate.main',
)

AUTHENTICATION_BACKENDS = (
    'felizdate.backends.EmailAuthBackEnd',
    'django.contrib.auth.backends.ModelBackend'
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'socket': {
            'level': 'DEBUG',
            'propagate': True,
        },
    }
}

# S3/BOTO settings
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "unsafe-default-key")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "unsafe-default-key")
AWS_STORAGE_BUCKET_NAME = 'felizdate'
# see http://developer.yahoo.com/performance/rules.html#expires
AWS_HEADERS = {
    'Cache-Control': 'max-age=86400',
}

# send mail settings
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = "587"
EMAIL_HOST_USER = 'support@felizdate.com'
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "unsafe-default-key")
EMAIL_USE_TLS = True

"""
   app internals
"""
# general
MAX_IDLE_TIME = 10
NOTIFICATION_MESSAGES_LIMIT = 5
DEFAULT_CONVERSATION_COUNT_LIMIT = 100
STORAGE_FILENAME_INSTANCE_SEPERATOR = '_'

# images
PROFILE_IMAGE_PATH = 'profileImages/'
TUMB_PROFILE_IMAGE_PATH = 'tumbProfileImages/'
MICRO_PROFILE_IMAGE_PATH = 'microProfileImages/'
PENDING_PROFILE_IMAGE_PATH = 'pending/profileImages/'
PENDING_TUMB_PROFILE_IMAGE_PATH = 'pending/tumbProfileImages/'
PENDING_MICRO_PROFILE_IMAGE_PATH = 'pending/microProfileImages/'
TEMPORARY_IMAGE_PATH = "temp/"
TEMPORARY_PROFILE_IMAGE_PATH = "temp/profileImages/"
TEMPORARY_TUMB_PROFILE_IMAGE_PATH = "temp/tumbProfileImages/"
TEMPORARY_MICRO_PROFILE_IMAGE_PATH = "temp/microProfileImages/"

DEFAULT_PROFILE_IMAGE_INITIAL_HEIGHT = 700
DEFAULT_PROFILE_IMAGE_HEIGHT = 300
DEFAULT_PROFILE_IMAGE_THUMBNAIL_HEIGHT = 100
DEFAULT_PROFILE_IMAGE_MICRO_HEIGHT = 32
DEFAULT_IMAGE_FORMAT = "PNG"

GPS_COVER_RANGE=3000 # in metres
MINIMUM_AGE = 16

DEFAULT_CITY_ID = 2974
