#!/bin/sh

# ///////////////// COMPRESS JS /////////////////////

# compress js
for file in `find static/js -name "*.js" | sort -n`
do
echo "Compressing JS file $file …"
java -jar yuicompressor-2.4.7.jar --type js -o $file.min $file
done

# merge minimized js composite-parts
for file in `find static/js`
do
if test -d $file
then
   cat $file/*.js.min > /srv/felizdate/static/js/$(basename $file).min.js
fi
done

#rm -r /srv/felizdate/static/js/*/
#rm /srv/felizdate/static/js/js.min.js

# merge to one min.js
cat static/js/common.min.js static/js/controller.min.js static/js/model.min.js static/js/entities.min.js static/js/communication.min.js static/js/view.min.js static/js/Application.js > /srv/felizdate/static/js/js.min.js
#mv static/js/js.min.js static/js/js.js
#rm static/js/*.min.js
#rm static/js/Application.js
#mv static/js/js.js static/js/js.min.js

# ///////////////// COMPRESS 3RDJS /////////////////////

# compress 3rdjs
for file in `find static/3rdjs -name "*.js" | sort -n`
do
echo "Compressing 3rdJS file $file …"
java -jar yuicompressor-2.4.7.jar --type js -o $file.min $file
done

# merge minimized js
for file in `find static/3rdjs`
do
if test -d $file
then
   cat $file/*.js.min > /srv/felizdate/static/3rdjs/$(basename $file).min.js
fi
done
#rm static/3rdjs/*_*

# ///////////////// COMPRESS CSS /////////////////////

# compress css
for file in `find static/css -name "*.css" | sort -n`
do
echo "Compressing CSS file $file …"
java -jar yuicompressor-2.4.7.jar --type css -o $file.min $file
done

# merge minimized css to one file and delete process files
cd /srv/felizdate/static/css
cat *.css.min > /srv/felizdate/static/css/styles.min.css
#rm *_*
cd /srv/felizdate

# ///////////////// COMPRESS 3RDCSS /////////////////////

# compress css
for file in `find static/3rdcss -name "*.css" | sort -n`
do
echo "Compressing 3rdCSS file $file …"
java -jar yuicompressor-2.4.7.jar --type css -o $file.min $file
done

# merge minimized css to one file and delete process files
cd /srv/felizdate/static/3rdcss
cat *.css.min > /srv/felizdate/static/3rdcss/styles.min.css
#rm *_*
