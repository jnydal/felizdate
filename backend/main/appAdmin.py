# -*- encoding: UTF-8 -*-
from handlerUtils import renderHtml
from models import PendingProfileImages
from django.conf import settings
from django.core.mail import send_mail
from django.utils.translation import ugettext

#from django.contrib.auth.decorators import user_passes_test

#@user_passes_test(lambda u: u.is_superuser)
def showAdminPageAction(request):
    if request.user.is_superuser:
        return renderHtml(request, 'admin.html', { "pendingProfileImagesList": PendingProfileImages.objects.all() })
    else:
        return renderHtml(request, '401.html', {})

def acceptProfileImagesAction(request):
    if request.user.is_superuser:
        # get and store images to profile image storage
        pendingProfileImagesId = request.GET['id']
        pendingProfileImages = PendingProfileImages.objects.get(pk=pendingProfileImagesId)
        pendingProfileImages.delete()
        return showAdminPageAction(request)

def rejectProfileImagesAction(request):
    if request.user.is_superuser:    
        pendingProfileImagesId = request.GET['id']
        pendingProfileImages = PendingProfileImages.objects.get(pk=pendingProfileImagesId)
        userprofile = pendingProfileImages.userProfile 
        userprofile.image.delete()
        userprofile.image_tumb.delete()
        userprofile.image_micro.delete()
        userprofile.save()
        user = pendingProfileImages.userProfile.coreuser
        send_mail(ugettext('Profileimage was not accepted'), ugettext('Unfortunally, your recent profileimage upload does not quailify according to the service policy.'), 'no-reply@example.com', [user.email], fail_silently=False)
        return showAdminPageAction(request)
