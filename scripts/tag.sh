#!/usr/bin/env bash

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

git tag build/${BITBUCKET_BUILD_NUMBER}
git push origin --tags
