# Développement local

Voir le guide complet dans le dépôt de l'API : https://github.com/mbetoulouse-hub/api-chiffrage-asr/blob/main/DEV.md

Résumé pour ce dépôt, avec l'API qui tourne sur `http://localhost:7670` :
```bash
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:7670/api/v1" > .env.local
pnpm install
pnpm dev
```
Application sur `http://localhost:3000`. L'adresse d'API doit se terminer par `/api/v1`.
