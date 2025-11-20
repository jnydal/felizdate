# -*- encoding: UTF-8 -*-
"""
Model definitions module.

Created on 1. mai 2011

@author: Joerund Nydal
"""
from django.contrib.gis.db import models
import json
from django.contrib.auth.models import User, UserManager
from django.core.files.storage import FileSystemStorage
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from django.db.models.fields.related import ManyToManyField
from . import choices
import urllib.request
import urllib.error
from django.core.cache import cache
from .imageUtils import getFileExtension
from .constants import MediaType


class Country(models.Model):
    code = models.CharField(max_length=9, primary_key=True)
    name = models.CharField(max_length=156)
    continent = models.CharField(max_length=39)
    region = models.CharField(max_length=78)
    surfacearea = models.FloatField()
    indepyear = models.IntegerField(null=True, blank=True)
    population = models.IntegerField()
    lifeexpectancy = models.FloatField(null=True, blank=True)
    gnp = models.FloatField(null=True, blank=True)
    gnpold = models.FloatField(null=True, blank=True)
    localname = models.CharField(max_length=135)
    governmentform = models.CharField(max_length=135)
    headofstate = models.CharField(max_length=180, null=True, blank=True)
    capital = models.IntegerField(null=True, blank=True)
    code2 = models.CharField(max_length=6)

    def __str__(self):
        return self.name

    class Meta:
        app_label = 'main'
        db_table = 'country'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.name), 'code2': self.code2})


class Worker(models.Model):
    name = models.CharField(max_length=105)
    ip = models.CharField(max_length=15)
    port = models.IntegerField()
    protocol = models.CharField(max_length=3, null=True)
    pid = models.IntegerField(null=True)
    mq_port = models.IntegerField()

    def to_dict(self):
        return dict({'id': self.pk, 'ip': self.ip, 'port': self.port, 'protocol': self.protocol, 'pid': self.pid, 'mqPort': self.mq_port})

    def __str__(self):
        return self.name

    class Meta:
        app_label = 'main'
        db_table = 'worker'


class City(models.Model):
    name = models.CharField(max_length=105)
    countrycode = models.CharField(max_length=9)
    district = models.CharField(max_length=60)
    population = models.IntegerField()
    capital = models.BooleanField()

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.name), 'capital': self.capital})

    def __str__(self):
        return self.name

    class Meta:
        app_label = 'main'
        db_table = 'city'


class Occupation(models.Model):
    description = models.CharField(max_length=50, unique=False)
    sortnumber = models.IntegerField()

    class Meta:
        app_label = 'main'
        db_table = 'occupation'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description)})


class EducationalDegree(models.Model):
    description = models.CharField(max_length=25, unique=False)
    sortnumber = models.IntegerField()

    class Meta:
        app_label = 'main'
        db_table = 'educationaldegree'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description)})


class Political(models.Model):
    description = models.CharField(max_length=25, unique=False)
    sortnumber = models.IntegerField()

    class Meta:
        app_label = 'main'
        db_table = 'political'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description)})


class Religion(models.Model):
    description = models.CharField(max_length=25, unique=False)
    sortnumber = models.IntegerField()

    class Meta:
        app_label = 'main'
        db_table = 'religion'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description)})


class BodyType(models.Model):
    description = models.CharField(max_length=25, unique=False)
    sortnumber = models.IntegerField()

    class Meta:
        app_label = 'main'
        db_table = 'bodytype'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description)})


class SkinType(models.Model):
    description = models.CharField(max_length=25, unique=False)
    sortnumber = models.IntegerField()

    class Meta:
        app_label = 'main'
        db_table = 'skintype'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description)})


class HairType(models.Model):
    description = models.CharField(max_length=25, unique=False)
    sortnumber = models.IntegerField()

    class Meta:
        app_label = 'main'
        db_table = 'hairtype'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description)})


class EyeColor(models.Model):
    description = models.CharField(max_length=25, unique=False)
    sortnumber = models.IntegerField()

    class Meta:
        app_label = 'main'
        db_table = 'eyecolor'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description)})


class LookingForType(models.Model):
    description = models.CharField(max_length=25, unique=False)
    sortnumber = models.IntegerField()

    class Meta:
        app_label = 'main'
        db_table = 'lookingfortype'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description)})


class Category(models.Model):
    description = models.CharField(max_length=25, unique=True)
    language_code = models.CharField(unique=False, max_length=5, blank=False)
    translations = models.ManyToManyField('self')

    class Meta:
        app_label = 'main'
        db_table = 'category'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description)})


class Interest(models.Model):
    description = models.CharField(max_length=50, unique=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    language_code = models.CharField(unique=False, max_length=5, blank=False)
    translations = models.ManyToManyField('self')

    class Meta:
        app_label = 'main'
        db_table = 'interest'

    def to_dict(self):
        return dict({'id': self.pk, 'text': str(self.description), 'category': str(self.category.description)})


class UserProfile(models.Model):
    profilename = models.CharField(unique=True, max_length=48, blank=False)
    birthyear = models.IntegerField(null=False)
    gender = models.CharField(max_length=1, choices=choices.GENDER)
    description = models.TextField(blank=True)
    maritalStatus = models.IntegerField(choices=choices.MARITAL_STATUS)
    lookingForTypes = models.ManyToManyField(LookingForType, related_name='lookingfortypes')
    havechildren = models.BooleanField(default=False)
    image = models.ImageField(null=True, upload_to=settings.PROFILE_IMAGE_PATH, storage=default_storage)
    image_tumb = models.ImageField(null=True, upload_to=settings.TUMB_PROFILE_IMAGE_PATH, storage=default_storage)
    image_micro = models.ImageField(null=True, upload_to=settings.MICRO_PROFILE_IMAGE_PATH, storage=default_storage)
    country = models.ForeignKey(Country, null=True, on_delete=models.SET_NULL)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    occupation = models.ForeignKey(Occupation, null=True, on_delete=models.SET_NULL)
    educationaldegree = models.ForeignKey(EducationalDegree, null=True, on_delete=models.SET_NULL)
    political = models.ForeignKey(Political, null=True, on_delete=models.SET_NULL)
    religion = models.ForeignKey(Religion, null=True, on_delete=models.SET_NULL)
    bodytype = models.ForeignKey(BodyType, related_name='bodytype', null=True, on_delete=models.SET_NULL)
    hairtype = models.ForeignKey(HairType, related_name='hairtype', null=True, on_delete=models.SET_NULL)
    skintype = models.ForeignKey(SkinType, related_name='skintype', null=True, on_delete=models.SET_NULL)
    eyecolor = models.ForeignKey(EyeColor, related_name='eyecolor', null=True, on_delete=models.SET_NULL)
    interests = models.ManyToManyField(Interest, related_name='userprofiles')
    partnerbodytypes = models.ManyToManyField(BodyType)
    partnerhairtypes = models.ManyToManyField(HairType)
    partnerskintypes = models.ManyToManyField(SkinType)
    partnereyecolors = models.ManyToManyField(EyeColor)
    partnergender = models.CharField(max_length=1, choices=choices.PARTNER_GENDER)
    partneroccupation = models.IntegerField(choices=choices.PARTNER_OCCUPATION, null=True)
    partnereducation = models.IntegerField(choices=choices.PARTNER_EDUCATIONAL_DEGREE, null=True)
    partnerpolitical = models.IntegerField(choices=choices.PARTNER_POLITICAL_ALIGNMENT, null=True)
    partnerreligion = models.IntegerField(choices=choices.PARTNER_RELIGION, null=True)
    changed = models.DateTimeField(null=False)
    joined = models.DateTimeField(null=False)
    reportCount = models.IntegerField()
    blockedProfiles = models.ManyToManyField('self')
    last_position = models.PointField(srid=4326, null=True, geography=True)
    status = models.IntegerField(null=False)
    coreuser = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        app_label = 'main'
        db_table = 'userprofile'

    def __str__(self):
        return "%s's profile" % self.profilename

    def to_dict(self):
        return dict({'id': self.pk, 'text': self.profilename,
           'gender': self.gender,
           'status': self.status,
           'cityname': self.city.name,
           'thumbnail': self.getTumbProfileImageUrl(),
           'image': self.getProfileImageUrl(),
           'lastPosition': self.last_position})

    def getProfileImageUrl(self):
        result = settings.MEDIA_URL + self.image.name if self.image else ''
        return result

    def getTumbProfileImageUrl(self):
        result = settings.MEDIA_URL + self.image_tumb.name if self.image_tumb else ''
        return result

    def getMicroProfileImageUrl(self):
        result = settings.MEDIA_URL + self.image_micro.name if self.image_micro else ''
        return result

    def getMedia(self):
        medias = Media.objects.filter(userprofile=self)
        result = []
        for media in medias:
            if media.hasData():
                result.append(media)

        return result


class Media(models.Model):
    raw = models.FileField(null=True, upload_to=settings.PROFILE_MEDIA_PATH, storage=default_storage)
    mediatype = models.IntegerField(null=True, blank=False)
    userprofile = models.ForeignKey(UserProfile, null=True, on_delete=models.CASCADE)

    def saveRaw(self, uploadedFile):
        self.mediatype = getMediaType(uploadedFile)
        self.raw.save(('').join([str(self.userprofile.id), '/', uploadedFile.name]), ContentFile(uploadedFile.read()))
        return

    def to_dict(self):
        return dict({'id': self.pk, 'type': self.mediatype, 'url': (settings.MEDIA_URL + self.raw.name if self.raw else '')})

    def __str__(self):
        if self.raw:
            return self.raw.name
        return 'unbound media instance.'

    def hasData(self):
        if self.raw:
            return True
        return False

    def deleteData(self):
        self.raw.delete(save=True)
        return

    class Meta:
        app_label = 'main'
        db_table = 'media'


class PendingProfileImages(models.Model):
    userProfile = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    image = models.ImageField(null=True, upload_to=settings.PENDING_PROFILE_IMAGE_PATH, storage=FileSystemStorage())
    image_tumb = models.ImageField(null=True, upload_to=settings.PENDING_TUMB_PROFILE_IMAGE_PATH, storage=FileSystemStorage())
    image_micro = models.ImageField(null=True, upload_to=settings.PENDING_MICRO_PROFILE_IMAGE_PATH, storage=FileSystemStorage())

    def to_dict(self):
        return dict({'id': self.pk, 'profilename': str(self.userProfile.profilename)})

    def __str__(self):
        return self.userProfile.profilename

    class Meta:
        app_label = 'main'
        db_table = 'pendingprofileimages'


class Message(models.Model):
    fromProfile = models.ForeignKey(UserProfile, related_name='fromProfile', on_delete=models.CASCADE)
    toProfile = models.ForeignKey(UserProfile, related_name='toProfile', on_delete=models.CASCADE)
    message = models.TextField(blank=True)
    timestamp = models.BigIntegerField()
    read = models.BooleanField()

    def to_dict(self):
        return dict({'text': str(self.message), 'timestamp': str(self.timestamp), 'toProfileId': str(self.toProfile.id), 'fromProfileId': str(self.fromProfile.id), 'fromProfileName': str(self.fromProfile.profilename), 'gender': str(self.fromProfile.gender), 'read': bool(self.read), 'microImageUrl': (self.fromProfile.image_micro.url if self.fromProfile.image_micro else '')})

    def getMicroImageUrl(self):
        if self.fromProfile.image_micro:
            return self.fromProfile.image_micro.url
        else:
            if self.fromProfile.gender == choices.GENDER[0][0]:
                return '/media/static/images/no_image_m_micro.jpg'
            return '/media/static/images/no_image_f_micro.jpg'

        return

    class Meta:
        app_label = 'main'
        db_table = 'message'


class Membership(models.Model):
    membershiptype = models.IntegerField()
    duration = models.IntegerField(null=True)
    signdate = models.DateTimeField(null=True)

    class Meta:
        app_label = 'main'
        db_table = 'membership'


class CustomUser(User):
    usertype = models.IntegerField()
    externalId = models.CharField(max_length=128)
    recievenewsletter = models.BooleanField()
    informnewmessage = models.BooleanField()
    skin = models.IntegerField()
    newmessagesound = models.IntegerField()
    systemnotifications = models.BooleanField()
    membership = models.OneToOneField(Membership, on_delete=models.SET_NULL, null=True)
    showpartnerpreferences = models.BooleanField()
    objects = UserManager()

    class Meta:
        app_label = 'main'
        db_table = 'customuser'


def getCountry(city):
    return Country.objects.filter(code=city.countrycode).first()


def getOccupation(occupationid):
    return Occupation.objects.get(id=occupationid)


def getEducationalDegree(educationaldegreeid):
    return EducationalDegree.objects.get(id=educationaldegreeid)


def getReligion(religionid):
    return Religion.objects.get(id=religionid)


def getPolitical(politicalid):
    return Political.objects.get(id=politicalid)


def getBodyType(bodytypeid):
    return BodyType.objects.get(id=bodytypeid)


def getHairType(hairtypeid):
    return HairType.objects.get(id=hairtypeid)


def getSkinType(skintypeid):
    return SkinType.objects.get(id=skintypeid)


def getEyeColor(eyecolorid):
    return EyeColor.objects.get(id=eyecolorid)


def getIPCity(ip_address):
    url = 'http://freegeoip.net/json/' + ip_address
    json_data = None
    name = None
    city = None
    try:
        result = urllib.request.urlopen(url)
        json_data = json.loads(result.read().decode('utf-8'))
        name = json_data.get('city')
        city = City.objects.filter(name=name).first()
    except Exception:
        pass

    return city


def getPendingProfileImages(userprofile):
    result = None
    try:
        result = PendingProfileImages.objects.filter(userProfile=userprofile).first()
    except Exception as e:
        pass

    return result


def getMediaType(file):
    ext = getFileExtension(file.name)[1:]
    if ext == 'jpg' or ext == 'gif' or ext == 'png':
        return MediaType.IMAGE
    if ext == 'mpg' or ext == 'mp4' or ext == '3gp' or ext == 'avi' or ext == 'mov':
        return MediaType.VIDEO
    if ext == 'mp3' or ext == 'wav':
        return MediaType.AUDIO
    return None

