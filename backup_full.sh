#!/bin/bash

# Create backups directory if it doesn't exist
mkdir -p _backups

# Get current timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Define backup filename
BACKUP_FILE="_backups/full_snapshot_$TIMESTAMP.zip"

echo "📦 Creating full project snapshot to $BACKUP_FILE..."

# Zip entire project while strictly excluding node_modules, git, caches, and live secret files (.env)
zip -r "$BACKUP_FILE" \
    *.html \
    styles.css \
    script.js \
    assets/ \
    images/ \
    resources/ \
    vault/ \
    *.sql \
    *.md \
    hub/src/ \
    hub/package.json \
    hub/vite.config.js \
    hub/.env.example \
    .agent/ \
    -x "node_modules/*" \
    -x "hub/node_modules/*" \
    -x "dist/*" \
    -x "hub/dist/*" \
    -x ".git/*" \
    -x "*.DS_Store" \
    -x "*_backups/*" \
    -x "*.env" \
    -x "*hub/.env" \
    -x "*.env.local"

if [ $? -eq 0 ]; then
    echo "✅ Full snapshot successful! Saved to: $BACKUP_FILE"
else
    echo "❌ Full snapshot failed!"
fi
