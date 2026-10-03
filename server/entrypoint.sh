#! /bin/sh
set -e

if [ ! -s "/data/jwt_secret" ]; then
  touch /data/jwt_secret
  chmod 600 /data/jwt_secret
  tr -dc 'a-zA-Z0-9' </dev/urandom | fold -w 32 | head -n 1 > /data/jwt_secret
fi

export JWT_SECRET=$(cat /data/jwt_secret)

echo "Initializing application..."

npx prisma migrate deploy

exec "$@"
