# -*- encoding: UTF-8 -*-
import os, zipfile

# zip application
for fname in os.listdir('.'):
    basename, ext = os.path.splitext(fname)
    if ext.lower().endswith('zip'): continue
    f = zipfile.ZipFile('%s.zip' % basename, 'w')
    f.write(fname)
    f.close()
    print fname

# transfer it via scp

# unzip application via ssh

# stop gunicorn, nginx, and haproxy via ssh

# run YUI compression shell script via ssh

# start services via ssh

