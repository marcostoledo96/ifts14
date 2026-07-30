#!/usr/bin/env bash
set -euo pipefail

if ! grep -q '<meta name="robots" content="noindex,nofollow,noarchive">' apps/frontend-angular/src/index.html; then
  echo "Missing meta robots in index.html"
  exit 1
fi
if ! grep -q '<meta name="referrer" content="no-referrer">' apps/frontend-angular/src/index.html; then
  echo "Missing meta referrer in index.html"
  exit 1
fi

for htaccess in deploy/htaccess deploy/staging/.htaccess-api deploy/staging/.htaccess-root deploy/cpanel/certificados_qa_smoke/.htaccess deploy/cpanel/certificados_qa_smoke/api/.htaccess apps/backend-php/.htaccess; do
  if [ -f "$htaccess" ]; then
    if ! grep -q 'X-Robots-Tag "noindex, nofollow, noarchive"' "$htaccess" && ! grep -q 'X-Robots-Tag' "$htaccess"; then
      echo "Missing X-Robots-Tag in $htaccess"
      exit 1
    fi
    if ! grep -q 'Referrer-Policy "no-referrer"' "$htaccess" && ! grep -q 'Referrer-Policy' "$htaccess"; then
      echo "Missing Referrer-Policy in $htaccess"
      exit 1
    fi
  fi
done

# Deny directo a src|config en htaccess de API (antes de FallbackResource / index.php).
for api_htaccess in apps/backend-php/.htaccess deploy/staging/.htaccess-api deploy/cpanel/certificados_qa_smoke/api/.htaccess; do
  if [ ! -f "$api_htaccess" ]; then
    echo "Missing API htaccess $api_htaccess"
    exit 1
  fi
  if ! grep -qE 'RewriteRule \^\(src\|config\)/' "$api_htaccess"; then
    echo "Missing RewriteRule deny src|config in $api_htaccess"
    exit 1
  fi
  if ! grep -qE 'RewriteRule \^\(src\|config\)/.*\[F' "$api_htaccess"; then
    echo "Missing [F] flag on src|config deny in $api_htaccess"
    exit 1
  fi
done

echo "OK PrivacyHeadersTest"
