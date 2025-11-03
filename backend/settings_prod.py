# -*- encoding: UTF-8 -*-
DEBUG = False
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Thor Joerund Nydal', 'jnydal@gmail.com'),
)

RECAPTCHA_PRIVATE_KEY = os.getenv("RECAPTCHA_PRIVATE_KEY", "unsafe-default-key")

AUTH_PROFILE_MODULE = 'felizdate.main.models.UserProfile'
MANAGERS = ADMINS
TIME_ZONE = 'Europe/Oslo'
LANGUAGE_CODE = 'en'
SITE_ID = 1
USE_I18N = True
USE_L10N = True
USE_TZ = True
SECRET_KEY = os.getenv("SECRET_KEY", "unsafe-default-key")

gettext = lambda s: s

LANGUAGES = (
    ('no', gettext('Norwegian')),
    ('en', gettext('English')),
)

LOCALE_PATHS = ( "/srv/felizdate/locale/",)

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'felizdate',                      # Or path to database file if using sqlite3.
        'USER': 'django',                      # Not used with sqlite3.
        'PASSWORD': os.getenv("PG_PASSWORD", "unsafe-default-key"),                  # Not used with sqlite3.
        'HOST': 'localhost',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '5432',                      # Set to empty string for default. Not used with sqlite3.
    }
}

CACHES = {
    'default': {
        #'BACKEND': 'johnny.backends.memcached.MemcachedCache',
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
        #'JOHNNY_CACHE': True,
    }
}

JOHNNY_MIDDLEWARE_KEY_PREFIX='jc_myproj'

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.core.context_processors.i18n",
)

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    #'johnny.middleware.LocalStoreClearMiddleware',
    #'johnny.middleware.QueryCacheMiddleware',
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
     #'felizdate.main.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.transaction.TransactionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'felizdate.main.middleware.ActivityMiddleware',
)

ROOT_URLCONF = 'felizdate.urls'
TEMPLATE_DIRS = (
    '/srv/felizdate/views/'
)

DEFAULT_FILE_STORAGE = 'storages.backends.s3.S3Storage'

MEDIA_ROOT = '/srv/felizdate/media/'

MEDIA_URL = 'http://dg1h6uvotkrdh.cloudfront.net/'

MEDIA_PATH = '/m/'

MAX_FILE_SIZE_MEDIA = 10000000

PROFILE_MEDIA_PATH = 'pm/'

TEMPORARY_PROFILE_MEDIA_PATH = 'temp/profilemedia/'

TEMP_MEDIA_URL = '/media/'

STATIC_URL = 'http://dg1h6uvotkrdh.cloudfront.net/s/'

STATIC_ROOT = '/srv/felizdate/static/'

SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"

JS_RESPONSE_HEADER = '<script type="text/javascript" src="' + STATIC_URL + '3rdjs/3rdjs.min.js"></script><script type="text/javascript" src="' + STATIC_URL + 'js/js.min.js"></script>'

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'felizdate.main',
)

AUTHENTICATION_BACKENDS = (
    'felizdate.backends.EmailAuthBackEnd',
    'django.contrib.auth.backends.ModelBackend'
)

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
AWS_CF_DISTRIBUTION_ID = 'E2L27G0BM8VKSP';

#from S3 import DEFAULT_HOST
#DEFAULT_HOST.re = "s3-eu-west-1.amazonaws.com"

AWS_STORAGE_BUCKET_NAME = 'felizdate'
# see http://developer.yahoo.com/performance/rules.html#expires
AWS_HEADERS = {
    'Expires': 'Thu, 15 Dec 2012 20:00:00 GMT',
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