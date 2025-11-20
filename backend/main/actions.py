from django.shortcuts import render


def signupPageAction(request):
    """
    Legacy landing page endpoint that renders the original signup template.
    """
    return render(request, 'signup.html')

