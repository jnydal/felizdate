# -*- encoding: UTF-8 -*-
from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib import admin

# Uncomment the next two lines to enable the admin:
admin.autodiscover()

js_info_dict = {
    'packages': ('felizdate',),
}

urlpatterns = patterns('',
    
    # i18n js provider
    (r'^jsi18n/$', 'django.views.i18n.javascript_catalog', js_info_dict),
    
    # entry for dev server
    url(r'^signup/$', 'felizdate.main.actions.signupPageAction'),
    url(r'^registrer/$', 'felizdate.main.actions.signupPageAction'),
    
    # session
    url(r'^action/getUserSession/$', 'felizdate.main.ajaxActions.getUserSessionJSONAction'),
    
    # account
    url(r'^action/getLatestMessages/$', 'felizdate.main.ajaxActions.getLatestMessagesJSONAction'),
    
    # profile
    url(r'^action/setStatus/$', 'felizdate.main.ajaxActions.setStatusJSONAction'),
    url(r'^action/setPosition/$', 'felizdate.main.ajaxActions.setPositionJSONAction'),
    url(r'^action/getProfile/$', 'felizdate.main.ajaxActions.getProfileJSONAction'),
    url(r'^action/getOptions/$', 'felizdate.main.ajaxActions.getOptionsJSONAction'),
    url(r'^action/getInterests/$', 'felizdate.main.ajaxActions.getInterestSuggestionsJSONAction'),
    url(r'^action/saveInterest/$', 'felizdate.main.ajaxActions.saveInterestJSONAction'),
    url(r'^action/getCloseByProfiles/$', 'felizdate.main.ajaxActions.getCloseByProfilesJSONAction'),
    url(r'^action/toggleBlock/$', 'felizdate.main.ajaxActions.toggleBlockJSONAction'),

    # messages
    url(r'^action/getMessages/$', 'felizdate.main.ajaxActions.getMessagesJSONAction'),
    url(r'^action/sendMessage/$', 'felizdate.main.ajaxActions.sendMessageJSONAction'),
    
    # search
    url(r'^action/searchProfiles/$', 'felizdate.main.ajaxActions.searchProfilesJSONAction'),
    url(r'^action/quickSearch/$', 'felizdate.main.ajaxActions.quickSearchJSONAction'),
    url(r'^action/getBestMatches/$', 'felizdate.main.ajaxActions.getBestMatchesJSONAction'),
    url(r'^action/getConversation/$', 'felizdate.main.ajaxActions.getConversationJSONAction'),
    
    # register
    url(r'^action/saveAccount/$', 'felizdate.main.ajaxActions.saveAccountJSONAction'),
    url(r'^action/uploadImageDraft/$', 'felizdate.main.ajaxActions.uploadImageDraftJSONAction'),
    url(r'^action/uploadMedia/$', 'felizdate.main.ajaxActions.uploadMediaJSONAction'),
    url(r'^action/deleteMedia/$', 'felizdate.main.ajaxActions.deleteMediaJSONAction'),
    url(r'^action/cropImage/$', 'felizdate.main.ajaxActions.cropImageJSONAction'),
    url(r'^action/saveProfile/$', 'felizdate.main.ajaxActions.saveProfileJSONAction'),
    url(r'^action/saveAdvanced/$', 'felizdate.main.ajaxActions.saveAdvancedJSONAction'),
    
    # report
    url(r'^action/reportIssue/$', 'felizdate.main.ajaxActions.reportIssueJSONAction'),

    # login
    url(r'^action/login/$', 'felizdate.main.ajaxActions.loginJSONAction'),
    
    # logout
    url(r'^action/logout/$', 'felizdate.main.ajaxActions.logoutJSONAction'),
    
    url(r'^action/getCities/$', 'felizdate.main.ajaxActions.getCitiesJSONAction'),

    # reset password
    url(r'^action/passwordReset/$','django.contrib.auth.views.password_reset',{'template_name': 'resetPasswordForm.html','email_template_name': 'resetPasswordEmail.html'}),
    url(r'^action/passwordReset/done/$','django.contrib.auth.views.password_reset_done',{'template_name': 'resetPasswordDone.html'}),
    url(r'^action/reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$','django.contrib.auth.views.password_reset_confirm', {'template_name': 'resetPasswordConfirm.html'}),
    url(r'^action/reset/done/$', 'django.contrib.auth.views.password_reset_complete', {'template_name': 'resetPasswordComplete.html'}),
    
    # app admin
    url(r'^appadmin/$', 'felizdate.main.appAdmin.showAdminPageAction'),
    url(r'^appadmin/acceptPendingProfileImages$', 'felizdate.main.appAdmin.acceptProfileImagesAction'),
    url(r'^appadmin/rejectPendingProfileImages$', 'felizdate.main.appAdmin.rejectProfileImagesAction'),
    
    # temp media root
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, }),
    
    # temp static root
    url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT, }),
)
