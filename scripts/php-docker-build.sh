#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f docker/php84/Dockerfile || ! -d apps/backend-php ]]; then
  echo "Run from the repository root: bash scripts/php-docker-build.sh" >&2
  exit 1
fi

sudo docker build -t ifts14-php84 -f docker/php84/Dockerfile .
