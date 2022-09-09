#!/bin/bash

EML_COMMAND_PREFIX="d"

# depricated, use eml __doc
function eml_doc() {
    command=$1
    description=$2
    doc=$(printf '%-46.50s | %s\n' "$EML_COMMAND_PREFIX $command" "$description")
    EML_DOC="$EML_DOC
$doc"
}

function eml_has_changed() {
    state=$(git status | grep "Changes")

    if [ "$state" != "" ]; then
        return 0;
    fi

    return 1;
}

function eml_read_package() {
    if [ -f $1 ]; then
        PACKAGE_VERSION=$(cat $1 |
            grep version |
            head -1 |
            awk -F: '{ print $2 }' |
            sed 's/[",]//g')
    fi
}

function eml() {
    local EML_PATH="./.eml"
    local EML_ROOT="etc/eml"
    local EML_PLUGINS="$EML_ROOT/plugin"
    local EML_VERSION=$( cat $EML_ROOT/version )
    local EML_PROJECT_CONFIGS="$EML_PATH/projects"

    local TEMPLATE_PATH="$EML_ROOT/templates"
    local PROJECTS_PATH="projects"
    local SCRIPT_PATH=$(readlink -f "$0")
    local SCRIPT_DIR=$(dirname "$SCRIPT_PATH")
    local MASTER_BRANCH=main

    local cmd="$1"
    local rootDir=$PWD

    function error() {
        echo "ERROR ${@}"
    }

    function info() {
        echo "INFO  ${@}"
    }

    function invalid() {
        if [[ "$1" == "" ]]; then
            if [[ "$2" == "" ]]; then
                error "Missing value"
            else
                error ${@:2}
            fi
            return 1
        fi
    }

    function each() {
        command=$1

        rootDir=$PWD
        for projectPath in $PROJECTS_PATH/*; do
            cd $projectPath
            projectName=${PWD##*/}
            eval $command
            cd $rootDir
        done
    }

    function invalidProject() {
        if [ ! -d $PROJECTS_PATH/$projectName ]; then
            error "Project with name $projectName not exists"
            return 0
        fi
        return 1
    }

    function readProjectName() {
        if [ -z $1 ]; then
            echo "Set project name:"
            read projectName
        else
            projectName=$1
        fi

        projectPath=$PROJECTS_PATH/$projectName
        projectConfig=$EML_PROJECT_CONFIGS/$projectName.env

        if [ ! -d $projectPath ]; then
            return 1
        fi
        return 0
    }

    function readTemplate() {
        if [ -z $1 ]; then
            echo "Which template do you want to use?"
            ls $rootDir/$TEMPLATE_PATH
            read templateName
        else
            templateName=$1
        fi

        templatePath=$rootDir/$TEMPLATE_PATH/$templateName
        if [ ! -d $templatePath ]; then
            error "Template by name $templateName not exists"
            return 1
        fi

        return 0

    }

    function begin() {
        if [ -d $projectPath ]; then
            cd $projectPath
            projectName=${PWD##*/}
            projectConfig=$EML_PROJECT_CONFIGS/$projectName.env
        fi
    }

    function end() {
        cd $rootDir
    }

    function header() {
        title="$1"
        if [ "$title" == "" ]; then
            title=$projectName
        fi
        echo "--- $title ---"
    }

    function updateSubprojects() {
        end

        # create list of projects
        projects=$(ls -A $PROJECTS_PATH)
        setEmlEnv EML_SUBPROJECTS "$projects" stringArray

        if [ ! -d $EML_PROJECT_CONFIGS ]; then
            mkdir -p $EML_PROJECT_CONFIGS
        fi

        for projectName in $projects; do
            projectPath=$PROJECTS_PATH/$projectName
            begin
            remoteUrl=$(git config --get remote.origin.url)
            end

            if [ -f $projectConfig ]; then
                rm $projectConfig
            fi

            touch $projectConfig
            echo "projectName=\"$projectName\"" >>$projectConfig
            echo "projectPath=\"$projectPath\"" >>$projectConfig
            echo "remoteUrl=\"$remoteUrl\"" >>$projectConfig
        done

    }

    function setEmlEnv() {
        if [ ! -d $EML_PATH ]; then
            mkdir -p $EML_PATH
        fi

        name=$1
        value=$2
        target=$EML_PATH/$name.env

        case "$3" in
        stringArray)
            value="(${value//[$'\t\r\n ']/ })"
            ;;
        *)
            value="\"$value\""
            ;;
        esac

        echo "$name=$value" >$target
    }

    function readEmlEnv() {
        for envFile in $EML_PATH/*.env; do
            source $envFile
        done
    }

    function readEmlSubproject() {
        readProjectName $1
        begin

        if [ -f $projectConfig ]; then
            source $projectConfig
        fi

        end
    }

    function isEmlReady() {
        if [ -f $EML_PATH/version ]; then
            return 1
        fi
    }

    function isGitReady() {
        if [ -f .git/config ]; then
            return 1
        fi
    }

    function isChanges() {
        local state=$(git status | grep "Changes")
        [ "$state" != "" ]
    }

    function branchName() {
        local _name=$(git rev-parse --abbrev-ref HEAD)
        echo $_name
    }

    if [ "$dockerFile" == "" ]; then
        error "Docker composer file not defined. Please set a dockerFile variable!"
        cmd="?"
    fi

    # for plugins
    case $cmd in
    __info)
        ## NOT WORL
        info ${@:2}
        return 1
        ;;

    __error)
        error ${@:2}
        return 1
        ;;

    __invalid)
        invalid ${@:2}
        return 1
        ;;
    esac

    case $cmd in
    init)
        if [ isEmlReady == 0 ]; then
            echo "Create eml root folder"
            mkdir $EML_PATH
        fi

        if [ ! -d $PROJECTS_PATH ]; then
            echo "Create project root directory"
            mkdir $PROJECTS_PATH
        fi

        if [ isGitReady == 0 ]; then
            echo "Set remote git repository for root:"
            read rootGit

            if [ -z $rootGit ]; then
                error "Root git url require to continue"
                return
            fi

            git init
            git remote add origin $rootGit
            git add .
            git commit -m "Eml initial commit"
            git push -u origin $MASTER_BRANCH
        fi

        readEmlEnv

        if [ "$EML_SUBPROJECTS" != "" ]; then
            for projectName in "${EML_SUBPROJECTS[@]}"; do
                readEmlSubproject $projectName

                if [ -d $projectPath ]; then
                    echo "- Project $projectName looks fine."
                else
                    echo "- Project $projectName not exists, do you want to clone? y/N"
                    read ask
                    if [ $ask == "y" ]; then
                        git clone $remoteUrl $projectPath
                    fi
                fi
            done
        fi

        updateSubprojects

        echo ""
        echo "Yeah, ready to use eml for your project"
        echo "- use 'add' method to add new subproject to your env"

        ;;

    update-projects)
        echo "Update eml configuration for all subprojects"
        updateSubprojects
        ;;

    add)
        # add new submodule as project
        readProjectName $2

        if [ -z $3 ]; then
            echo "Set remote url (git):"
            read gitUrl
        else
            gitUrl=$3
        fi

        targetPath=$PROJECTS_PATH/$projectName
        git clone $gitUrl $targetPath
        cd $targetPath

        if [ ! -f README.md ]; then
            echo "Empty project detected, create core setup"
            touch README.md
            git add README.md
            git commit -m "Init empty sub project with eml"
            git push -u origin $MASTER_BRANCH
        fi

        updateSubprojects
        ;;

    status | stat | s)
        echo "Display all changes"
        local name=$(branchName)

        ## root projects
        if isChanges; then
            echo "- ! Root project has updates ($name)"
        else
            echo "- Root project clean ($name)"
        fi

        for projectPath in $PROJECTS_PATH/*; do
            begin
            local name=$(branchName)

            if isChanges; then
                echo "- ! Project $projectName has updates ($name)"
            else
                echo "- Project $projectName clean ($name)"
            fi

            end
        done

        ;;

    dockerize | doc)
        if ! readProjectName $2; then
            invalidProject
            return
        fi

        begin
        header

        if ! readTemplate $3; then
            return
        fi

        targetPath=etc/docker
        steps=3

        echo "1/$steps Create structure, $targetPath"
        mkdir -p $targetPath

        echo "2/$steps Copy template files (if not exists)"
        cp -n $templatePath/* $targetPath

        echo "3/$steps Replace template placeholder"
        sed -i "s/%service_name%/$projectName/" $targetPath/dev.Dockerfile

        echo "Project dockerized"

        end
        ;;

    projects)
        for projectPath in $PROJECTS_PATH/*; do
            begin
            header
            end
        done
        ;;

    sh | enter)
        container=$2
        shell=sh
        user=root

        if [ "$3" == "bash" ]; then
            shell=bash
        fi

        if [ ! -z $4 ]; then
            user="$4"
        fi

        docker compose -f $dockerFile exec --user=$user $container $shell
        ;;

    pull | p)
        echo "Pull all latest updates from remote service"

        header "root project"
        git pull
        git fetch -a

        for projectPath in $PROJECTS_PATH/*; do
            begin
            header
            git pull
            git fetch -a
            end
        done
        ;;

    commit | c)
        echo "Commit all project updates"

        if [ -z $2 ]; then
            echo "Set commit message:"
            read msg
        else
            msg=${@:2}
        fi

        commited=false

        function pushMessage() {
            header
            git pull
            git add --all
            git commit -am "$msg"
            git push
            commited=true
        }

        # for root
        if isChanges; then
            pushMessage
        fi

        for projectPath in $PROJECTS_PATH/*; do
            begin
            if isChanges; then
                pushMessage
            fi
            end
        done

        if [ $commited == true ]; then
            echo "Projects commited"
        else
            echo "No project found with changes"
        fi
        ;;

    each | e)
        for projectPath in $PROJECTS_PATH/*; do
            begin
            header
            eval ${@:2}
            end
        done
        ;;

    only)
        projectName="$2"
        invalid $projectName

        if ! readProjectName $2; then
            invalidProject
            return
        else
            begin
            header
            eval ${@:3}
            end
        fi

        ;;

    create-plugin)
        echo "Wizard to create a plugin for eml"
        echo "Set a name:"
        read name

        target=$pluginPath/$name.sh

        if [ -f $target ]; then
            error "Plugin $name already exists"
            return
        fi

        echo "Describe it:"
        read desc

        echo "Should I create an alias:"
        read aliasName

        if [ ! -d $pluginPath ]; then
            mkdir -p $pluginPath
        fi

        target=$pluginPath/$name.sh
        emlCmd="eml-extend-$name"

        cmd="$name"

        if [ "$aliasName" != "" ]; then
            aliasTarget=$pluginPath/$aliasName.sh

            if [ -f $aliasTarget ]; then
                echo "Cannot create alias plugin exists by this name"
                cmd="$name"
            else
                echo "#alias of $name" > $aliasTarget
                echo "function eml-extend-$aliasName() {" >> $aliasTarget
                echo " $emlCmd \${@}" >> $aliasTarget
                echo "}" >> $aliasTarget

            fi
        fi

        echo "eml_doc \"$cmd\" \"$desc\"" > $target
        echo "function $emlCmd() {" >> $target
        echo " echo \"your plugin $cmd: $desc\"" >> $target
        echo "}" >> $target

        echo "Plugin base created $target"

        ;;

    dev)
        docker-compose -f $dockerFile up -d --remove-orphans

        if [ "$2" == "f" ]; then
            docker-compose -f $dockerFile logs -f
        fi
        ;;

    "?" | "")
        function __hc() {
            command=$1
            description=$2
            printf '%-46.50s | %s\n' "$command" "$description"
        }
        echo "Help for EML v$EML_VERSION"
        echo "use docker-compose as default command line tool"
        echo ""
        echo "list of default commands:"
        echo ""
        __hc "d init" "init root project and subprojects to use it with eml"
        __hc "d update-projects" "Update eml configuration for all subprojects"
        __hc "d add [name] [giturl]" "add new project with"
        __hc "d [status | stat | s]" "Display all changes"
        __hc "d [dockerize | doc] [project] [template]" "create docker setup for project by using a template"
        __hc "d projects" "display a list of all subprojects"
        __hc "d [sh | enter] [SERVICE] ?[sh | bash] ?[USER]" "enter container as user(root)"
        __hc "d [pull | p]" "pull all projects"
        __hc "d [status | stat | s]" "Display repository status for all projects and root"
        __hc "d [commit | c] [msg?]" "commit source to git"
        __hc "d [each | e] [*]" "execute command for each project"
        __hc "d [only] [name] [*]" "execute command only for project"
        __hc "d dev" "start all projects for developer"
        __hc "d create-plugin" "Start the plugin wizard to extend eml functionality"
        __hc "d ?" "display this help lines ;-)"
        __hc "d *" "all supported command of docker compose"

        if [ "$EML_DOC" != "" ]; then
            echo ""
            echo "extend commands:"
            echo "$EML_DOC"
        fi
        ;;
    ## default pass to docker compoase
    *)
        docker-compose -f $dockerFile $@
        ;;
    esac
}
