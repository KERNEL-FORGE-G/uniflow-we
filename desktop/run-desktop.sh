#!/bin/bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

if [ -f "target/uniflow-desktop-1.0.0.jar" ]; then
    echo "Démarrage de UniFlow Desktop (Java 17 + JavaFX + AtlantaFX)..."
    java -jar target/uniflow-desktop-1.0.0.jar "$@"
else
    echo "Compilation et lancement via Maven..."
    mvn clean javafx:run
fi
