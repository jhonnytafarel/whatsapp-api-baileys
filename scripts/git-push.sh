#!/bin/bash
# USAGE: ./scripts/git-push.sh "mensagem do commit"
# Faz commit e push automaticamente usando o token do gh

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 \"commit message\""
  exit 1
fi

TOKEN=$(cat ~/.config/gh/hosts.yml | grep oauth_token | head -1 | awk '{print $2}')
USER=$(gh api user --jq '.login' 2>/dev/null || echo "jhonnytafarel")
REPO=$(basename -s .git $(git remote get-url origin 2>/dev/null))

git add -A
git commit -m "$1"
git push https://${USER}:${TOKEN}@github.com/${USER}/${REPO}.git master
