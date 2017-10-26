###############################################################################
# Display info in green
#
display_info () {
  echo -e "+\e[32m" $1 "\e[0m" 
}

###############################################################################
# Download somthing from Nexus repository
# 
# $1 : artifact group
# $2 : artifact name
# $3 : artifact version
# $4 : artifact packaging
# $5 : filename output
#
download_nexus () {
  dir="$(dirname $0)"
  cwd=$(cd $dir; pwd)
  
  GROUP=$1
  ARTIFACT=$2
  VERSION=$3
  PACKAGING=$4
  OUTPUT=$5
  
  REPO=dt-releases
  
  display_info "Download ${GROUP}:${ARTIFACT}:${VERSION}:${PACKAGING} to ${OUTPUT}"
  
  curl -o $cwd/$OUTPUT -J -L http://nexus/service/local/artifact/maven/redirect?r=$REPO\&g=$GROUP\&a=$ARTIFACT\&v=$VERSION\&p=$PACKAGING
}

if [ $# -ne 2 ];
then
  echo "To run this script, you must provide version of hesperides back and front."
  echo ${0##*/} "<back_version> <front_version>"
else
  BACK_VERSION=$1
  FRONT_VERSION=$2
  
  FRONT_ARTIFACT="hesperides-gui"
  FRONT_OUTPUT="hesperides.zip"
  
  download_nexus "com.vsct.dt" "hesperides" $BACK_VERSION "jar" "app.jar"
  download_nexus "com.vsct.dt" $FRONT_ARTIFACT $FRONT_VERSION "zip" $FRONT_OUTPUT
  
  display_info "Extract front archive..."
  unzip -q $cwd/$FRONT_OUTPUT -d $cwd
  
  display_info "Rename extract folder of front archive"
  mv $cwd/$FRONT_ARTIFACT-$FRONT_VERSION $cwd/$FRONT_ARTIFACT
  
  display_info "Remove front archive"
  rm -f $cwd/$FRONT_OUTPUT
fi
