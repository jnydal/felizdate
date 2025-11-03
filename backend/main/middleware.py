# -*- encoding: UTF-8 -*-
from django.middleware import csrf
from activity import ActivityManager
from profileUtils import getLoggedInUserProfile
import datetime
        
class ActivityMiddleware():    
    def process_request(self, request):
        if request.user.is_authenticated():
            userProfile = getLoggedInUserProfile(request)
            if userProfile:
                ActivityManager.LAST_REQUEST[userProfile] = datetime.datetime.now()
        return None

class CustomCsrfViewMiddleware(csrf.CsrfViewMiddleware):
    def process_view(self, request, callback, callback_args, callback_kwargs):
        validClient = False
        try:
            validClient = request.COOKIES['client'] == 'phonegap'
        except Exception:
            pass
        if not validClient:
            if getattr(request, 'csrf_processing_done', False):
                return None
    
            try:
                csrf_token = csrf._sanitize_token(
                    request.COOKIES[csrf.settings.CSRF_COOKIE_NAME])
                request.META['CSRF_COOKIE'] = csrf_token
            except KeyError:
                csrf_token = None
                request.META["CSRF_COOKIE"] = csrf._get_new_csrf_key()
    
            if getattr(callback, 'csrf_exempt', False):
                return None
    
            if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
                if getattr(request, '_dont_enforce_csrf_checks', False):
                    return self._accept(request)
    
                if request.is_secure():
                    referer = request.META.get('HTTP_REFERER')
                    if referer is None:
                        csrf.logger.warning('Forbidden (%s): %s',
                                       csrf.REASON_NO_REFERER, request.path,
                            extra={
                                'status_code': 403,
                                'request': request,
                            }
                        )
                        return self._reject(request, csrf.REASON_NO_REFERER)
    
                    good_referer = 'https://%s/' % request.get_host()
                    if not csrf.same_origin(referer, good_referer):
                        reason = csrf.REASON_BAD_REFERER % (referer, good_referer)
                        csrf.logger.warning('Forbidden (%s): %s', reason, request.path,
                            extra={
                                'status_code': 403,
                                'request': request,
                            }
                        )
                        return self._reject(request, reason)
    
                if csrf_token is None:
                    csrf.logger.warning('Forbidden (%s): %s',
                                   csrf.REASON_NO_CSRF_COOKIE, request.path,
                        extra={
                            'status_code': 403,
                            'request': request,
                        }
                    )
                    return self._reject(request, csrf.REASON_NO_CSRF_COOKIE)

                request_csrf_token = ""
                if request.method == "POST":
                    request_csrf_token = request.POST.get('csrfmiddlewaretoken', '')
    
                if request_csrf_token == "":
                    request_csrf_token = request.META.get('HTTP_X_CSRFTOKEN', '')
    
                if not csrf.constant_time_compare(request_csrf_token, csrf_token):
                    csrf.logger.warning('Forbidden (%s): %s',
                                   csrf.REASON_BAD_TOKEN, request.path,
                        extra={
                            'status_code': 403,
                            'request': request,
                        }
                    )
                    return self._reject(request, csrf.REASON_BAD_TOKEN)
    
            return self._accept(request)
        else:
            return self._accept(request)
