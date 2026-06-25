#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f docker/php84/Dockerfile ]]; then
  echo "Run from the repository root: bash scripts/php-docker-modules-check.sh" >&2
  exit 1
fi

modules="$(sudo docker run --rm ifts14-php84 php -m)"
required=(pdo_mysql openssl mbstring curl zip xml)
missing=0

echo "Installed PHP modules:"
printf '%s\n' "$modules"
echo
echo "Required module check:"

for module in "${required[@]}"; do
  if printf '%s\n' "$modules" | grep -ixq "$module"; then
    printf 'OK %s\n' "$module"
  else
    printf 'MISSING %s\n' "$module" >&2
    missing=1
  fi
done

exit "$missing"
