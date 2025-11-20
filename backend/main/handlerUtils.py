# -*- encoding: UTF-8 -*-
"""
Handler utilities for JSON responses and request helpers.
"""
from django.http import JsonResponse
from .models import UserProfile


def JSONSuccessResponse(payload):
    """
    Returns a JSON response with success=True and the given payload.
    """
    return JsonResponse({
        "success": True,
        "payload": payload
    })


def JSONErrorResponse(error):
    """
    Returns a JSON response with success=False and error information.
    """
    if isinstance(error, Exception):
        error_message = str(error)
    else:
        error_message = error
    
    return JsonResponse({
        "success": False,
        "errors": error_message,
        "message": error_message
    })


def JSONFieldErrorResponse(form_errors):
    """
    Returns a JSON response with success=False and field errors.
    """
    # Convert Django form errors to a dict format
    if hasattr(form_errors, 'as_data'):
        # Django form errors
        errors_dict = {}
        for field, errors in form_errors.items():
            errors_dict[field] = [str(e) for e in errors]
    elif isinstance(form_errors, dict):
        errors_dict = form_errors
    else:
        errors_dict = {"__all__": [str(form_errors)]}
    
    return JsonResponse({
        "success": False,
        "fielderrors": errors_dict
    })


def getLoggedInUserProfile(request):
    """
    Returns the UserProfile associated with the logged-in user, or None.
    """
    if not request.user or not request.user.is_authenticated:
        return None
    
    try:
        # UserProfile has a coreuser field that references the Django User
        return UserProfile.objects.get(coreuser=request.user)
    except UserProfile.DoesNotExist:
        return None


def getLanguageCode(request):
    """
    Extracts the language code from the request (e.g., from Accept-Language header or session).
    """
    # Check session first
    if hasattr(request, 'session') and 'language' in request.session:
        return request.session['language']
    
    # Check Accept-Language header
    if 'HTTP_ACCEPT_LANGUAGE' in request.META:
        accept_language = request.META['HTTP_ACCEPT_LANGUAGE']
        # Parse the first language code (e.g., "en-US,en;q=0.9" -> "en")
        if accept_language:
            lang = accept_language.split(',')[0].split('-')[0].upper()
            return lang
    
    # Default to English
    return 'EN'


def runJavascript(code):
    """
    Stub for running JavaScript code (legacy function, may not be used).
    """
    # This was likely used for legacy frontend integration
    # Not needed for React frontend
    pass


def storeTemporaryMediaFile(file, filename):
    """
    Stores a temporary media file and returns the path.
    """
    # TODO: Implement actual file storage logic
    # For now, return a placeholder
    import os
    from django.conf import settings
    
    temp_dir = getattr(settings, 'TEMP_MEDIA_ROOT', '/tmp')
    os.makedirs(temp_dir, exist_ok=True)
    
    file_path = os.path.join(temp_dir, filename)
    with open(file_path, 'wb') as f:
        for chunk in file.chunks():
            f.write(chunk)
    
    return file_path


def validateMedia(file):
    """
    Validates a media file (size, type, etc.).
    """
    # TODO: Implement actual validation logic
    # For now, return True
    return True

