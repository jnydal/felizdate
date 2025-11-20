# -*- encoding: UTF-8 -*-
from django.conf import settings
from django.urls import path, re_path
from django.views.static import serve
from django.views.i18n import JavaScriptCatalog
from django.contrib.auth import views as auth_views

from backend.main import ajaxActions, actions, appAdmin

js_info_dict = {'packages': ('felizdate',)}

urlpatterns = [
    path('jsi18n/', JavaScriptCatalog.as_view(**js_info_dict)),
    path('signup/', actions.signupPageAction),
    path('registrer/', actions.signupPageAction),

    path('action/getUserSession/', ajaxActions.getUserSessionJSONAction),
    path('action/getLatestMessages/', ajaxActions.getLatestMessagesJSONAction),
    path('action/setStatus/', ajaxActions.setStatusJSONAction),
    path('action/setPosition/', ajaxActions.setPositionJSONAction),
    path('action/getProfile/', ajaxActions.getProfileJSONAction),
    path('action/getOptions/', ajaxActions.getOptionsJSONAction),
    path('action/getInterests/', ajaxActions.getInterestSuggestionsJSONAction),
    path('action/saveInterest/', ajaxActions.saveInterestJSONAction),
    path('action/getCloseByProfiles/', ajaxActions.getCloseByProfilesJSONAction),
    path('action/toggleBlock/', ajaxActions.toggleBlockJSONAction),

    path('action/getMessages/', ajaxActions.getMessagesJSONAction),
    path('action/sendMessage/', ajaxActions.sendMessageJSONAction),
    path('action/searchProfiles/', ajaxActions.searchProfilesJSONAction),
    path('action/quickSearch/', ajaxActions.quickSearchJSONAction),
    path('action/getBestMatches/', ajaxActions.getBestMatchesJSONAction),
    path('action/getConversation/', ajaxActions.getConversationJSONAction),

    path('action/saveAccount/', ajaxActions.saveAccountJSONAction),
    path('action/uploadImageDraft/', ajaxActions.uploadImageDraftJSONAction),
    path('action/uploadMedia/', ajaxActions.uploadMediaJSONAction),
    path('action/deleteMedia/', ajaxActions.deleteMediaJSONAction),
    path('action/cropImage/', ajaxActions.cropImageJSONAction),
    path('action/saveProfile/', ajaxActions.saveProfileJSONAction),
    path('action/saveAdvanced/', ajaxActions.saveAdvancedJSONAction),

    path('action/reportIssue/', ajaxActions.reportIssueJSONAction),
    path('action/login/', ajaxActions.loginJSONAction),
    path('action/logout/', ajaxActions.logoutJSONAction),
    path('action/getCities/', ajaxActions.getCitiesJSONAction),

    path(
        'action/passwordReset/',
        auth_views.PasswordResetView.as_view(
            template_name='resetPasswordForm.html',
            email_template_name='resetPasswordEmail.html',
        ),
    ),
    path(
        'action/passwordReset/done/',
        auth_views.PasswordResetDoneView.as_view(template_name='resetPasswordDone.html'),
    ),
    re_path(
        r'action/reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>.+)/$',
        auth_views.PasswordResetConfirmView.as_view(template_name='resetPasswordConfirm.html'),
    ),
    path(
        'action/reset/done/',
        auth_views.PasswordResetCompleteView.as_view(template_name='resetPasswordComplete.html'),
    ),

    path('appadmin/', appAdmin.showAdminPageAction),
    path('appadmin/acceptPendingProfileImages', appAdmin.acceptPendingProfileImagesAction),
    path('appadmin/rejectPendingProfileImages', appAdmin.rejectPendingProfileImagesAction),

    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]

