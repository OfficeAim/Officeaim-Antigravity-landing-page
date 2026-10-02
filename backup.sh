#!/bin/bash

# Create backups directory if it doesn't exist
mkdir -p _backups

# Get current timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Define backup filename
BACKUP_FILE="_backups/hub_src_$TIMESTAMP.zip"

# Zip the source folder safely (excluding sensitive credentials)
echo "📦 Backing up /hub/src to $BACKUP_FILE..."
zip -r "$BACKUP_FILE" hub/src hub/package.json hub/vite.config.js hub/.env.example -x "*.DS_Store"

# Check if zip succeeded
if [ $? -eq 0 ]; then
    echo "✅ Backup successful (credentials protected)! Saved to: $BACKUP_FILE"
else
    echo "❌ Backup failed!"
fi
