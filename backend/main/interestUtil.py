# -*- encoding: UTF-8 -*-
'''
Created on 12. feb. 2012

@author: jny
'''
from django.conf import settings
from models import Interest, Category
from modelUtils import getFirst
from handlerUtils import getLanguageCode

CUSTOM_INTEREST_CATEGORY_EN_ID = 0
CUSTOM_INTEREST_CATEGORY_NO_ID = 1

def saveInterest(interestText, categoryText, request):
    categoryId = CUSTOM_INTEREST_CATEGORY_EN_ID
    lc = getLanguageCode(request).lower()
    if lc == 'no':
        categoryId = CUSTOM_INTEREST_CATEGORY_NO_ID
    category = Category.objects.get(id=categoryId)
    interest = getFirst(Interest.objects.filter(description=interestText, language_code=lc))
    if not interest:
        interest = Interest(description=interestText, category=category, language_code=lc)
        interest.save()
    return interest

def getInterestSuggestions(request, keyword):
    return Interest.objects.filter(language_code=getLanguageCode(request).lower(), description__icontains=keyword)

def getInterestSuggestion(request, keyword):
    result = None
    try:
        result = getInterestSuggestions(request, keyword)[0]
    except:
        pass
    return result

def getCategorySuggestions(request, keyword):
    return Category.objects.filter(language_code=getLanguageCode(request), description__icontains=keyword)
