#!/bin/bash

changed_files=$(git diff --name-only HEAD | grep 'docs/data/toolpad/core/.*\.tsx$')

if [ -n "$changed_files" ]
then
  echo "Changes detected in .tsx files. Running 'pnpm docs:typescript:formatted'..."
  pnpm docs:typescript:formatted
else
  echo "No changes detected in .tsx files."
fi