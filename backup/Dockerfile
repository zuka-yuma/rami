FROM alpine:latest

RUN apk update && apk add bash postgresql-client

RUN adduser -D backup

COPY crontab /etc/crontabs/backup

RUN mkdir -p /app/backup && chown backup:backup /app/backup
RUN chmod 0644 /etc/crontabs/backup && chown backup:backup /etc/crontabs/backup && crontab -u backup /etc/crontabs/backup

COPY db-backup.sh /app/cron/db-backup.sh
RUN chmod +x /app/cron/db-backup.sh && chown backup:backup /app/cron/db-backup.sh

CMD ["crond", "-f"]