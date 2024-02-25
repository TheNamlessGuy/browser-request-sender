#!/bin/bash

if [[ -f './browser-request-sender.zip' ]]; then
  \rm -i './browser-request-sender.zip'
  if [[ -f './browser-request-sender.zip' ]]; then
    echo >&2 'Cannot continue while the old .zip exists'
    exit 1
  fi
fi

echo "Zipping..."
zip -r -q './browser-request-sender.zip' res/ src/ manifest.json