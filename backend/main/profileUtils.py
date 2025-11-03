# -*- encoding: UTF-8 -*-
'''
Created on 29. jan. 2012

@author: jny
'''
from django.conf import settings
from forms import ProfileForm, AdvancedForm
from handlerUtils import JSONSuccessResponse, JSONErrorResponse, \
    getLoggedInUserProfile, JSONFieldErrorResponse, getLanguageCode
from async import AsyncSession
from imageUtils import getAndRemoveTemporaryFile
from interestUtil import saveInterest, getInterestSuggestion
from models import Country, Interest, Occupation, Political, EducationalDegree, \
    Religion, BodyType, SkinType, HairType, EyeColor, UserProfile, \
    PendingProfileImages, City
from models import getIPCity, getCountry, getReligion, getEducationalDegree, getOccupation, getPolitical, getBodyType, getEyeColor, getSkinType, getHairType, getPendingProfileImages
import choices
import datetime
from constants import Status
from felizdate.main.models import LookingForType
from django.utils.timezone import utc
import random, re
from felizdate.main.constants import UserType
from felizdate.main.modelUtils import getFirst

maleNicks = [
            'johnny',
            'anton',
            'ace',
            'bud',
            'comfy',
            'daddy',
            'honeybee',
            'justin',
            'loverboy',
            'mojo',
            'thugga',
            'amor',
            'machine'
]
femaleNicks = [
            'amor',
            'angel',
            'bella',
            'candy',
            'edima',
            'exotic',
            'flower',
            'kitty',
            'princess',
            'rose',
            'sparkles',
            'bambi'
]

def getNickName(gender, age):
    if (gender == "M"):
        return random.choice(maleNicks) + age
    else:
        return random.choice(femaleNicks) + age

def getAge(userProfile):
    return datetime.date.today().year - userProfile.birthyear

def getYears():
    years = []
    for x in range (1900, datetime.date.today().year - settings.MINIMUM_AGE):
        years.append(x)
    return years

def getIds(commaString):
    if commaString != "":
        return commaString.split(',')
    else:
        return []

def getProfileDict(profile):
    if profile:
        return {
            "profile": {
                 "id": profile.pk,
                 "text": unicode(profile.profilename),
                 "cityId": profile.city.pk,
                 "countryId": profile.country.pk,
                 "gender": profile.gender,
                 "maritalStatus": profile.maritalStatus,
                 "birthyear": profile.birthyear,
                 "description": profile.description,
                 "image": profile.getProfileImageUrl(),
                 "thumbnail": profile.getTumbProfileImageUrl(),
                 "occupation": profile.occupation,
                 "educationalDegree": profile.educationaldegree,
                 "religion": profile.religion,
                 "political": profile.political,
                 "partnerGender": profile.partnergender,
                 "partnerOccupation": profile.partneroccupation,
                 "partnerEducationalDegree": profile.partnereducation,
                 "partnerReligion": profile.partnerreligion,
                 "partnerPolitical": profile.partnerpolitical,
                 "bodyType": profile.bodytype,
                 "hairType": profile.hairtype,
                 "skinType": profile.skintype,
                 "eyeColor": profile.eyecolor,
                 "lookingForTypes": profile.lookingForTypes.all(),
                 "partnerBodyTypes": profile.partnerbodytypes.all(),
                 "partnerHairTypes": profile.partnerhairtypes.all(),
                 "partnerSkinTypes": profile.partnerskintypes.all(),
                 "partnerEyeColors": profile.partnereyecolors.all(),
                 "status": profile.status,
                 "loggedIn": AsyncSession.hasSession(profile.id) and profile.status != 3,
                 "interests": profile.interests.all(),
                 "pendingImage": hasProfileImagePending(profile),
                 "media": profile.getMedia(),
                 "haveChildren": profile.havechildren
             }
        }
    else:
        return {}

def hasProfileImagePending(userprofile):
    if getPendingProfileImages(userprofile) != None:
        return True
    return False

def setupAdvancedDefaults(userProfile):
    userProfile.bodytype = userProfile.bodytype or getBodyType(1)
    userProfile.hairtype = userProfile.hairtype or getHairType(1)
    userProfile.skintype = userProfile.skintype or getSkinType(1)
    userProfile.eyecolor = userProfile.eyecolor or getEyeColor(1)
    
    userProfile.occupation = userProfile.occupation or getOccupation(1)
    userProfile.educationaldegree = userProfile.educationaldegree or getEducationalDegree(1)
    userProfile.political = userProfile.political or getPolitical(1)
    userProfile.religion = userProfile.religion or getReligion(1)
    
def saveProfile(request):
    form = ProfileForm(request.POST)
    if form.is_valid():
        try:
            result = {}
            temporaryMicroImagePathFile = form.cleaned_data['temporaryImageMicroPathFile']
            temporaryTumbImagePathFile = form.cleaned_data['temporaryImageTumbPathFile']
            temporaryImagePathFile = form.cleaned_data['temporaryImagePathFile']
            
            userprofile = getLoggedInUserProfile(request)
            if userprofile == None:
                userprofile = UserProfile(coreuser=request.user)
                result.update({ "newProfile" : True })
                userprofile.joined = datetime.datetime.utcnow().replace(tzinfo=utc)
                
            userprofile.profilename = form.cleaned_data['profileName']
            userprofile.birthyear = form.cleaned_data['yearOfBirth']
            userprofile.city = City.objects.get(pk=form.cleaned_data['cityId'])
            userprofile.country = Country.objects.get(code=userprofile.city.countrycode)
            userprofile.gender = form.cleaned_data['gender']
            userprofile.maritalStatus = form.cleaned_data['maritalStatus']
            userprofile.description = form.cleaned_data['description']
            userprofile.partnergender = form.cleaned_data['partnerGender']
            
            userprofile.status = Status.ONLINE
            userprofile.reportCount = userprofile.reportCount or 0
            userprofile.changed = datetime.datetime.utcnow().replace(tzinfo=utc)
            userprofile.save()
            userprofile.lookingForTypes.clear()
            
            lookingForTypes = form.cleaned_data['lookingFor']
            for lookingForTypeId in getIds(lookingForTypes):
                t = LookingForType.objects.get(pk=lookingForTypeId)
                userprofile.lookingForTypes.add(t)
                
            setupAdvancedDefaults(userprofile)
            userprofile.save()
            if temporaryTumbImagePathFile and temporaryImagePathFile and temporaryMicroImagePathFile is not None:
                # todo: rename to PendingImageRequest
                pendingImageRequest = getPendingProfileImages(userprofile)
                if not pendingImageRequest:
                    pendingImageRequest = PendingProfileImages()
                    pendingImageRequest.userProfile = userprofile
                pendingImageRequest.save()
                userprofile.image.save(str(userprofile.pk) + ''.join(['.',settings.DEFAULT_IMAGE_FORMAT]),getAndRemoveTemporaryFile(temporaryImagePathFile))
                userprofile.image_tumb.save(str(userprofile.pk) + ''.join(['.',settings.DEFAULT_IMAGE_FORMAT]),getAndRemoveTemporaryFile(temporaryTumbImagePathFile))
                userprofile.image_micro.save(str(userprofile.pk) + ''.join(['.',settings.DEFAULT_IMAGE_FORMAT]),getAndRemoveTemporaryFile(temporaryMicroImagePathFile))
                userprofile.save()
                
                result.update(getProfileDict(userprofile))
                return JSONSuccessResponse(result)
            else:
                result.update(getProfileDict(userprofile))
                return JSONSuccessResponse(result)
        except Exception, e:
            return JSONErrorResponse(e);    
    else:
        return JSONFieldErrorResponse(form.errors)

def saveAdvanced(request):
    form = AdvancedForm(request.POST)
    if form.is_valid():
        try:
            partnerBodyTypes = form.cleaned_data['partnerBody']
            partnerHairTypes = form.cleaned_data['partnerHair']
            partnerSkinTypes = form.cleaned_data['partnerSkin']
            partnerEyeColors = form.cleaned_data['partnerEyes']
            
            userprofile = getLoggedInUserProfile(request)        
            userprofile.occupation = Occupation.objects.get(pk=form.cleaned_data['occupation'])
            userprofile.educationaldegree = EducationalDegree.objects.get(pk=form.cleaned_data['education'])
            userprofile.political = Political.objects.get(pk=form.cleaned_data['political'])
            userprofile.religion = Religion.objects.get(pk=form.cleaned_data['religion'])
            userprofile.bodytype = BodyType.objects.get(pk=form.cleaned_data['body'])
            userprofile.hairtype = HairType.objects.get(pk=form.cleaned_data['hair'])
            userprofile.skintype = SkinType.objects.get(pk=form.cleaned_data['skin'])
            userprofile.eyecolor = EyeColor.objects.get(pk=form.cleaned_data['eyeColor'])
            
            userprofile.partneroccupation = form.cleaned_data['partnerOccupation']
            userprofile.partnereducation = form.cleaned_data['partnerEducation']
            userprofile.partnerpolitical = form.cleaned_data['partnerPolitical']
            userprofile.partnerreligion = form.cleaned_data['partnerReligion']
            userprofile.changed = datetime.datetime.utcnow().replace(tzinfo=utc)
            userprofile.partnerbodytypes.clear()
            
            for bodyTypeId in getIds(partnerBodyTypes):
                t = BodyType.objects.get(pk=bodyTypeId)
                userprofile.partnerbodytypes.add(t)
            userprofile.partnerhairtypes.clear()
            for hairTypeId in getIds(partnerHairTypes):
                t = HairType.objects.get(pk=hairTypeId)
                userprofile.partnerhairtypes.add(t)
            userprofile.partnerskintypes.clear()
            for skinTypeId in getIds(partnerSkinTypes):
                t = SkinType.objects.get(pk=skinTypeId)
                userprofile.partnerskintypes.add(t)
            userprofile.partnereyecolors.clear()
            for eyeColorId in getIds(partnerEyeColors):
                t = EyeColor.objects.get(pk=eyeColorId)
                userprofile.partnereyecolors.add(t)
            interestIdString = form.cleaned_data['interests']
            userprofile.interests.clear()
            for interestId in getIds(interestIdString):
                interest = Interest.objects.get(pk=interestId)
                if interest:
                    userprofile.interests.add(interest)
                    
            haveChildren = form.cleaned_data['haveChildren']
            if haveChildren == "on":
                userprofile.havechildren = True
            else:
                userprofile.havechildren = False

            userprofile.save()
            return JSONSuccessResponse(getProfileDict(userprofile))
        except Exception, e:
            return JSONErrorResponse(e);    
    else:
        return JSONFieldErrorResponse(form.errors)
    
def getFieldOptions(languageCode):
    countries = Country.objects.all().order_by('name')
    lookingForTypes = LookingForType.objects.all().order_by('sortnumber')
    occupations = Occupation.objects.all().order_by('sortnumber')
    educationalDegrees = EducationalDegree.objects.all().order_by('sortnumber')
    politicalAlignments = Political.objects.all().order_by('sortnumber')
    religions = Religion.objects.all().order_by('sortnumber')
    bodyTypes = BodyType.objects.all().order_by('sortnumber')
    hairTypes = HairType.objects.all().order_by('sortnumber')
    skinTypes = SkinType.objects.all().order_by('sortnumber')
    eyeColors = EyeColor.objects.all().order_by('sortnumber')
    
    return { "genders"  : ({ "id": x, "text": y } for x, y in choices.GENDER),
             "maritalStatuses"  : ({ "id": x, "text": y } for x, y in choices.MARITAL_STATUS),
             "years"    : ({ "id": x, "text": x } for x in getYears()),
             "lookingForTypes" : lookingForTypes,
             "occupations" : occupations,
             "educationalDegrees" : educationalDegrees,
             "politicalAlignments": politicalAlignments,
             "religions": religions,
             "bodyTypes": bodyTypes,
             "hairTypes": hairTypes,
             "skinTypes": skinTypes,
             "eyeColors": eyeColors,
             "countries" : countries,
             "partnerGenders" : choices.PARTNER_GENDER,
             "partnerOccupations" : choices.PARTNER_OCCUPATION,
             "partnerEducations" : choices.PARTNER_EDUCATIONAL_DEGREE,
             "partnerPoliticals" : choices.PARTNER_POLITICAL_ALIGNMENT,
             "partnerReligions" : choices.PARTNER_RELIGION }

def setGeneratedProfileName(userProfile):
    age = str(datetime.datetime.utcnow().replace(tzinfo=utc).year - userProfile.birthyear)
    userProfile.profilename = getNickName(userProfile.gender, age)
    try:
        userProfile.save()
    except Exception, e:
        setGeneratedProfileName(userProfile)

def populateFacebookUser(userProfile, fbUser, request):
    try:
        
        # load general attributes
        date = datetime.datetime.utcnow().replace(tzinfo=utc)
        if fbUser['gender'] == "male":
            userProfile.gender = "M"
            userProfile.partnergender = "F"
        else:
            userProfile.gender = "F"
            userProfile.partnergender = "M"
        year = fbUser['birthday'][6:]
        userProfile.birthyear = int(year)
        userProfile.maritalStatus = 0
        userProfile.reportCount = 0
        userProfile.status = Status.ONLINE
        userProfile.joined = date
        userProfile.changed = date
        ip_address = request.META['REMOTE_ADDR']
        # try to get city based on location
        city = getIPCity(ip_address)
        if not city:
            # try to get city based on domain
            languageCode = getLanguageCode(request);
            countryq = None
            if languageCode and languageCode != 'EN':
                countryq = Country.objects.filter(code2=languageCode)
                country = getFirst(countryq)
                cities = City.objects.filter(countrycode=country.code)
                capital = cities.filter(capital=True)
                city = getFirst(capital)
                if not city:
                    city = cities[0] #use first
            else:
                # use system default
                city = City.objects.get(id=settings.DEFAULT_CITY_ID)
            
        userProfile.city = city
        userProfile.country = getCountry(city)
        educationalDegree = 1
        
        # load advanced attributes
        for education in fbUser['education']:
            if (education['type'] == "High School"):
                if (educationalDegree < 2):
                    educationalDegree = 2
            elif (education['type'] == "College"):
                if (educationalDegree < 3):
                    educationalDegree = 3
        userProfile.educationalDegree = educationalDegree
        
        # set religion
        antiReligionPattern = re.compile('^(\w*)anti|non(\w*)religio(\w*)$', re.IGNORECASE)
        christianPattern = re.compile('^(\w*)christ(\w*)$', re.IGNORECASE)
        orthodoxPattern = re.compile('^(\w*)orthodox(\w*)$', re.IGNORECASE)
        muslimPattern = re.compile('^(\w*)musl(\w*)$', re.IGNORECASE)
        
        religionid = 1
        if muslimPattern.match(fbUser['religion']):
            religionid = 3
        if christianPattern.match(fbUser['religion']):
            religionid = 2
        if orthodoxPattern.match(fbUser['religion']):
            religionid = 4
        if antiReligionPattern.match(fbUser['religion']):
            religionid = 5
        userProfile.religion = getReligion(religionid)
        
        # set political
        socialistPattern = re.compile('^(\w*)socialist(\w*)$', re.IGNORECASE)
        democratPattern = re.compile('^(\w*)democrat(\w*)$', re.IGNORECASE)
        liberalPattern = re.compile('^(\w*)liberal(\w*)$', re.IGNORECASE)
        republicanPattern = re.compile('^(\w*)republican(\w*)$', re.IGNORECASE)
        
        politicalid = 1
        if socialistPattern.match(fbUser['political']):
            politicalid = 2
        if democratPattern.match(fbUser['political']):
            politicalid = 3
        if liberalPattern.match(fbUser['political']):
            politicalid = 4
        if republicanPattern.match(fbUser['political']):
            politicalid = 5
        userProfile.political = getPolitical(politicalid)
        
        # set occupation
        userProfile.occupation = getOccupation(1)
        
        # set educational degree
        userProfile.educationaldegree = getEducationalDegree(1)
        
        userProfile.save()
        
        # set interests
        if fbUser.has_key('interests'):
            for interest in fbUser['interests']:
                interest = getInterestSuggestion(None, interest['name'])
                if not interest:
                    interest = saveInterest(interest['name'], "", request)
                userProfile.interests.add(interest)
        elif fbUser.has_key('sports'):
            for sport in fbUser['sports']:
                interest = getInterestSuggestion(None, sport['name'])
                if not interest:
                    interest = saveInterest(sport['name'], "sport", request)
                userProfile.interests.add(interest)
                
        setGeneratedProfileName(userProfile)
        setupAdvancedDefaults(userProfile)

    except Exception, e:
        pass