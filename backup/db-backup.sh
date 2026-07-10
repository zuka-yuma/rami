#! /bin/sh

set -e

export PGPASSWORD=$POSTGRES_PASSWORD

pg_dump -U $POSTGRES_USER -d $POSTGRES_DB -h db  | gzip -c > /app/backup/rami_`date "+%Y%m%d"`.sql.gz
