#!/bin/sh
#
# for pg 8.4 & postgis 1.5
#

supervisorctl stop felizdate
su postgres
dropdb felizdate
createdb felizdate
createlang plpgsql felizdate
psql -d felizdate -f /usr/share/postgresql/8.4/contrib/postgis-1.5/postgis.sql
psql -d felizdate -f /usr/share/postgresql/8.4/contrib/postgis-1.5/spatial_ref_sys.sql
# run update scripts
exit
python manage.py syncdb
supervisorctl start felizdate

