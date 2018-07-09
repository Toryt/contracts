#!/usr/bin/env bash

# make clear to everybody that we are in CI
export NODE_ENV="ci"

# output the versions we are using
echo 'node:' `node --version`
echo 'npm:' `npm --version`

# install dependencies; we need to be authenticated with the registry
npm install

# output the situation
echo 'branch:' `git rev-parse --abbrev-ref HEAD`
echo 'tags:' `git name-rev --tags --name-only $(git rev-parse HEAD)`
echo 'sha:' `git rev-parse --verify HEAD`
echo ${NODE_ENV}

# validate
npm run legalReport
npm test
