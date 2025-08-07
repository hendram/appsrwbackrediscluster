#!/bin/bash

mongodump --host localhost --port 27017 --db greenbay --out /home/pinew/backup
cd /home/pinew/backup
zip -r greenbay.zip greenbay
