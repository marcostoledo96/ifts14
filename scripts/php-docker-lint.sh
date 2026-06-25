#!/usr/bin/env bash
set -euo pipefail

if [[ ! -d apps/backend-php ]]; then
  echo "Run from the repository root: bash scripts/php-docker-lint.sh" >&2
  exit 1
fi

sudo docker run --rm \
  --volume "$PWD/apps/backend-php:/workspace/apps/backend-php:ro" \
  --workdir /workspace \
  ifts14-php84 \
  find apps/backend-php -type f -name '*.php' -exec php -l '{}' +
