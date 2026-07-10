#! /bin/sh
set -e 

echo "Initializing application..."

npx prisma migrate deploy

exec "$@"