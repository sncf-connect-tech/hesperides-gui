#!/usr/bin/env bash

set -x
dir="$(dirname $0)"
cwd=$(cd $dir; pwd)
VERSION=1.0.0
GROUP=com.vsct.dt
ARTIFACT=hesperides
REPO=dt-releases
curl -o $cwd/app.jar -J -L http://nexus/service/local/artifact/maven/redirect?r=$REPO\&g=$GROUP\&a=$ARTIFACT\&v=$VERSION\&p=jar
 
  
VERSION=1.0.2
GROUP=com.vsct.dt
ARTIFACT=hesperides-gui
REPO=dt-releases
curl -o $cwd/hesperides.zip -J -L http://nexus/service/local/artifact/maven/redirect?r=$REPO\&g=$GROUP\&a=$ARTIFACT\&v=$VERSION\&p=zip
 
unzip -q $cwd/hesperides.zip -d $cwd
mv $cwd/hesperides-gui-$VERSION $cwd/hesperides-gui
rm -f $cwd/hesperides.zip
