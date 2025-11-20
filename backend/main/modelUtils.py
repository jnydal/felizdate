# -*- encoding: UTF-8 -*-
"""
model utils.

Created on 25. juni 2011

@author: jny
"""
from datetime import date
from django.db.models import QuerySet


class ProfileImageStorage:
    """
    Placeholder for S3 storage (can be implemented if needed).
    """
    pass


def imageFilePath(instance, filename):
    today = date.today()
    dot_index = filename.find('.', 0, len(filename))
    today_string = today.strftime('%Y/%m/%d')
    return ('').join([today_string, '/', str(instance.id), filename[dot_index:]])


def tumbImageFilePath(instance, filename):
    dot_index = filename.find('.', 0, len(filename))
    return ('').join([str(instance.id), '_tumb', filename[dot_index:]])


def getFirst(o):
    """
    Returns the first item from a QuerySet, or None if empty.
    """
    if isinstance(o, QuerySet):
        if len(o) > 0:
            return o[0]
        return None
    else:
        return o

