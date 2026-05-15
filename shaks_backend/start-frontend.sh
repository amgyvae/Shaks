#!/bin/bash
echo "Starting MLS Frontend..."
cd "$(dirname "$0")/frontend"
ng serve --open
