#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f docker/php84/Dockerfile ]]; then
  echo "Run from the repository root: bash scripts/php-docker-version.sh" >&2
  exit 1
fi

sudo docker run --rm ifts14-php84 php -v
