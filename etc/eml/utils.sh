#!/bin/bash

function log {
  type="INFO   "

  case $1 in
  info)
    type="INFO   "
    ;;
  warn)
    type="WARN   "
    ;;
  error)
    type="ERROR  "
    ;;
  esac
  shift;
  echo "$type $@"
}

function info {
  log info $@
}

function warning {
  log warn $@
}

function error {
  log error $@
}

function nbline {
  echo ""
}

function line {
  echo "----------------------"
}


function copyFile() {
    if [ -f $2 ]; then
        if [ "$3" == "ask" ]; then
            ask "File '$2' already exists, should be overwrite this file"
            if [ "$answer" != "y" ]; then
                return
            fi
        elif [ "$3" == "ignore" ]; then
            return 1
        fi
    fi
    
    cp -r $1 $2
}

function helpCommandline {
    command=$1
    description=$2
    printf '%-40.50s | %s\n' "$command" "$description"
}

# throw error
function throw {
    log error $@
    exit 1
}

function fn_exists() {
     [ `type -t $1`"" == 'function' ]
}

# check if variable called $1 and value $2 are set
function require {
  if [ -z $2 ]; then
    throw "$1 not defined";
  fi
}

# to validate arguments
# Example:
# argument "local" $local; arg=$?
#	if [ $arg == 1 ]; then
#		return
#	fi
#
function argument {
  if [ -z $2 ]; then
    warning "$1 not defined";
    return 1;
  fi
}

function setup_alias() {
	command=$2

	## alias/setup tool
	if [ "$TOOLSET_NO_ALIAS" != "1" ] ; then
		eval $command
	fi
}

function question {
  echo "$1?"
  read ANSWER
}

# ask tool to query user a optional execution

# @example basic usage
#  ask "Do want to do this" && { ... }

# @example with force yes option, should be --yes or -y
#  ask "Do want to do this" $forceYes && { ... }
function ask {
	command=$2

	if  [[ "$2" == "-y" || "$2" == "--yes" ]] ; then
		answer="y"
		command=$3
	else
	  echo "";
		echo $1 "? (y/N)"
		read answer
	fi

	if [[ $answer == 'y' || $answer == '1' || $answer == 'Y' || $answer == 'yes' ]] ; then
		eval $command
	else
		false
	fi
}
