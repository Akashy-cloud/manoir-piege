# 🏰 Le Manoir Piégé — Schéma en Direct des Pièces

Application d'accompagnement pour le jeu en réel du **Manoir Piégé** (Loup-Garou avec cartes physiques et débats autour de la table).

---

## 🎯 Le Principe Simple

1. **Le jeu est en réel** : les cartes de rôles sont physiques, distribuées en main propre, et les débats se font en vrai dans la pièce.
2. **Le téléphone sert uniquement de cachette nocturne** : 
   - Chaque joueur scanne le QR code avec son smartphone et entre son prénom.
   - Juste avant que la nuit ne commence, chacun touche sur son téléphone la salle où il dort cette nuit (*Grenier*, *Chambre*, *Salon*, *Salle à Manger*, *Cuisine*).
   - Dès qu'ils valident, **leur pion apparaît en direct sur le grand écran dans la pièce choisie** !
3. **L'animateur lance ensuite la nuit en réel** avec la modélisation sous les yeux.

---

## 🖥️ Ce qui s'affiche sur le Grand Écran

* **Le Schéma Architectural du Manoir** :
  - **Le Grenier** (étage sous les toits)
  - **La Chambre** & **Le Salon** (premier étage)
  - **La Cuisine** & **La Salle à Manger** (rez-de-chaussée)
  - **Dans les couloirs** (les joueurs qui n'ont pas encore validé)
* **Les Compteurs en direct** : ex. `Chambre : 3 joueurs`, `Cuisine : 4 joueurs`, etc.
* **Les Pions des Joueurs** : avec leur prénom et leur avatar (ex. `[🦇 Lucas]`, `[🕯️ Emma]`).
* **Boutons pratiques pour l'animateur** :
  - `🌙 Nouvelle Nuit (Vider les pièces)` : vide les pièces pour relancer un tour la nuit suivante, sans que les jeunes n'aient besoin de se reconnecter.
  - `🔒 Verrouiller les téléphones` : empêche de changer de pièce quand la nuit commence.
  - `👁️ Mode Dévoilement` :
    - *En direct* : les pions apparaissent dès que les jeunes valident.
    - *Suspense* : les pions restent masqués et l'animateur clique pour tout révéler d'un coup !
  - `+ Ajouter un joueur sans téléphone` : pour un enfant qui n'a pas de smartphone, l'animateur saisit juste son prénom et le place à la souris.
  - Clic sur un pion pour le déplacer manuellement si un jeune s'est trompé.

---

## 🚀 Lancer le Jeu

Double-cliquez sur :
```
demarrer_manoir.bat
```
L'écran s'ouvre sur `http://localhost:3000/host.html`. Les jeunes scannent le QR Code et c'est parti !
