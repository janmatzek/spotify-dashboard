#!/bin/bash
set -e

echo "==================================="
echo "Docker Secrets Initialization"
echo "==================================="
echo ""

# Create secrets directory
SECRETS_DIR="./secrets"
if [ ! -d "$SECRETS_DIR" ]; then
    mkdir -p "$SECRETS_DIR"
    echo "✓ Created secrets directory"
else
    echo "✓ Secrets directory exists"
fi

echo ""
echo "Creating secret files..."
echo ""

# Function to create a secret file
create_secret_file() {
    local secret_name=$1
    local secret_prompt=$2
    local generate_random=${3:-false}
    local secret_file="$SECRETS_DIR/${secret_name}.txt"
    
    # Check if secret file already exists
    if [ -f "$secret_file" ]; then
        echo "⚠ Secret '$secret_name' already exists. Skipping..."
        return
    fi
    
    if [ "$generate_random" = true ]; then
        # Generate random secure password
        local secret_value=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        echo -n "$secret_value" > "$secret_file"
        chmod 600 "$secret_file"
        echo "✓ Created secret '$secret_name' with generated password: $secret_value"
        echo "  SAVE THIS PASSWORD - it won't be shown again!"
    else
        # Prompt user for secret value
        echo -n "$secret_prompt: "
        read -s secret_value
        echo ""
        if [ -z "$secret_value" ]; then
            echo "✗ Error: Empty value provided for '$secret_name'. Skipping..."
            return 1
        fi
        echo -n "$secret_value" > "$secret_file"
        chmod 600 "$secret_file"
        echo "✓ Created secret '$secret_name'"
    fi
}

# Generate random passwords for database and Grafana
echo "--- Generating secure random passwords ---"
create_secret_file "db_password" "" true
create_secret_file "grafana_admin_password" "" true
echo ""

# Prompt for API credentials
echo "--- Spotify API Credentials ---"
echo "Get these from: https://developer.spotify.com/dashboard"
create_secret_file "spotify_client_id" "Enter Spotify Client ID"
create_secret_file "spotify_client_secret" "Enter Spotify Client Secret"
create_secret_file "refresh_token" "Enter Spotify Refresh Token"
echo ""

echo "==================================="
echo "Secrets initialization complete!"
echo "==================================="
echo ""
echo "Secret files created in: $SECRETS_DIR/"
echo "File permissions set to 600 (owner read/write only)"
echo ""
echo "To view created secrets:"
echo "  ls -la $SECRETS_DIR/"
echo ""
echo "To remove a secret (if you need to recreate it):"
echo "  rm $SECRETS_DIR/<secret_name>.txt"
echo ""
echo "Next steps:"
echo "  1. Review your .env file for port configurations"
echo "  2. Start the application with: make prod"
echo "  3. Check logs with: make logs-prod"
echo ""
