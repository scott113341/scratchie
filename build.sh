#!/usr/bin/env bash

# all commands must exit 0
set -e

# clean build folder
rm -rf build/
mkdir build/

# compile js
browserify src/index.js --debug -t babelify --outfile build/app.js

# copy other files
cp index.html build/
cp CNAME build/
