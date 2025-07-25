#!/bin/bash

# Get all projects with serve target (applications), exclude e2e and container
REMOTES=$(nx show projects --with-target=serve --type=app 2>/dev/null | grep -vE "(container|.*-e2e)" | tr '\n' ',' | sed 's/,$//')

if [ -z "$REMOTES" ]; then
    echo "No micro-frontend projects found. Running container only..."
    nx serve container
else
    echo "Found micro-frontends: $REMOTES"
    echo "Starting container with dev-remotes: $REMOTES"
    nx serve container --dev-remotes="$REMOTES"
fi
