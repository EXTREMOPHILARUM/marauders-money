#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Android Release Keystore Creation Script${NC}\n"

# Get keystore details
read -p "Enter keystore password: " STORE_PASSWORD
read -p "Enter key alias (e.g., app name): " KEY_ALIAS
read -p "Enter key password (can be same as keystore password): " KEY_PASSWORD
read -p "Enter your name (CN): " CN
read -p "Enter your organizational unit (OU): " OU
read -p "Enter your organization (O): " O
read -p "Enter your city/locality (L): " L
read -p "Enter your state/province (ST): " ST
read -p "Enter your country code (C, e.g., US): " C

# Create android/app directory if it doesn't exist
mkdir -p android/app

# Generate the keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/app/release.keystore \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$STORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  -dname "CN=$CN, OU=$OU, O=$O, L=$L, ST=$ST, C=$C"

# Check if keystore was created successfully
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}Keystore created successfully at android/app/release.keystore${NC}"
    
    # Create/update .env file
    echo "# Android Release Signing Configuration" > .env
    echo "ANDROID_STORE_PASSWORD=$STORE_PASSWORD" >> .env
    echo "ANDROID_KEY_ALIAS=$KEY_ALIAS" >> .env
    echo "ANDROID_KEY_PASSWORD=$KEY_PASSWORD" >> .env
    
    echo -e "${GREEN}Environment variables written to .env file${NC}"
    echo -e "\n${BLUE}Keep these values safe - you'll need them for future app updates:${NC}"
    echo -e "Keystore password: ${GREEN}$STORE_PASSWORD${NC}"
    echo -e "Key alias: ${GREEN}$KEY_ALIAS${NC}"
    echo -e "Key password: ${GREEN}$KEY_PASSWORD${NC}"
else
    echo -e "\n${RED}Failed to create keystore${NC}"
    exit 1
fi
