#!/usr/bin/env bash

#
#  Copyright 2015–2024 Jan Dockx
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

if [ -z $GITHUB_BACKPUSH_KEY ]; then
    echo "ERROR: \${GITHUB_BACKPUSH_KEY} not set"
    exit 1
fi

git config --global user.email "travis@toryt.org"
git config --global user.name "Travis CI"
git remote set-url origin https://${GITHUB_BACKPUSH_KEY}@github.com/${TRAVIS_REPO_SLUG}.git
# git is now pushable

git tag travis/`printf %05d ${TRAVIS_BUILD_NUMBER}`
git push origin --quiet --tags > /dev/null 2>&1
