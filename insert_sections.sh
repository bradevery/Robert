#!/bin/bash

# Script pour insérer les nouvelles sections dans TemplateLayout1.tsx

FILE="src/components/templates/TemplateLayout1.tsx"
NEW_SECTIONS="NEW_SECTIONS_TO_ADD.tsx"
TEMP_FILE="temp_template.tsx"

# Trouver la ligne du "default:" (devrait être ligne 1086)
LINE_NUM=$(grep -n "^      default:" "$FILE" | cut -d: -f1 | head -1)

echo "Insertion des nouvelles sections à la ligne $LINE_NUM..."

# Extraire la partie avant default:
head -n $((LINE_NUM - 1)) "$FILE" > "$TEMP_FILE"

# Ajouter les nouvelles sections (en ignorant les commentaires du début)
tail -n +14 "$NEW_SECTIONS" | head -n -2 >> "$TEMP_FILE"

# Ajouter un saut de ligne
echo "" >> "$TEMP_FILE"

# Ajouter la suite du fichier (à partir de default:)
tail -n +$LINE_NUM "$FILE" >> "$TEMP_FILE"

# Remplacer le fichier original
mv "$TEMP_FILE" "$FILE"

echo "✅ Insertion terminée !"
echo "📝 Nouvelles sections ajoutées: Languages, Technology, Projects, Courses"
