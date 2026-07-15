#!/usr/bin/env bash
set -euo pipefail

echo "DISCONTINUED: this legacy smoke used X-Admin-Key over HTTP."
echo "Use the procedural session/CSRF tests in apps/backend-php/tests instead."
echo "A browser-session smoke for deployment remains blocked until PASS DESPLIEGUE."
exit 2
