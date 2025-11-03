# -*- encoding: UTF-8 -*-
'''
Created on 18. sep. 2011

@author: jny
'''
from django.test import TestCase, client
from django.core.files.storage import default_storage
from models import City, BodyType, HairType, SkinType, EyeColor, Occupation, EducationalDegree, Religion, Political

"""
server side action/integration tests.

run with manage.py test app.
"""

class RegisterActionHandlerTestCase(TestCase):

    def setUp(self):
        """
        self.city = City.objects.create(name="Oslo", countrycode="NOR", population="1000000", district="Oslo")
        self.city2 = City.objects.create(name="London", countrycode="GB", population="10000000", district="London")
        self.city3 = City.objects.create(name="New York", countrycode="US", population="10000000", district="New York")
        
        self.bodyType = BodyType.objects.create(description="other", sortnumber=0)
        self.bodyType2 = BodyType.objects.create(description="normal", sortnumber=1)
        self.bodyType3 = BodyType.objects.create(description="fat", sortnumber=2)
        
        self.hairType = HairType.objects.create(description="other", sortnumber=0)
        self.hairType2 = HairType.objects.create(description="brown", sortnumber=1)
        self.hairType3 = HairType.objects.create(description="dark", sortnumber=2)
        
        self.skinType = SkinType.objects.create(description="other", sortnumber=0)
        self.skinType2 = SkinType.objects.create(description="tanned", sortnumber=1)
        self.skinType3 = SkinType.objects.create(description="black", sortnumber=2)
        
        self.eyeColor = EyeColor.objects.create(description="other", sortnumber=0)
        self.eyeColor2 = EyeColor.objects.create(description="green", sortnumber=1)
        self.eyeColor3 = EyeColor.objects.create(description="brown", sortnumber=2)
        
        self.occupation = Occupation.objects.create(description="other", sortnumber=0)
        self.occupation2 = Occupation.objects.create(description="engineer", sortnumber=1)
        self.occupation3 = Occupation.objects.create(description="lawyer", sortnumber=2)
        
        self.educationalDegree = EducationalDegree.objects.create(description="other", sortnumber=0)
        self.educationalDegree2 = EducationalDegree.objects.create(description="b. sc", sortnumber=1)
        self.educationalDegree3 = EducationalDegree.objects.create(description="m. sc", sortnumber=2)
        
        self.religion = Religion.objects.create(description="other", sortnumber=0)
        self.religion2 = Religion.objects.create(description="buddhist", sortnumber=1)
        self.religion3 = Religion.objects.create(description="atheist", sortnumber=2)
        
        self.political = Political.objects.create(description="other", sortnumber=0)
        self.political2 = Political.objects.create(description="democrat", sortnumber=1)
        self.political3 = Political.objects.create(description="republican", sortnumber=2)
        """
        
    """
        on invalid email
    """
    def testInvalidEmailScenario(self):
        print 'request unsuccessfull account registering'
        c = client.Client()
        response = c.post('/action/registerAccount/', {'email': 'johnmail.com',
                                                     'password': 'smith'},
                                                     HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response unsuccessfull account registering' + str(response)
        self.assertContains(response, 'fieldErrors')

    """
        on existing email
    """
    def testExistingEmailScenario(self):
        c = client.Client()
        response = c.post('/action/registerAccount/', {'email': 'john@mail.com',
                                                     'password': 'smith'},
                                                     HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertNotContains(response, 'error')
        
        print 'request on existing mail account registering'
        
        response = c.post('/action/registerAccount/', {'email': 'john@mail.com',
                                                     'password': 'smith'},
                                                     HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response on existing mail account registering' + str(response)
        self.assertContains(response, 'errors')

    """
        on invalid username
    """
    def testInvalidUsernameScenario(self):
        print 'request unsuccessfull profile registering'
        c = client.Client()
        response = c.post('/action/registerAccount/', {'email': 'asd@mail.com',
                                                     'password': 'smith'},
                                                     HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response successfull account registering' + str(response)
        self.assertNotContains(response, 'error')
        
        print 'request successfull account registering (wo/image)'
        response = c.post('/action/registerProfile/', {'profileName': 'asd',
                                                      'yearOfBirth' : 1985,
                                                      'cityId' : self.city.pk,
                                                      'gender' : 'f',
                                                      
                                                      'occupation' : self.occupation.pk,
                                                      'education' : self.educationalDegree.pk,
                                                      'political' : self.political.pk,
                                                      'religion' : self.religion.pk,
                                                      'body' : self.bodyType.pk,
                                                      'hair' : self.hairType3.pk,
                                                      'skin' : self.skinType.pk,
                                                      'eyeColor' : self.eyeColor.pk,

                                                      'partnerOccupation' : [self.occupation.pk, self.occupation2.pk],
                                                      'partnerEducation' : [self.educationalDegree.pk],
                                                      'partnerPolitical' : [self.political.pk],
                                                      'partnerReligion' : [self.religion.pk],
                                                      'partnerBodyTypes': [self.bodyType.pk,self.bodyType2.pk,self.bodyType3.pk],
                                                      'partnerHair' : [self.hairType.pk,self.hairType3.pk],
                                                      'partnerSkin' : [self.skinType.pk,self.skinType2.pk],
                                                      'partnerEyes' : [self.eyeColor.pk],
                                                      'partnerGender' : 'm',
                          
                                                      },HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response successfull account registering (wo/image)' + str(response)
        self.assertContains(response, 'error')

    def testExistingUsernameScenario(self):
        print 'request unsuccessfull profile registering'
        c = client.Client()
        response = c.post('/action/registerAccount/', {'email': 'asd@mail.com',
                                                     'password': 'smith'},
                                                     HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response successfull account registering' + str(response)
        self.assertNotContains(response, 'error')
        
        print 'request successfull account registering (wo/image)'
        response = c.post('/action/registerProfile/', {'profileName': 'sindy26',
                                                      'yearOfBirth' : 1985,
                                                      'cityId' : self.city.pk,
                                                      'gender' : 'f',
                                                      
                                                      'occupation' : self.occupation.pk,
                                                      'education' : self.educationalDegree.pk,
                                                      'political' : self.political.pk,
                                                      'religion' : self.religion.pk,
                                                      'body' : self.bodyType.pk,
                                                      'hair' : self.hairType3.pk,
                                                      'skin' : self.skinType.pk,
                                                      'eyeColor' : self.eyeColor.pk,

                                                      'partnerOccupation' : [self.occupation.pk, self.occupation2.pk],
                                                      'partnerEducation' : [self.educationalDegree.pk],
                                                      'partnerPolitical' : [self.political.pk],
                                                      'partnerReligion' : [self.religion.pk],
                                                      'partnerBodyTypes': [self.bodyType.pk,self.bodyType2.pk,self.bodyType3.pk],
                                                      'partnerHair' : [self.hairType.pk,self.hairType3.pk],
                                                      'partnerSkin' : [self.skinType.pk,self.skinType2.pk],
                                                      'partnerEyes' : [self.eyeColor.pk],
                                                      'partnerGender' : 'm',
                          
                                                      },HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        response = c.post('/action/registerProfile/', {'profileName': 'sindy26',
                                                      'yearOfBirth' : 1985,
                                                      'cityId' : self.city.pk,
                                                      'gender' : 'f',
                                                      
                                                      'occupation' : self.occupation.pk,
                                                      'education' : self.educationalDegree.pk,
                                                      'political' : self.political.pk,
                                                      'religion' : self.religion.pk,
                                                      'body' : self.bodyType.pk,
                                                      'hair' : self.hairType3.pk,
                                                      'skin' : self.skinType.pk,
                                                      'eyeColor' : self.eyeColor.pk,

                                                      'partnerOccupation' : [self.occupation.pk, self.occupation2.pk],
                                                      'partnerEducation' : [self.educationalDegree.pk],
                                                      'partnerPolitical' : [self.political.pk],
                                                      'partnerReligion' : [self.religion.pk],
                                                      'partnerBodyTypes': [self.bodyType.pk,self.bodyType2.pk,self.bodyType3.pk],
                                                      'partnerHair' : [self.hairType.pk,self.hairType3.pk],
                                                      'partnerSkin' : [self.skinType.pk,self.skinType2.pk],
                                                      'partnerEyes' : [self.eyeColor.pk],
                                                      'partnerGender' : 'm',
                          
                                                      },HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response successfull account registering (wo/image)' + str(response)
        self.assertContains(response, 'error')

    """
        on minumal setup (no image)
    """
    def testSuccessfulRegisterScenario1(self):
        print 'request successfull account registering'
        c = client.Client()
        response = c.post('/action/registerAccount/', {'email': 'john@mail.com',
                                                     'password': 'smith'},
                                                     HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response successfull account registering' + str(response)
        self.assertNotContains(response, 'error')
        
        print 'request successfull account registering (wo/image)'
        response = c.post('/action/registerProfile/', {'profileName': 'sindy26',
                                                      'yearOfBirth' : 1985,
                                                      'cityId' : self.city.pk,
                                                      'gender' : 'f',
                                                      
                                                      'occupation' : self.occupation.pk,
                                                      'education' : self.educationalDegree.pk,
                                                      'political' : self.political.pk,
                                                      'religion' : self.religion.pk,
                                                      'body' : self.bodyType.pk,
                                                      'hair' : self.hairType3.pk,
                                                      'skin' : self.skinType.pk,
                                                      'eyeColor' : self.eyeColor.pk,

                                                      'partnerOccupation' : [self.occupation.pk, self.occupation2.pk],
                                                      'partnerEducation' : [self.educationalDegree.pk],
                                                      'partnerPolitical' : [self.political.pk],
                                                      'partnerReligion' : [self.religion.pk],
                                                      'partnerBodyTypes': [self.bodyType.pk,self.bodyType2.pk,self.bodyType3.pk],
                                                      'partnerHair' : [self.hairType.pk,self.hairType3.pk],
                                                      'partnerSkin' : [self.skinType.pk,self.skinType2.pk],
                                                      'partnerEyes' : [self.eyeColor.pk],
                                                      'partnerGender' : 'm',
                          
                                                      },HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response successfull account registering (wo/image)' + str(response)
        self.assertNotContains(response, 'error')
        
    """
        on profile registration with image
    """
    def testSuccessfulRegisterScenario2(self):
        
        print 'request successfull account registering'
        c = client.Client()
        response = c.post('/action/registerAccount/', {'email': 'john@mail.com',
                                                     'password': 'smith'},
                                                     HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response successfull account registering' + str(response)
        self.assertNotContains(response, 'error')
        
        print 'request successfull image upload'
        f = default_storage.open('test.png')

        response = c.post('/action/uploadImageDraft/', {'image': f})
        temp = str(response).split(',')
        imagePath = temp[1][1:][:len(temp[1])-2]
        print 'response successfull image upload' + str(response)
        self.assertNotContains(response, 'error')
        
        print 'request successfull image crop'
        response = c.post('/action/cropImage/', {'temporaryImagePathFile': imagePath,
                                                'x' : 0, 'y' : 0, 'w' : 50, 'h' : 50},
                                                HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response successfull image crop' + str(response) 
        self.assertNotContains(response, 'error')
        
        temp = str(response).split(',')
        tumbImagePath = temp[5][32:][:len(temp[1])-2]
        profileImagePath = temp[2][38:][:len(temp[1])-2]
        
        print 'request successfull profile registering (w/image)'
        response = c.post('/action/registerProfile/', {'profileName': 'sindy26',
                                                      'yearOfBirth' : 1985,
                                                      'cityId' : self.city.pk,
                                                      'gender' : 'f',
                                                      'description' : '',
                                                      
                                                      'occupation' : self.occupation.pk,
                                                      'education' : self.educationalDegree.pk,
                                                      'political' : self.political.pk,
                                                      'religion' : self.religion.pk,
                                                      'body' : self.bodyType.pk,
                                                      'hair' : self.hairType3.pk,
                                                      'skin' : self.skinType.pk,
                                                      'eyeColor' : self.eyeColor.pk,

                                                      'partnerOccupation' : [self.occupation.pk, self.occupation2.pk],
                                                      'partnerEducation' : [self.educationalDegree.pk],
                                                      'partnerPolitical' : [self.political.pk],
                                                      'partnerReligion' : [self.religion.pk],
                                                      'partnerBodyTypes': [self.bodyType.pk,self.bodyType2.pk,self.bodyType3.pk],
                                                      'partnerHair' : [self.hairType.pk,self.hairType3.pk],
                                                      'partnerSkin' : [self.skinType.pk,self.skinType2.pk],
                                                      'partnerEyes' : [self.eyeColor.pk],
                                                      'partnerGender' : 'm',
                          
                                                      #'temporaryTumbImagePathFile' : tumbImagePath,
                                                      #'temporaryImagePathFile' : profileImagePath
                                                      },HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print 'response successfull profile registering (w/image)' + str(response)
        self.assertNotContains(response, 'error')