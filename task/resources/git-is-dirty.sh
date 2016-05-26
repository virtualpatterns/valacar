#!/bin/sh

SCRIPT_FULL_PATH="$0"
SCRIPT_HOME="${SCRIPT_FULL_PATH%/*}"
SCRIPT_NAME="${SCRIPT_FULL_PATH##*/}"
SCRIPT_BASE_NAME="${SCRIPT_NAME%%.*}"

SCRIPT_OUT="$(pwd)/process/output/$SCRIPT_BASE_NAME.out"
SCRIPT_ERR="$(pwd)/process/output/$SCRIPT_BASE_NAME.err"

git \
  status \
  --porcelain \
  1> "$SCRIPT_OUT"  \
  2> "$SCRIPT_ERR"

if [ -s "$SCRIPT_OUT" ];
then
  echo "There are changes not staged for commit or changes to be committed."
  exit 1
else
  echo "There is nothing to commit, the working directory clean."
  exit 0
fi