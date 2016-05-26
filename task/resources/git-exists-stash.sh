#!/bin/sh

SCRIPT_FULL_PATH="$0"
SCRIPT_HOME="${SCRIPT_FULL_PATH%/*}"
SCRIPT_NAME="${SCRIPT_FULL_PATH##*/}"
SCRIPT_BASE_NAME="${SCRIPT_NAME%%.*}"

SCRIPT_OUT="$(pwd)/process/output/$SCRIPT_BASE_NAME.out"
SCRIPT_ERR="$(pwd)/process/output/$SCRIPT_BASE_NAME.err"

git \
  stash \
  list \
  1> "$SCRIPT_OUT"  \
  2> "$SCRIPT_ERR"

if [ -s "$SCRIPT_OUT" ];
then
  echo "There are stashed changes."
  exit 1
else
  exit 0
fi