#!/bin/sh

# Wait for the database to be ready
until nc -z db 5432; do
    echo "Waiting for database to be ready..."
    sleep 2
done

# Run migrations
npx prisma migrate deploy 
npx prisma generate

# Start the application
exec npm start