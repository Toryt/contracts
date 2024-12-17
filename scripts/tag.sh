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

if [ -z $PIPELINES_BACKPUSH_USERNAME ]; then
    echo "ERROR: \${PIPELINES_BACKPUSH_USERNAME} not set"
    exit 1
fi

if [ -z $PIPELINES_BACKPUSH_APPPW ]; then
    echo "ERROR: \${PIPELINES_BACKPUSH_APPPW} not set"
    exit 1
fi

git remote set-url origin https://${PIPELINES_BACKPUSH_USERNAME}:${PIPELINES_BACKPUSH_APPPW}@bitbucket.org/${BITBUCKET_REPO_OWNER}/${BITBUCKET_REPO_SLUG}.git
# git is now pushable

git tag bitbucket/`printf %05d ${BITBUCKET_BUILD_NUMBER}`
git push origin --tags
