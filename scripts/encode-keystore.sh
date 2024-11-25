#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

KEYSTORE_PATH="android/app/release.keystore"

if [ ! -f "$KEYSTORE_PATH" ]; then
    echo -e "${RED}Error: Keystore file not found at $KEYSTORE_PATH${NC}"
    echo -e "Please run 'npm run android:create-keystore' first to create the keystore."
    exit 1
fi

echo -e "${BLUE}Encoding keystore for GitHub Secrets...${NC}"
ENCODED_KEYSTORE=$(base64 -i "$KEYSTORE_PATH")

echo -e "\n${GREEN}Add the following secrets to your GitHub repository:${NC}"
echo -e "\n${BLUE}RELEASE_KEYSTORE:${NC}"
echo "$ENCODED_KEYSTORE"

if [ -f ".env" ]; then
    echo -e "\n${BLUE}Other required secrets from .env:${NC}"
    echo -e "ANDROID_STORE_PASSWORD: $(grep ANDROID_STORE_PASSWORD .env | cut -d '=' -f2)"
    echo -e "ANDROID_KEY_ALIAS: $(grep ANDROID_KEY_ALIAS .env | cut -d '=' -f2)"
    echo -e "ANDROID_KEY_PASSWORD: $(grep ANDROID_KEY_PASSWORD .env | cut -d '=' -f2)"
else
    echo -e "\n${RED}Warning: .env file not found. Make sure to set up your signing configuration.${NC}"
fi

echo -e "\n${BLUE}Add these secrets in your GitHub repository:${NC}"
echo "1. Go to your repository settings"
echo "2. Navigate to Secrets and Variables > Actions"
echo "3. Add the above values as repository secrets"
