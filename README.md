# Restaucity - Guide de restaurants au Congo-Brazzaville

Application web PWA permettant de découvrir les meilleurs restaurants à Brazzaville et au Congo.

## Technologies utilisées

- **Frontend:** Vue.js 3 + Vite
- **Backend:** Supabase (Database, Auth, Storage)
- **Styling:** Tailwind CSS
- **Déploiement:** Vercel

## Installation locale

### 1. Cloner le projet

```bash
git clone https://github.com/VOTRE_USERNAME/restaucity.git
cd restaucity
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copiez le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Remplissez les valeurs dans `.env` :

```env
VITE_SUPABASE_URL=https://ooctjacjhnwznlnyqjar.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Déploiement sur Vercel

### Variables d'environnement à configurer sur Vercel

Dans les paramètres de votre projet Vercel (Settings > Environment Variables), ajoutez :

| Nom de la variable | Description |
|-------------------|-------------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme (anon key) Supabase |

### Paramètres de build

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## Structure du projet

```
src/
├── components/          # Composants Vue réutilisables
├── composables/         # Logique réutilisable (hooks)
├── config/              # Configuration (Supabase)
├── views/               # Pages de l'application
├── firebase/            # Configuration Firebase (legacy)
└── main.js              # Point d'entrée
```

## Sécurité

- Les clés sensibles sont stockées dans des variables d'environnement
- Le fichier `.env` n'est JAMAIS commité (voir `.gitignore`)
- Seul `.env.example` est versionné (sans valeurs sensibles)

## Auteur

**Styve M'BOUMBA**
- Portfolio: [styvefolio.vercel.app](https://styvefolio.vercel.app)
- LinkedIn: [linkedin.com/in/styve-mboumba-49899b31b](https://www.linkedin.com/in/styve-mboumba-49899b31b)
- Email: styvem51@gmail.com

## Licence

© 2025 Styve M'BOUMBA - Tous droits réservés
