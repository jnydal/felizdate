#! /usr/bin/env python
# -*- encoding: UTF-8 -*-
import os, boto, mimetypes, gzip
from io import BytesIO
from StringIO import StringIO
from optparse import OptionParser
from felizdate import settings
from boto.cloudfront import CloudFrontConnection
from time import sleep
 
# Boto picks up configuration from the env.
os.environ['AWS_ACCESS_KEY_ID'] = settings.AWS_ACCESS_KEY_ID
os.environ['AWS_SECRET_ACCESS_KEY'] = settings.AWS_SECRET_ACCESS_KEY
 
# The list of content types to gzip, add more if needed
COMPRESSIBLE = [ 'text/plain', 'application/javascript', 'text/css', 'text/javascript', 'image/png', 'image/jpg', 'image/gif']
 
def main():
    parser = OptionParser(usage='usage: %prog [options] src_folder destination_bucket_name prefix')
    parser.add_option('-x', '--expires', action='store_true', help='set far future expiry for all files')
    parser.add_option('-m', '--minify', action='store_true', help='minify javascript files')
    (options, args) = parser.parse_args()
    if len(args) != 3:
        parser.error("incorrect number of arguments")
    src_folder = os.path.normpath(args[0])
    bucket_name = args[1]
    prefix = args[2]
 
    conn = boto.connect_s3()
    bucket = conn.get_bucket(bucket_name)
    
    # delete old
    for key in bucket.list(prefix=prefix):
        key.delete()
    
    namelist = []
    for root, dirs, files in os.walk(src_folder):
        if files and not '.svn' in root:
            path = os.path.relpath(root, src_folder)
            namelist += [os.path.normpath(os.path.join(path, f)) for f in files]
 
    print 'Uploading %d files to bucket %s' % (len(namelist), bucket.name)
    for name in namelist:
        content = open(os.path.join(src_folder, name))
        key = bucket.new_key(os.path.join(prefix, name))
        type, encoding = mimetypes.guess_type(name)
        type = type or 'application/octet-stream'
        headers = { 'Content-Type': type, 'x-amz-acl': 'public-read' }
        states = [type]
 
        #if options.expires:
            # We only use HTTP 1.1 headers because they are relative to the time of download
            # instead of being hardcoded.
        headers['Cache-Control'] = 'max-age %d' % (3600 * 24 * 365)
 
        if type in COMPRESSIBLE:
            headers['Content-Encoding'] = 'gzip'
            compressed = StringIO()
            gz = gzip.GzipFile(filename=name, fileobj=compressed, mode='w')
            gz.writelines(content)
            gz.close()
            content.close
            content = BytesIO(compressed.getvalue())
            states.append('gzipped')
 
        states = ', '.join(states)
        print '- %s =&gt; %s (%s)' % (name, key.name, states)
        key.set_contents_from_file(content, headers)
        content.close();
    print 'Refreshing CloudFront cache...'
    conn = CloudFrontConnection(settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY)
    conn.create_invalidation_request(settings.AWS_CF_DISTRIBUTION_ID, ['/s/js/js.min.js','/s/3rdjs/3rdjs.min.js','/s/css/styles.min.css','/s/3rdcss/styles.min.css','/s/opt/android-websocket.js', '/s/images/sprites.png'])
    
if __name__ == '__main__':
    main()