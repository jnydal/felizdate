# -*- encoding: UTF-8 -*-
"""
Created on 8. Oct. 2011

@author: jny
"""
from datetime import datetime
from profileUtils import getAge
from django.conf import settings
from django.contrib.gis.measure import D
from models import UserProfile, EducationalDegree, Interest
from async import AsyncSession
from constants import Status

def getBirthYear(age):
    age = int(age)
    year = datetime.now().year - age
    return year

def getMinAge(userprofile):
    age = getAge(userprofile)
    if age < 25:
        return 18
    else:
        return age - 7

def getMaxAge(userprofile):
    age = getAge(userprofile)
    return age + 7

def lowerThan(educationalDegree, educationalDegrees):
    result = []
    for degree in educationalDegrees:
        if educationalDegree.sortnumber > degree.sortnumber:
            result.append(degree)
    return result

def higherThan(educationalDegree, educationalDegrees):
    result = []
    for degree in educationalDegrees:
        if educationalDegree.sortnumber < degree.sortnumber:
            result.append(degree)
    return result
    
"""

main search filters

"""
def getBasicMatches(userProfile):
    filterDict = {
                     "minAge" : getMinAge(userProfile),
                     "maxAge" : getMaxAge(userProfile),
                     "gender" : userProfile.partnergender,
                     "cityId" : userProfile.city.id,
                                                              }
    bodyTypes = userProfile.partnerbodytypes.all()
    hairTypes = userProfile.partnerhairtypes.all()
    skinTypes = userProfile.partnerskintypes.all()
    eyeColors = userProfile.partnereyecolors.all()
    lookingForTypes = userProfile.lookingForTypes.all()
    
    if bodyTypes:
        filterDict.update({"body" : bodyTypes})
    if hairTypes:
        filterDict.update({"hair" : hairTypes})
    if skinTypes:
        filterDict.update({"skin" : skinTypes})
    if eyeColors:
        filterDict.update({"eyes" : eyeColors})
    if lookingForTypes:
        filterDict.update({"lookingFor" : lookingForTypes})
    
    query = getFilteredProfiles(filterDict, userProfile)
    
    educationalDegrees = EducationalDegree.objects.all()
    
    # partner preferences filter
    if userProfile.partneroccupation:
        query = query.filter(occupation=userProfile.occupation)
    if userProfile.partnereducation:
        if userProfile.partnereducation == 1:
            query = query.filter(educationaldegree=userProfile.educationaldegree)
        elif userProfile.partnereducation == 2:
            query = query.filter(educationaldegree__in=lowerThan(userProfile.educationaldegree, educationalDegrees)) # TODO: lower than user
        elif userProfile.partnereducation == 3:
            query = query.filter(educationaldegree__in=higherThan(userProfile.educationaldegree, educationalDegrees)) # TODO: higher than user
    if userProfile.partnerpolitical:
        query = query.filter(political=userProfile.political)
    if userProfile.partnerreligion:
        query = query.filter(religion=userProfile.religion)
    
    return query.distinct()
    
def getInterestMatches(userProfile, optionalfilter):
    if optionalfilter:
        return optionalfilter.filter(interests__in=Interest.objects.filter(userprofiles=userProfile)).distinct().exclude(pk=userProfile.pk) # make intelligent
    else:
        return UserProfile.objects.filter(interests__in=Interest.objects.filter(userprofiles=userProfile)).distinct().exclude(pk=userProfile.pk) # make intelligent

def getGeoMatches(userprofile):
    queryFilter = getBasicMatches(userprofile)
    if userprofile.last_position != None:
        queryFilter = queryFilter.filter(status__exact=Status.GEO_ONLINE, last_position__distance_lt=(userprofile.last_position, D(m=settings.GPS_COVER_RANGE))).exclude(pk=userprofile.pk)
    return getFilteredAsyncSessionProfiles(queryFilter)

def getBestMatches(userProfile):
    basicQueryFilter = getBasicMatches(userProfile)
    bestMatches = getInterestMatches(userProfile, basicQueryFilter)
    if len(bestMatches) == 0:
        return basicQueryFilter
    return bestMatches.distinct()

def getFilteredProfiles(filterDict, userprofile):
    maxBY = getBirthYear(filterDict['maxAge'])
    minBY = getBirthYear(filterDict['minAge'])
    gender = filterDict['gender']
    cityId = filterDict['cityId']
    query = UserProfile.objects.filter(birthyear__gte=maxBY,
                                         birthyear__lte=minBY,
                                         gender=gender,
                                         city=cityId).exclude(pk=userprofile.pk)
    
    if filterDict.has_key('hasImage'):
        hasImage = filterDict['hasImage']
        if hasImage == 'on':
            query = query.filter(image__isnull=False).exclude(image='')
    
    if filterDict.has_key('withoutChildren'):
        withoutChildren = filterDict['withoutChildren']
        if withoutChildren == 'on':
            query = query.filter(havechildren=False)
    
    if filterDict.has_key('occupation'):
        query = query.filter(occupation=filterDict['occupation'])
    if filterDict.has_key('educationalDegree'):
        query = query.filter(educationaldegree=filterDict['educationalDegree'])
    if filterDict.has_key('political'):
        query = query.filter(political=filterDict['political'])
    if filterDict.has_key('religion'):
        query = query.filter(political=filterDict['religion']) 
              
    if filterDict.has_key('lookingFor'):
        query = query.filter(lookingForTypes__in=filterDict['lookingFor'])                             

    if filterDict.has_key('body'):
        query = query.filter(bodytype__in=filterDict['body'])
    
    if filterDict.has_key('hair'):
        query = query.filter(hairtype__in=filterDict['hair'])
        
    if filterDict.has_key('skin'):
        query = query.filter(skintype__in=filterDict['skin'])
        
    if filterDict.has_key('eyes'):
        query = query.filter(eyecolor__in=filterDict['eyes'])
        
    return query

def getFilteredAsyncSessionProfiles(userProfiles):
    result = []
    for profile in userProfiles:
        if AsyncSession.hasSession(profile.id):
            result.append(profile)
    return result
