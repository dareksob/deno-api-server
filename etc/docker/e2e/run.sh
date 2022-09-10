#!/bin/sh

echo "Execute for $host"
newman run collection.json --env-var host=$host