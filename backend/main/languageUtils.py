# -*- encoding: UTF-8 -*-
'''
Created on 30. jan. 2012

@author: jny
'''
from google import translate

class Translator:
    
    GOOGLE_LANGUAGE_CODE_MAPPING = {'en-gb': 'en',
                                    'en-us': 'en',
                                    'no_nn': 'no',
                                    'no_bm': 'no',
                                    'de-at': 'de',}
    
    @classmethod
    def getGoogleTranslation(self, keyword, fromLanguageCode, toLanguageCode):
        toCode = Translator.GOOGLE_LANGUAGE_CODE_MAPPING.get(toLanguageCode)
        fromCode = Translator.GOOGLE_LANGUAGE_CODE_MAPPING.get(fromLanguageCode)
        return translate(keyword, fromCode, toCode)
