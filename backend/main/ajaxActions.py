# -*- encoding: UTF-8 -*-
'''

Ajax actions.

Created on 3. mai 2011

@author: Joerund Nydal

'''
from async import AsyncSession
from django.contrib.auth import authenticate, login, logout
from django.contrib.gis.geos import fromstr
from django.core.files.base import ContentFile
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.utils.translation import ugettext
from django.core.files import File
from exceptions import AppException
from constants import Status, MembershipType, Skin, Sound
from filterUtils import getFilteredProfiles, getBestMatches, getGeoMatches, getBirthYear
from forms import RegisterAccountForm, SearchProfilesForm
from handlerUtils import runJavascript, getLoggedInUserProfile, JSONSuccessResponse, JSONErrorResponse, JSONFieldErrorResponse, storeTemporaryMediaFile, validateMedia, getLanguageCode
from imageUtils import getCroppedAndResizedTemporaryImagePathFiles, storeProfileImageDraft, getAndRemoveTemporaryFile
from interestUtil import saveInterest, getInterestSuggestions
from messageUtils import getConversation, getLatestMessages, sendEmail
from models import UserProfile, City, Message, CustomUser, Membership, Media, getIPCity, Country
from modelUtils import getFirst
from profileUtils import saveProfile, saveAdvanced, getFieldOptions, getProfileDict
from django.core.mail import send_mail
from django.conf import settings
from activity import ActivityManager
import time, logging
from felizdate.main.constants import UserType
import urllib

DUPLICATE_KEY_ERROR = 1062
PROFILES_PR_SEARCH_RESULT = 21

socketlogger = logging.getLogger("socket")

def loginJSONAction(request):
    if request.method == 'POST':
        user = authenticate(request=request)
        if user is not None:
            if user.is_active:
                login(request, user)
                return getUserSessionJSONAction(request)
            else:
                return JSONErrorResponse(ugettext("Account has been disabled."))
        else:
            return JSONErrorResponse(ugettext("Incorrect e-mail/password."))

def setStatusJSONAction(request):
    if request.method == 'POST':
        status = None
        try:
            status = int(request.POST['status'])
            profile = getLoggedInUserProfile(request)
            profile.status = status
            profile.save()
        except Exception, e:
            return JSONErrorResponse(e)
    return JSONSuccessResponse(status)

def logoutJSONAction(request):
    userprofile = getLoggedInUserProfile(request)
    try:
        if userprofile:
            AsyncSession.remove(userprofile.id)
            ActivityManager.remove(userprofile)
        logout(request)
        return JSONSuccessResponse()
    except Exception, e:
        return JSONErrorResponse(e)
                
def reportIssueJSONAction(request):
    if request.method == 'POST':
        type = None
        description = None
        email = "support@felizdate.com"
        try:
            type = request.POST['type']
            description = request.POST['description']
            profile = getLoggedInUserProfile(request)
            send_mail("".join([type, " report"]), "".join(["Userprofile ", profile.profilename, " would like to report the following ", type, ":\n\n",description]), profile.coreuser.email, [email], fail_silently=False)
        except Exception, e:
            return JSONErrorResponse(e)
    return JSONSuccessResponse()

def getUserSessionJSONAction(request):
    domestic = False
    code = getLanguageCode(request)
    if code != 'EN':
        domestic = True
    if request.user.is_authenticated():
        user = CustomUser.objects.get(pk=request.user.id)
        try:
            result = {
                "csrfToken": request.META['CSRF_COOKIE'],
                "email": user.email,
                "userType": user.usertype,
                "domestic" : domestic
            }
            userprofile = getLoggedInUserProfile(request)
            profiledata = getProfileDict(userprofile)
            result.update(profiledata)
            return JSONSuccessResponse(result)
        except Exception, e:
            return JSONErrorResponse(e)
    else:
        return JSONSuccessResponse({ "csrfToken": request.META['CSRF_COOKIE'], "domestic" : domestic })

def setPositionJSONAction(request):
    if request.method == 'POST':
        try:
            if request.user.is_authenticated():
                profile = getLoggedInUserProfile(request)
                if profile:
                    longitude = float(request.POST['longitude'])
                    latitude = float(request.POST['latitude'])
                    profile.last_position = fromstr("POINT(%s %s)" % (longitude, latitude))
                    profile.save()
                    return JSONSuccessResponse({"longitude": longitude, "latitude": latitude})
        except Exception, e:
            return JSONErrorResponse(e)
                
def getOptionsJSONAction(request):
    '''
        This action is excecuted when client reqests profile options
    '''
    if request.method == 'GET':
        try:
            return JSONSuccessResponse(getFieldOptions(getLanguageCode(request)))
        except Exception, e:
            return JSONErrorResponse(e)
        
def getProfileJSONAction(request):
    if request.method == 'GET':
        userProfileId = request.GET['id']
        try:
            result = {}
            profile = UserProfile.objects.get(pk=int(userProfileId))
            if not ActivityManager.isActive(profile):
                profile.status = Status.INVISIBLE
            result.update(getProfileDict(profile))
            userprofile = getLoggedInUserProfile(request)
            if profile in userprofile.blockedProfiles.all():
                result['profile'].update({"blocked": True})
            return JSONSuccessResponse(result)
        except Exception, e:
            return JSONErrorResponse(e.message)

def toggleBlockJSONAction(request):
    if request.method == 'POST':
        profileId = request.POST['profileId']
        try:
            result = {}
            profile = UserProfile.objects.get(pk=int(profileId))
            userprofile = getLoggedInUserProfile(request)
            if profile in userprofile.blockedProfiles.all():
                userprofile.blockedProfiles.remove(profile)
            else:
                userprofile.blockedProfiles.add(profile)
                result.update({"blocked": True})
            userprofile.save()
            return JSONSuccessResponse(result)
        except Exception, e:
            return JSONErrorResponse(e.message)

def sendMessageJSONAction(request):
    toUserProfileId = int(request.POST['toProfileId'])
    push = False
    if request.POST.has_key('pushMessage'):
        push = bool(request.POST['pushMessage'])
    toUserProfile = UserProfile.objects.get(id=toUserProfileId)
    if not toUserProfile:
        return JSONErrorResponse(ugettext("Profile does not exist."))
    
    fromUserProfile = getLoggedInUserProfile(request)    
    if fromUserProfile in toUserProfile.blockedProfiles.all():
        return JSONErrorResponse(ugettext("Message cannot be delivered to recipient for the moment."))
    messageText = request.POST['message']    

    timestamp = int(round(time.time()))
    message = { 'type': 'msg', 'toProfileId': toUserProfileId, 'fromProfileId': fromUserProfile.id, 'fromProfileName': fromUserProfile.profilename, 'text': messageText, 'timestamp': timestamp, 'microImageUrl': fromUserProfile.getMicroProfileImageUrl() }
    
    # save message
    Message(toProfile=toUserProfile, fromProfile=fromUserProfile, message=messageText, timestamp=timestamp).save()
    
    if push == True:
        # try to send asynchronously
        sent = AsyncSession.send(message, toUserProfileId)
        if sent != True:
            sendEmail(message, request)
    
    return JSONSuccessResponse([message])

def showMessagesJSONAction(request):
    messages = getLatestMessages(request, False)
    return JSONSuccessResponse(messages)

def uploadImageDraftJSONAction(request):
    '''
        This action is excecuted when user selects image file for upload.       
    '''
    if request.method == 'POST':
        result = None
        try:
            imageFile = ContentFile(request.FILES['image'].read())
            sourceName = request.POST['sourceName'];
            resizedImageDraftPath, pathFilename, width, height = storeProfileImageDraft(imageFile)
            script = 'parent.application.controller.handleSuccessResponse(new ServerResponse(new ActionRequest("uploadImageDraft", {}), { resizedImageDraftPath: "'+ settings.TEMP_MEDIA_URL + resizedImageDraftPath +'", pathfilename: "' + pathFilename + '", width: "' + str(width) + '", height: "' + str(height) + '", sourceName: "' + str(sourceName) + '"}));'
            return runJavascript(script)
        except Exception as (errno, strerror):
            return runJavascript('parent.application.view.showErrorDialog("'+ strerror +'");')

def uploadMediaJSONAction(request):
    '''
        This action is excecuted when user uploads media
    '''
    if request.method == 'POST':
        result = None
        try:
            validateMedia(request.FILES['media'])
            sourceName = request.POST['sourceName'];
            userprofile = getLoggedInUserProfile(request)
            media = Media()
            media.save()
            media.userprofile = userprofile
            media.saveRaw(request.FILES['media'])
            media.save()
            script = 'parent.application.controller.handleSuccessResponse(new ServerResponse(new ActionRequest("uploadMedia", {}), { id: "' + str(media.id) + '", type: "' + str(media.mediatype) + '", name: "' + request.FILES['media'].name + '", url: "' + media.raw.url + '", sourceName: "' + str(sourceName) + '"}));'
            return runJavascript(script)
        except ValueError, e:
            return runJavascript('parent.application.view.showErrorDialog("'+ e +'");')
        except AppException, e:
            return runJavascript('parent.application.view.showErrorDialog("'+ e.value +'");')
        except Exception as (errno, strerror):
            return runJavascript('parent.application.view.showErrorDialog("'+ strerror +'");')

def deleteMediaJSONAction(request):
    '''
        This action is excecuted when user deletes media
    '''
    if request.method == 'GET':
        try:
            mediaId = request.GET['mediaId'];
            userprofile = getLoggedInUserProfile(request)
            media = Media.objects.get(pk=mediaId)
            media.deleteData()
            media.delete()
            return JSONSuccessResponse()
        except Exception, e:
            return JSONErrorResponse(e)

def cropImageJSONAction(request):
    '''
        This action is excecuted when user submits selection made in cropper tool on the uploaded image.
    '''
    if request.method == 'POST':
        result = None
        try:
            if not request.POST.has_key('w') or not request.POST.has_key('h'): 
                result = JSONErrorResponse(ugettext("Crop parameters is missing."))
            else:
                x = int(float(request.POST['x'])) or 0
                y = int(float(request.POST['y'])) or 0
                w = int(float(request.POST['w']))
                h = int(float(request.POST['h']))
                temporaryImagePathFile = request.POST['temporaryImagePathFile']
                temporaryImagePathFile, temporaryTumbImagePathFile, temporaryMicroImagePathFile = getCroppedAndResizedTemporaryImagePathFiles(temporaryImagePathFile, x, y, w, h)
                temporaryImagePathFileUrl = settings.TEMP_MEDIA_URL + temporaryImagePathFile
                temporaryTumbImagePathFileUrl = settings.TEMP_MEDIA_URL + temporaryTumbImagePathFile
                result = JSONSuccessResponse({'temporaryImagePathFileUrl' : temporaryImagePathFileUrl, 'temporaryImagePathFile' : temporaryImagePathFile, 'temporaryTumbImagePathFile' : temporaryTumbImagePathFile, 'temporaryMicroImagePathFile': temporaryMicroImagePathFile, 'temporaryTumbImagePathFileUrl' : temporaryTumbImagePathFileUrl})
        except Exception, e:
            result = JSONErrorResponse(e)
        return result

def validReCaptcha(challenge, response, ip):
    params = urllib.urlencode({'challenge': challenge, 'response': response, 'remoteip': ip, 'privatekey': settings.RECAPTCHA_PRIVATE_KEY })
    f = urllib.urlopen("http://www.google.com/recaptcha/api/verify", params)
    result = f.read()[:4]
    if result == 'true':
        return True
    return False

def saveAccountJSONAction(request):
    '''
        This action is excecuted when user submits first page of registration wizard.  
    '''
    result = {}
    if request.method == 'POST':
        form = RegisterAccountForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            if not request.user.is_authenticated():
                # create new user account
                challenge = form.cleaned_data['reCaptchaChallenge']
                response = form.cleaned_data['reCaptchaResponse']
                ip_address = request.META['REMOTE_ADDR']
                if not validReCaptcha(challenge, response, ip_address):
                    return JSONErrorResponse(ugettext('invalid reCaptcha response.'))
                result.update({ "newAccount" : True })
                try:
                    coreuser = CustomUser()
                    coreuser.pk = None
                    coreuser.id = None
                    coreuser.username=email
                    coreuser.email=email
                    coreuser.set_password(password)
                    coreuser.usertype=UserType.INTERNAL
                    coreuser.backend = 'django.contrib.auth.backends.ModelBackend'
                    coreuser.recievenewsletter=True
                    coreuser.informnewmessage=True
                    coreuser.skin=Skin.DEFAULT
                    coreuser.newmessagesound=Sound.DANG
                    coreuser.systemnotifications=True
                    membership = Membership(membershiptype=MembershipType.FREE)
                    membership.save()
                    coreuser.membership = membership
                    coreuser.save()
                    login(request, coreuser)
                except Exception, e:
                    return JSONErrorResponse(e)  
            else:
                # update account
                request.user.email = email
                if password != "":
                    # update password
                    request.user.set_password(password)
            result.update({ "email": email })
            return JSONSuccessResponse(result)
        else:
            return JSONFieldErrorResponse(form.errors)
        
def saveProfileJSONAction(request):
    '''
        This action is excecuted when user finishes the create userprofile page.
    '''
    if request.method == 'POST':
        try:
            return saveProfile(request)
        except TypeError, e:
            return JSONErrorResponse(e)
        except IntegrityError as (errno, strerror):
            if errno == DUPLICATE_KEY_ERROR: # TODO: improve so AppException is used as wrapper
                return JSONErrorResponse(ugettext('Profilename already exists. Please select another one.'))
            else:
                return JSONErrorResponse(strerror)
        except Exception, e:
            return JSONErrorResponse(e)

def saveAdvancedJSONAction(request):
    '''
        This action is excecuted when user finishes the create userprofile page.
    '''
    if request.method == 'POST':
        try:
            return saveAdvanced(request)
        except TypeError, e:
            return JSONErrorResponse(e)
        except IntegrityError as (errno, strerror):
            return JSONErrorResponse(strerror)
        except Exception, e:
            return JSONErrorResponse(e)
        
def getBestMatchesJSONAction(request):
    if request.method == 'GET':
        result = None
        pageno = 1
        if request.POST.has_key('pageNo'):
            pageno = request.POST['pageNo']
        try:
            userProfile = getLoggedInUserProfile(request)
            profiles = getBestMatches(userProfile)
            paginator = Paginator(profiles, PROFILES_PR_SEARCH_RESULT)
            page = paginator.page(pageno)
            pageinfo = {}
            if page.has_next():
                pageinfo.update({"nextPageNo" : str(page.next_page_number())})
            if page.has_previous():
                pageinfo.update({"prevPageNo" : str(page.previous_page_number())})
            pageprofiles = page.object_list
            result = JSONSuccessResponse({"profiles": pageprofiles, "pageInfo": pageinfo})

        except AppException, e:
            result = JSONErrorResponse(e)
        except Exception, e:
            result = JSONErrorResponse(e)
        return result

def quickSearchJSONAction(request):
    if request.method == 'GET':
        result = None
        try:
            c = getLanguageCode(request)
            country = Country.objects.filter(code2=c)
            gender = request.GET['gender']
            minage = request.GET['minage']
            maxage = request.GET['maxage']
            profiles = UserProfile.objects.filter(country=country, gender=gender, image__isnull=False, birthyear__gte=getBirthYear(maxage), birthyear__lte=getBirthYear(minage)).exclude(image='')
            paginator = Paginator(profiles, request.GET['countPrPage'])
            pageno = request.GET['pageNo']
            page = paginator.page(pageno)
            pageinfo = {"total": len(profiles)}
            if page.has_next():
                pageinfo.update({"nextPageNo" : str(page.next_page_number())})
            if page.has_previous():
                pageinfo.update({"prevPageNo" : str(page.previous_page_number())})
            pageprofiles = page.object_list
            result = JSONSuccessResponse({"profiles": pageprofiles, "pageInfo": pageinfo})
        except Exception, e:
            result = JSONErrorResponse(e)
        return result

def searchProfilesJSONAction(request):
    if request.method == 'POST':
        result = None
        try:
            form = SearchProfilesForm(request.POST)
            if form.is_valid():
                userProfile = getLoggedInUserProfile(request)
                profiles = getFilteredProfiles(form.toDict(), userProfile)
                profiles = ActivityManager.filter(profiles)
                if form.cleaned_data['loggedIn'] == "on":
                    profiles = ActivityManager.filterLoggedIn(profiles)
                paginator = Paginator(profiles, form.cleaned_data['countPrPage'])
                pageno = form.cleaned_data['pageNo']
                page = paginator.page(pageno)
                pageinfo = {"total": len(profiles)}
                if page.has_next():
                    pageinfo.update({"nextPageNo" : str(page.next_page_number())})
                if page.has_previous():
                    pageinfo.update({"prevPageNo" : str(page.previous_page_number())})
                pageprofiles = page.object_list
                result = JSONSuccessResponse({"profiles": pageprofiles, "pageInfo": pageinfo})
            else:
                result = JSONFieldErrorResponse(form.errors)
        except AppException, e:
            result = JSONErrorResponse(e)
        except Exception, e:
            result = JSONErrorResponse(e)
        return result
    
def getConversationJSONAction(request):
    if request.method == 'GET':
        try:
            profileId = int(request.GET['profileId'])
            if profileId == None:
                raise Exception(ugettext('profileId is required.'))
            thisuserprofile = getLoggedInUserProfile(request)
            userprofile = UserProfile.objects.get(pk=profileId)
            conversation = getConversation(thisuserprofile, userprofile)
            return JSONSuccessResponse(conversation)
        except Exception, e:
            return JSONErrorResponse(e)
     
def getCitiesJSONAction(request):
    if request.method == 'GET':
        try:
            countryCode = request.GET['countryId']
            cities = City.objects.filter(countrycode=countryCode).order_by('name')
            return JSONSuccessResponse(cities)
        except Exception, e:
            return JSONErrorResponse(e)

def getLatestMessagesJSONAction(request):
    if request.method == 'GET':
        try:
            latestMessages = getLatestMessages(request, True)
            return JSONSuccessResponse(latestMessages)
        except Exception, e:
            return JSONErrorResponse(e)

def getMessagesJSONAction(request):
    if request.method == 'GET':
        try:
            latestMessages = getLatestMessages(request, False)
            return JSONSuccessResponse(latestMessages)
        except Exception, e:
            return JSONErrorResponse(e)

def getInterestSuggestionsJSONAction(request):
    if request.method == 'GET':
        try:
            suggestions = getInterestSuggestions(request, request.GET['keyword'])
            return JSONSuccessResponse(suggestions)
        except Exception, e:
            return JSONErrorResponse(e)

def saveInterestJSONAction(request):
    if request.method == 'POST':
        try:
            interestText = request.POST['interest'].lower()
            categoryText = request.POST['category'].lower()
            interest = saveInterest(interestText, categoryText, request)
                        
            return JSONSuccessResponse(interest.to_dict())
        except Exception, e:
            return JSONErrorResponse(e)

def getCloseByProfilesJSONAction(request):
    try:
        userprofile = getLoggedInUserProfile(request)
        if userprofile:
            return JSONSuccessResponse(getGeoMatches(userprofile))
        else:
            return JSONSuccessResponse()
    except Exception, e:
        return JSONErrorResponse(e)