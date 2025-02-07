#!/bin/bash
set -e

echo "Starting container..."

# If your app requires database migrations, uncomment and modify this line:
# npx prisma migrate deploy  # (for Prisma users)
# python manage.py migrate   # (for Django users)
# sequelize db:migrate       # (for Sequelize users)

# Start the application (Modify this based on your app)
exec "$@"
