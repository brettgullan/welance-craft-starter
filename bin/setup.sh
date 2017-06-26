#!/bin/bash

#
# install the environment:
# - run docker-compose up  
# - starts containers 
#




# read customer number from command line
SCRIPT_HOME=`dirname $0 | while read a; do cd $a && pwd && break; done`
CUSTOMER_NUMBER=''
PROJECT_NUMBER=''
SITE_NAME='Welance'
LOCAL_URL='localhost'
STAGE_URL=''
LOCAL_ENVIRONMENT='.dev'
STAGE_ENVIRONMENT='.net'

echo "Welcome to welance-craft project setup."

echo -n "Please enter the customer number: "
read answer
if echo "$answer" | grep -qe "^[0-9]\+$" ;then
    CUSTOMER_NUMBER=$answer
else
    echo "invalid customer number $answer, aborting"
    exit 1
fi

# read project number from command line
echo -n "Now enter the project number: "
read answer
if echo "$answer" | grep -q "^[0-9]\+$" ;then
    PROJECT_NUMBER=$answer
else
    echo "invalid project number $answer, aborting"
    exit 1
fi

# read site name from command line
echo -n "And the site name: [$SITE_NAME] "
read answer
if echo "$answer" | grep -q "^\w\+" ;then
    SITE_NAME=$answer
fi

# read local url
echo -n "Url for development: [$LOCAL_URL] "
read answer
if echo "$answer" | grep -q "^\w\+" ;then
    LOCAL_URL=$answer
fi

# build stage url from customer/project number
STAGE_URL="$CUSTOMER_NUMBER.$PROJECT_NUMBER.stage.welance.de"
# build project coordinates from customer/project number
PROJECT_COORDINATES="${CUSTOMER_NUMBER}_${PROJECT_NUMBER}"

echo ""
echo "Customer Number: $CUSTOMER_NUMBER"
echo "Project  Number: $PROJECT_NUMBER"
echo "Site Name      : $SITE_NAME"
echo "Local Url      : $LOCAL_URL"
echo "Staging Url    : $STAGE_URL"
echo ""


DOCKER_COMPOSE_FILE='docker-compose.yml'
DOCKER_COMPOSE_TPL_FILE='docker-compose.yml.tpl'

if [ $# -eq 0 ] ;then
    # development environmet
    echo "No arguments supplied"
fi

DC_YAML='docker-compose.yml'
DC_YAML_TEMPLATE='docker-compose.yml.tpl'
DC_YAML_STAGE='docker-compose-staging.yml'
DC_YAML_STAGE_TEMPLATE='docker-compose-staging.yml.tpl'

SCRIPT_LOCAL_PREFIX="local-"
SCRIPT_STAGE_PREFIX="staging-"

echo -n "are this info correct? (YES/NO)? [NO]: "
read confirm
if echo "$confirm" | grep -q "^YES" ;then
    
    # generate docker-compose.yaml for .dev enviroment
    echo "generating $DC_YAML for local environment"
    sed \
    -e "s/%%SITENAME%%/$SITE_NAME/" \
    -e "s/%%SITEURL%%/\/\/$LOCAL_URL/" \
    -e "s/%%SITEENV%%/$LOCAL_ENVIRONMENT/" \
    -e "s/%%PROJECTCOORDS%%/$PROJECT_COORDINATES/" \
    $SCRIPT_HOME/$DC_YAML_TEMPLATE > $SCRIPT_HOME/../docker/$DC_YAML
    
    
    # generate docker-compose-stage.yaml for stage enviromnet
    echo "generating $DC_YAML_STAGE for stage environment"
    sed \
    -e "s/%%SITENAME%%/$SITE_NAME/" \
    -e "s/%%SITEURL%%/\/\/$STAGE_URL/" \
    -e "s/%%SITEHOST%%/$STAGE_URL/" \
    -e "s/%%SITEENV%%/$STAGE_ENVIRONMENT/" \
    -e "s/%%PROJECTCOORDS%%/$PROJECT_COORDINATES/" \
    $SCRIPT_HOME/$DC_YAML_STAGE_TEMPLATE > $SCRIPT_HOME/../docker/$DC_YAML_STAGE
    
    
    echo "generating projects scripts"
    
    # schema export
    printf "%s\n" \
    '#!/bin/sh'   \
    '# autogenerated script, do not edit' \
    "docker exec -it craft_$PROJECT_COORDINATES /data/scripts/schematic-export.sh" \
    > $SCRIPT_HOME/schema-export.sh
    
    # schema import
    printf "%s\n" \
    '#!/bin/sh'   \
    '# autogenerated script, do not edit' \
    "docker exec -it craft_$PROJECT_COORDINATES /data/scripts/schematic-import.sh" \
    > $SCRIPT_HOME/schema-import.sh
    
    # start script
    printf "%s\n" \
    '#!/bin/sh'   \
    '# start docker for specific project'   \
    'SCRIPT_HOME=`dirname $0 | while read a; do cd $a && pwd && break; done`' \
    'cd $SCRIPT_HOME/../docker' \
    "docker-compose --project-name $PROJECT_COORDINATES up -d" \
    > $SCRIPT_HOME/${SCRIPT_LOCAL_PREFIX}start.sh
    
    # start staging script
    printf "%s\n" \
    '#!/bin/sh'   \
    '# start docker for specific project'   \
    'SCRIPT_HOME=`dirname $0 | while read a; do cd $a && pwd && break; done`' \
    'cd $SCRIPT_HOME/../docker' \
    "docker-compose --project-name $PROJECT_COORDINATES --file $DC_YAML_STAGE up -d" \
    > $SCRIPT_HOME/${SCRIPT_STAGE_PREFIX}start.sh
    
    # stop script
    printf "%s\n" \
    '#!/bin/sh'   \
    "# stop docker for specific project"   \
    'SCRIPT_HOME=`dirname $0 | while read a; do cd $a && pwd && break; done`' \
    'cd $SCRIPT_HOME/../docker' \
    "docker-compose --project-name $PROJECT_COORDINATES stop" \
    > $SCRIPT_HOME/${SCRIPT_LOCAL_PREFIX}stop.sh
    
    # stop staging script
    printf "%s\n" \
    '#!/bin/sh'   \
    '# start docker for specific project'   \
    'SCRIPT_HOME=`dirname $0 | while read a; do cd $a && pwd && break; done`' \
    'cd $SCRIPT_HOME/../docker' \
    "docker-compose --project-name $PROJECT_COORDINATES --file $DC_YAML_STAGE stop" \
    > $SCRIPT_HOME/${SCRIPT_STAGE_PREFIX}stop.sh
    
    # teardown script
    printf "%s\n" \
    '#!/bin/bash' \
    '# autogenerated script do not edit' \
    'SCRIPT_HOME=`dirname $0 | while read a; do cd $a && pwd && break; done`' \
    'cd $SCRIPT_HOME/../docker' \
    'echo -n "This action will remove all containers including data, do you want to continue (YES/NO)? [NO] "' \
    'read answer' \
    'if echo "$answer" | grep -q "^YES" ;then' \
    '    echo "removing project and associated data"' \
    "    docker-compose --project-name $PROJECT_COORDINATES down" \
    'else' \
    '    echo "aborting"' \
    'fi' \
    > $SCRIPT_HOME/${SCRIPT_LOCAL_PREFIX}teardown.sh
    
    # teardown script for staging
    printf "%s\n" \
    '#!/bin/bash' \
    '# autogenerated script do not edit' \
    'SCRIPT_HOME=`dirname $0 | while read a; do cd $a && pwd && break; done`' \
    'cd $SCRIPT_HOME/../docker' \
    'echo -n "This action will remove all containers including data, do you want to continue (YES/NO)? [NO] "' \
    'read answer' \
    'if echo "$answer" | grep -q "^YES" ;then' \
    '    echo "removing project and associated data"' \
    "    docker-compose --project-name $PROJECT_COORDINATES --file $DC_YAML_STAGE down" \
    'else' \
    '    echo "aborting"' \
    'fi' \
    > $SCRIPT_HOME/${SCRIPT_STAGE_PREFIX}teardown.sh
    
    # make release script for deploy
    printf "%s\n" \
    '#!/bin/bash' \
    'DATE=`date +%H_%M_%S-%d-%m-%Y`' \
    'MY_PATH="`dirname \"$0\"`"' \
    'if [ "$MY_PATH" == . ] ; then' \
    '# check if release folder is presend and if not create it' \
    'if( test -e ../release ); then' \
    ' :' \
    'else' \
    ' mkdir -p ../release' \
    'fi' \
    '# make file tar' \
    "docker exec craft_$PROJECT_COORDINATES /usr/bin/tar -czf release.tgz --exclude=/data/craft/templates/node_modules --exclude=/data/craft/templates/npm-shrinkwrap.json --exclude=/data/craft/templates/package.json --exclude=/data/craft/templates/README.md --exclude=/data/craft/templates/webpack.config.js /data/craft" \
    '# copy tar out and remove it inside the container' \
    "docker cp craft_$PROJECT_COORDINATES:/release.tgz ../release/release-\"\$DATE\".tgz" \
    "docker exec craft_$PROJECT_COORDINATES rm /release.tgz" \
    '# make mysqldump' \
    "docker exec database_$PROJECT_COORDINATES /usr/bin/mysqldump -u craft --password=craft craft > ../release/release-\"\$DATE\".sql" \
    'else' \
    'if [ "$MY_PATH" == ./bin ] ; then' \
    '# check if release folder is presend and if not create it' \
    'if( test -e release ); then' \
    ' :' \
    'else' \
    ' mkdir -p release' \
    'fi' \
    '# make file tar' \
    "docker exec craft_$PROJECT_COORDINATES /usr/bin/tar -czf release.tgz --exclude=/data/craft/templates/node_modules --exclude=/data/craft/templates/npm-shrinkwrap.json --exclude=/data/craft/templates/package.json --exclude=/data/craft/templates/README.md --exclude=/data/craft/templates/webpack.config.js /data/craft" \
    '# copy tar out and remove it inside the container' \
    "docker cp craft_$PROJECT_COORDINATES:/release.tgz release/release-\"\$DATE\".tgz" \
    "docker exec craft_$PROJECT_COORDINATES rm /release.tgz" \
    '# make mysqldump' \
    "docker exec database_$PROJECT_COORDINATES /usr/bin/mysqldump -u craft --password=craft craft > release/release-\"\$DATE\".sql" \
    'fi' \
    'fi' \
    > $SCRIPT_HOME/make-release.sh

    # change permissions
    chmod +x $SCRIPT_HOME/schema-*.sh $SCRIPT_HOME/${SCRIPT_STAGE_PREFIX}*.sh $SCRIPT_HOME/${SCRIPT_LOCAL_PREFIX}*.sh $SCRIPT_HOME/make-release.sh
    
    # all done 
    echo "crating docker containers"
    cd $SCRIPT_HOME/../docker
    docker-compose --project-name $PROJECT_COORDINATES create
    echo "setup completed"
    echo "use bin/${SCRIPT_LOCAL_PREFIX}start.sh and bin/${SCRIPT_LOCAL_PREFIX}stop.sh script to start/stop containers."
else
    echo "setup canceled, bye!"
fi

