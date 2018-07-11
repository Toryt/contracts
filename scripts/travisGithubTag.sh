#!/usr/bin/env bash

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
