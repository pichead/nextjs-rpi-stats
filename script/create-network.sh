#!/bin/sh
NETWORK_NAME="my_custom_network"

# ตรวจสอบว่า network มีอยู่แล้วหรือไม่
if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
  echo "Creating network: $NETWORK_NAME"
  docker network create $NETWORK_NAME
else
  echo "Network $NETWORK_NAME already exists."
fi