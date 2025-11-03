# -*- encoding: UTF-8 -*-
'''

Image utility module.

Created on 1. mai 2011

@author: jny

'''
from cStringIO import StringIO
from os.path import splitext
from datetime import date
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage
from hashlib import md5
from PIL import Image #@UnresolvedImport
from django.conf import settings

"""
Method for resizing images to cropping ready format.
Stores image in temporary filesystem folder. Returns path to file.
"""

storageInstance = FileSystemStorage()

def storeProfileImageDraft(imageFile):
    # create PIL image instance and resize
    image = Image.open(imageFile)
    hpercent = (settings.DEFAULT_PROFILE_IMAGE_INITIAL_HEIGHT/float(image.size[1]))
    wsize = int((float(image.size[0])*float(hpercent)))
    image = image.resize((wsize,settings.DEFAULT_PROFILE_IMAGE_INITIAL_HEIGHT), Image.ANTIALIAS)
    width, height = image.size
    
    # create file buffer, and save image as png.
    fileBuffer = StringIO()
    image.save(fileBuffer, settings.DEFAULT_IMAGE_FORMAT)
    rawData = fileBuffer.getvalue()
    
    # create unique temporary filename
    today = date.today()
    hourString = today.strftime('%y-%m-%d-%H/')
    filename = md5(rawData).hexdigest()
    fileBuffer.close()
    pathFilename = settings.TEMPORARY_IMAGE_PATH + hourString + filename + '.' + settings.DEFAULT_IMAGE_FORMAT
    
    # save to disk
    c = ContentFile(rawData)
    imageDraftPath = storageInstance.save(pathFilename, c)

    # return url to temporary image with width and height parameters for initializing cropbox
    return (imageDraftPath, pathFilename, width, height)

def getCroppedAndResizedTemporaryImagePathFiles(temporaryImagePathFile, x, y, w, h):
    
    x = int(x)
    y = int(y)
    w = int(w)
    h = int(h)
    
    # create PIL image instance and resize
    imageFile = storageInstance.open(temporaryImagePathFile)
    image = Image.open(imageFile)
    
    #crop
    cropBox = (x, y, w+x, h+y)
    image = image.crop(cropBox)
    
    # resize (doing a micro
    hpercent = (settings.DEFAULT_PROFILE_IMAGE_MICRO_HEIGHT/float(image.size[1]))
    wsize = int((float(image.size[0])*float(hpercent)))
    micro = image.resize((wsize,settings.DEFAULT_PROFILE_IMAGE_MICRO_HEIGHT), Image.ANTIALIAS)
    
    # resize (doing a thumb)
    hpercent = (settings.DEFAULT_PROFILE_IMAGE_THUMBNAIL_HEIGHT/float(image.size[1]))
    wsize = int((float(image.size[0])*float(hpercent)))
    thumbnail = image.resize((wsize,settings.DEFAULT_PROFILE_IMAGE_THUMBNAIL_HEIGHT), Image.ANTIALIAS)
    
    # resize (main image)
    hpercent = (settings.DEFAULT_PROFILE_IMAGE_HEIGHT/float(image.size[1]))
    wsize = int((float(image.size[0])*float(hpercent)))
    image = image.resize((wsize,settings.DEFAULT_PROFILE_IMAGE_HEIGHT), Image.ANTIALIAS)
    
    # create file buffer, and save micro as png.
    fileBufferMicro = StringIO()
    micro.save(fileBufferMicro, settings.DEFAULT_IMAGE_FORMAT)
    rawDataMicro = fileBufferMicro.getvalue()
    
    # create file buffer, and save tumbnail as png.
    fileBufferTumb = StringIO()
    thumbnail.save(fileBufferTumb, settings.DEFAULT_IMAGE_FORMAT)
    rawDataTumb = fileBufferTumb.getvalue()
    
    # create file buffer, and save image as png.
    fileBuffer = StringIO()
    image.save(fileBuffer, settings.DEFAULT_IMAGE_FORMAT)
    rawData = fileBuffer.getvalue()
    
    # create unique temporary filename
    filename = md5(rawData).hexdigest()
    fileBuffer.close()
    
    # store temporary tumb/profile images
    temporaryProfileImagePathFile = ''.join([settings.TEMPORARY_PROFILE_IMAGE_PATH, filename, '.', settings.DEFAULT_IMAGE_FORMAT])
    storageInstance.save(temporaryProfileImagePathFile, ContentFile(rawData))
    temporaryTumbProfileImagePathFile = ''.join([settings.TEMPORARY_TUMB_PROFILE_IMAGE_PATH, filename, '.', settings.DEFAULT_IMAGE_FORMAT])
    storageInstance.save(temporaryTumbProfileImagePathFile, ContentFile(rawDataTumb))
    temporaryMicroProfileImagePathFile = ''.join([settings.TEMPORARY_MICRO_PROFILE_IMAGE_PATH, filename, '.', settings.DEFAULT_IMAGE_FORMAT])
    storageInstance.save(temporaryMicroProfileImagePathFile, ContentFile(rawDataMicro))
    
    return (temporaryProfileImagePathFile, temporaryTumbProfileImagePathFile, temporaryMicroProfileImagePathFile)

"""
Method for making main profile image and corresponding thumbnail from crop parameters.
"""
def getAndRemoveTemporaryFile(temporaryPathFile):
    imageBuffer = storageInstance.open(temporaryPathFile).read()
    storageInstance.delete(temporaryPathFile)
    return ContentFile(imageBuffer)

"""
Method for making main profile image and corresponding thumbnail from crop parameters.
"""
def getProfileImageSet(pathFilename,x,y,w,h):
    
    x = int(x)
    y = int(y)
    w = int(w)
    h = int(h)
    
    # open
    imageFile = storageInstance.open(pathFilename)
    image = Image.open(imageFile)
    
    #crop
    cropBox = (x, y, w+x, h+y)
    image = image.crop(cropBox)

    # resize (doing a thumb)
    hpercent = (settings.DEFAULT_PROFILE_IMAGE_THUMBNAIL_HEIGHT/float(image.size[1]))
    wsize = int((float(image.size[0])*float(hpercent)))
    thumbnail = image.resize((wsize,settings.DEFAULT_PROFILE_IMAGE_THUMBNAIL_HEIGHT), Image.ANTIALIAS)
    
    # resize (main image)
    hpercent = (settings.DEFAULT_PROFILE_IMAGE_HEIGHT/float(image.size[1]))
    wsize = int((float(image.size[0])*float(hpercent)))
    image = image.resize((wsize,settings.DEFAULT_PROFILE_IMAGE_HEIGHT), Image.ANTIALIAS)
    
    # create file buffer and convert thumbnail to png.
    buffer = StringIO()
    thumbnail.save(buffer, settings.DEFAULT_IMAGE_FORMAT)
    thumbnaildata = buffer.getvalue()
    buffer.close()
    
    # create file buffer and convert image to png.
    buffer = StringIO()
    image.save(buffer, settings.DEFAULT_IMAGE_FORMAT)
    imagedata = buffer.getvalue()
    buffer.close()
    
    imageFile.close()
    
    # delete image draft from filesystem
    storageInstance.delete(pathFilename)
    
    return (ContentFile(imagedata), ContentFile(thumbnaildata))

"""
Method for getting file extension of a file.
"""
def getFileExtension(file):
    basename, extension = splitext(file)
    return extension

"""
Method for getting file basename.
"""
def getFileBasename(file):
    basename, extension = splitext(file)
    return basename
