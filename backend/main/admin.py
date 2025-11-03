# -*- encoding: UTF-8 -*-
'''
Created on 1. mai 2011

@author: jny
'''

# registers app model to admin interface

from models import Country
from models import City
from models import UserProfile

from django.contrib import admin

admin.site.register(Country)
admin.site.register(City)
admin.site.register(UserProfile)