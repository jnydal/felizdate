# -*- encoding: UTF-8 -*-
'''
Exception class for encapsulating error/descriptions for application level exceptions.

Created on 24. des. 2011

@author: jny
'''

class AppException(Exception):
    '''
    classdocs
    '''

    def __init__(self, value):
        '''
        Constructor
        '''
        self.value = value

        
    def __str__(self):
        return repr(self.value)
