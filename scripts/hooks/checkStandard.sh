#!/usr/bin/env bash
#!/bin/bash

# `pre-commit` to ensure all JavaScript files staged for commit pass standard code style.
#
# Based on https://github.com/standard/standard#is-there-a-git-pre-commit-hook
# Tweaked
# - for Mac (where grep does not have the -z / --null-data option),
# - therefor, xargs-r does not work either
# - for .js files instead of .jsx files.

git diff --name-only --cached --relative | grep '\.js$' | xargs -t npx standard
if [[ $? -ne 0 ]]; then
  echo 'JavaScript Standard Style errors were detected. Aborting commit.'
  exit 1
fi
