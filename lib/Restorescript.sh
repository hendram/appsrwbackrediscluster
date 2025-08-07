#!/bin/bash

cd /home/pinew/backup
unzip greenbay.zip
mongorestore --host localhost --port 27017 --db greenbay /home/pinew/backup/greenbay
