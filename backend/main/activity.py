# -*- encoding: UTF-8 -*-
from django.conf import settings
from datetime import datetime, timedelta 

class ActivityManager():
    LAST_REQUEST = {}
    
    def __init__(self):
        pass
    
    @classmethod
    def isActive(self, userProfile):
        if self.LAST_REQUEST.has_key(userProfile):
            now = datetime.now()
            if (now - self.LAST_REQUEST[userProfile]) > timedelta (minutes = settings.MAX_IDLE_TIME):
                return False
            else:
                return True
        else:
            return False

    @classmethod
    def filter(self, userProfiles):
        result = []
        for userprofile in userProfiles:
            if not self.isActive(userprofile): # TODO: remove hardcoding
                userprofile.status = 3
            result.append(userprofile)
        return result
    
    @classmethod
    def filterLoggedIn(self, userProfiles):
        result = []
        for userprofile in userProfiles:
            if self.isActive(userprofile) and userprofile.status != 3: # TODO: remove hardcoding
                result.append(userprofile)
        return result
    
    @classmethod
    def remove(self, userProfile):
        if self.LAST_REQUEST.has_key(userProfile):
            del self.LAST_REQUEST[userProfile]
