#!/usr/bin/env bash
npm run build
zip -r build.zip package.json node_modules front dist Dockerfile -x front/lib/semantic/node_modules/**\*
