# Valeur Ajoutee et Differenciation

## Proposition de valeur

> **PointelRH permet a toute entreprise de savoir exactement qui est present, ou, et ce qu'il fait — en temps reel, sans aucun investissement materiel.**

---

## Les 7 differenciateurs cles

### 1. Zero hardware, 100% logiciel

**Le probleme des concurrents :**
Les badgeuses biometriques coutent 500 a 2000 EUR par unite, necessitent une installation technique, une maintenance reguliere, et ne fonctionnent que sur un point fixe.

**Notre approche :**
PointelRH transforme n'importe quel smartphone ou tablette en terminal de pointage intelligent. Un appareil a 50 EUR fait tourner les 3 modes de pointage (QR, PIN, Face ID).

**Impact client :** Economie de 80 a 95% sur le cout initial d'equipement.

---

### 2. Reconnaissance faciale accessible

**Le probleme des concurrents :**
La reconnaissance faciale est reservee aux grandes entreprises avec des cameras dediees ou des abonnements cloud couteux (AWS Rekognition, Azure Face).

**Notre approche :**
PointelRH utilise face-api.js avec des modeles qui tournent **directement dans le navigateur**. Pas de cloud IA externe, pas de cout par scan, pas de dependance a un fournisseur. La camera du telephone suffit.

**Impact client :** Pointage biometrique pour le prix d'un abonnement SaaS standard.

---

### 3. Geofencing natif

**Le probleme des concurrents :**
La plupart des solutions de pointage ne verifient pas ou se trouve l'employe au moment du pointage. Un employe peut pointer de chez lui.

**Notre approche :**
Chaque site est delimite par un perimetre GPS. Le systeme verifie automatiquement la position au moment du pointage. Si l'employe est hors zone, une alerte est declenchee immediatement.

**Impact client :** Fin de la fraude de pointage a distance, surtout pour les entreprises multi-sites.

---

### 4. Plateforme unifiee (pas juste du pointage)

**Le probleme des concurrents :**
- Jibble = pointage + time tracking, mais pas de missions ni de taches
- Skello = planning + taches liees aux shifts, mais pas de pointage biometrique
- Les badgeuses = uniquement du pointage, rien d'autre

**Notre approche :**
PointelRH integre dans une seule plateforme :
- Pointage multi-mode
- Missions terrain
- Taches quotidiennes avec chrono
- Conges
- Plannings
- Notifications automatiques
- Analytics

**Impact client :** Un seul outil remplace 4 a 5 outils separes. Moins de licences, moins de friction, donnees unifiees.

---

### 5. Architecture evenementielle (temps reel)

**Le probleme des concurrents :**
Les solutions classiques fonctionnent en mode "pull" : le manager doit aller chercher l'information. Les alertes sont souvent des emails envoyes en batch.

**Notre approche :**
RabbitMQ propage les evenements instantanement entre les services. Quand un employe pointe en retard, le manager est notifie en quelques secondes. Quand une tache est assignee, l'employe le voit immediatement.

**Impact client :** L'information vient a l'utilisateur, pas l'inverse. Capacite de reaction immediate.

---

### 6. Multi-tenant natif (SaaS-ready)

**Le probleme des concurrents :**
Beaucoup de solutions locales deploient une instance par client (installation sur site), ce qui est couteux et non scalable.

**Notre approche :**
PointelRH est nativement multi-tenant. Un seul deploiement sert des dizaines d'entreprises avec isolation totale des donnees (filtrage par company_id a tous les niveaux). Le super-admin onboarde un nouveau client en 2 minutes.

**Impact client :** Pour nous = marges scalables. Pour le client = pas d'installation, mise en service immediate.

---

### 7. Adapte au contexte africain

**Le probleme des concurrents internationaux :**
- Interfaces en anglais uniquement
- Prix en dollars/euros non adaptes au pouvoir d'achat local
- Support client dans des fuseaux horaires eloignes
- Pas de prise en compte des realites terrain (connectivite, multi-sites informels)

**Notre approche :**
- Interface en francais natif
- Tarification adaptee au marche local
- Fonctionne avec une connexion internet basique
- Concu pour les realites terrain (kiosque offline-ready, PIN pour les employes sans smartphone)

---

## Matrice concurrentielle

| Critere | PointelRH | Badgeuses physiques | Jibble | Skello | BambooHR |
|---------|-----------|-------------------|--------|--------|----------|
| Pointage QR Code | Oui | Non | Oui | Non | Non |
| Pointage PIN/Kiosque | Oui | Oui | Non | Non | Non |
| Reconnaissance faciale | Oui (navigateur) | Oui (camera dediee) | Oui (cloud) | Non | Non |
| Geofencing GPS | Oui | Non | Oui | Non | Non |
| Missions terrain | Oui | Non | Non | Non | Non |
| Taches + chrono | Oui | Non | Oui (basique) | Oui (shift) | Non |
| Conges | Oui | Non | Oui | Oui | Oui |
| Planning | Oui | Non | Non | Oui | Oui |
| Live Monitor | Oui | Non | Non | Non | Non |
| Multi-entreprise SaaS | Oui | Non | Oui | Oui | Oui |
| App Mobile | Oui | Non | Oui | Oui | Oui |
| Investissement materiel | 0 EUR | 500-2000 EUR/unite | 0 EUR | 0 EUR | 0 EUR |
| Adapte Afrique | Oui | Moyen | Non | Non | Non |
| Prix adapte PME locale | Oui | Non | Gratuit (limite) | Eleve | Tres eleve |

---

## ROI pour le client

### Economies directes
- **Fraude de pointage eliminee** : 5 a 15% de masse salariale recuperee
- **Plus de badges a acheter/remplacer** : 0 EUR vs 5-15 EUR/badge
- **Plus de badgeuses** : 0 EUR vs 500-2000 EUR/point d'acces
- **Temps administratif reduit** : 2 a 5 jours/mois economises sur le reporting

### Gains indirects
- **Meilleure ponctualite** : l'effet de controle visible reduit les retards de 30 a 50%
- **Missions mieux suivies** : productivite terrain amelioree
- **Donnees fiables pour la paie** : reduction des litiges employes
- **Image moderne** : attractivite employeur renforcee
