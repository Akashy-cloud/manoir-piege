// ========================================================
// 📜 MODAL OFFICIELLE : RÈGLES DU JEU & DÉTAIL DES CARTES
// "Le Manoir Piégé" — 15 Joueurs & Cartes Illustrées
// ========================================================

(function () {
  const CARDS_DATA = [
    // 🐺 LES MONSTRES
    {
      id: 'monstres',
      name: 'Les Monstres',
      fullTitle: 'Les Monstres (Vampires / Loups-Garous)',
      count: '3 Cartes',
      avatar: '🐺',
      camp: 'monstres',
      campLabel: 'Monstres',
      image: '/Images/Cartes/Les%20monstres.jpg',
      power: "Agissez dans la même pièce la nuit pour éliminer les villageois.",
      tip: "Coordonnez discrètement vos choix de pièces. RÈGLE CAPITALE : vous devez être AU MOINS DEUX dans la même pièce que votre cible pour pouvoir attaquer !",
      rulesDetail: "Se réveillent chaque nuit ensemble. S'il n'y a qu'un seul monstre isolé dans une pièce avec des villageois, il est inoffensif et ne peut pas attaquer."
    },

    // 🛡️ LES RÔLES SPÉCIAUX DU VILLAGE
    {
      id: 'voyante',
      name: 'La Voyante',
      fullTitle: 'La Voyante',
      count: '1 Carte',
      avatar: '🔮',
      camp: 'village',
      campLabel: 'Village',
      image: '/Images/Cartes/La%20voyante.jpg',
      power: "Découvre secrètement l'identité d'un joueur chaque nuit.",
      tip: "Partagez vos visions pendant les débats sans trop attirer l'attention des monstres sur vous.",
      rulesDetail: "Chaque nuit, l'animateur lui révèle discrètement la véritable carte et l'identité secrète d'un joueur de son choix."
    },
    {
      id: 'sorciere',
      name: 'La Sorcière',
      fullTitle: 'La Sorcière',
      count: '1 Carte',
      avatar: '🧪',
      camp: 'village',
      campLabel: 'Village',
      image: '/Images/Cartes/La%20sorci%C3%A8re.jpg',
      power: "Possède 1 Potion de Vie (ressuscite le mort) et 1 Potion de Mort (élimine un suspect).",
      tip: "Vous pouvez utiliser les deux fioles au cours de la même nuit si la situation l'exige.",
      rulesDetail: "L'animateur lui indique la victime des monstres. Elle décide d'utiliser sa Potion de Vie (pouce levé) et/ou sa Potion de Mort (désigne un suspect)."
    },
    {
      id: 'chasseur',
      name: 'Le Chasseur',
      fullTitle: 'Le Chasseur',
      count: '1 Carte',
      avatar: '🏹',
      camp: 'village',
      campLabel: 'Village',
      image: '/Images/Cartes/Le%20chasseur.jpg',
      power: "S'il est éliminé, il peut emmener quelqu'un d'autre dans sa tombe.",
      tip: "Vise juste même au bord du gouffre !",
      rulesDetail: "Dès son élimination (nuit ou vote du village), il tire un ultime coup de fusil avant d'expirer pour abattre le suspect de son choix."
    },
    {
      id: 'salvateur',
      name: 'Le Salvateur',
      fullTitle: 'Le Salvateur',
      count: '1 Carte',
      avatar: '🛡️',
      camp: 'village',
      campLabel: 'Village',
      image: '/Images/Cartes/Le%20salvateur.jpg',
      power: "Protège chaque nuit un joueur de son choix contre l'attaque des monstres.",
      tip: "Ne peut pas protéger la même personne deux nuits de suite (peut se protéger lui-même).",
      rulesDetail: "Désigne chaque nuit un habitant à immuniser. Si les monstres frappent cette personne, l'attaque échoue et personne ne meurt."
    },
    {
      id: 'petite_fille',
      name: 'La Petite Fille',
      fullTitle: 'La Petite Fille',
      count: '1 Carte',
      avatar: '👧',
      camp: 'village',
      campLabel: 'Village',
      image: '/Images/Cartes/La%20petite%20fille.jpg',
      power: "Peut entrouvrir discrètement les yeux la nuit pour observer les déplacements des monstres.",
      tip: "Discrétion absolue : si les monstres la surprennent, elle est immédiatement tuée !",
      rulesDetail: "Elle a le droit d'épier les monstres pendant leur réveil, mais sans faire le moindre bruit ou mouvement brusque."
    },
    {
      id: 'fossoyeur',
      name: 'Le Fossoyeur',
      fullTitle: 'Le Fossoyeur (Rôle Custom Manoir)',
      count: '1 Carte',
      avatar: '⚰️',
      camp: 'village',
      campLabel: 'Village',
      image: '/Images/Cartes/Le%20fossoyeur.jpg',
      power: "Chaque nuit, il peut fouiller le cimetière et utiliser lui-même le pouvoir d'un rôle villageois mort.",
      tip: "Règle de l'Âme Épuisée : impossible de canaliser la même âme 2 nuits de suite !",
      rulesDetail: "Chaque nuit, il choisit un défunt du village et active immédiatement son pouvoir (voyance, protection, corbeau...). Garde-fous : jamais la même âme 2 nuits de suite, potions restantes uniquement pour la Sorcière, et fusil du Chasseur non réactivable."
    },
    {
      id: 'corbeau',
      name: 'Le Corbeau',
      fullTitle: 'Le Corbeau',
      count: '1 Carte',
      avatar: '🐦',
      camp: 'village',
      campLabel: 'Village',
      image: '/Images/Cartes/Le%20corbeau.jpg',
      power: "Désigne secrètement un suspect qui débutera le vote de jour avec 2 voix d'office.",
      tip: "Accablez les menteurs et orientez le débat dès le réveil du village.",
      rulesDetail: "Chaque nuit, dépose anonymement un corbeau sur la porte d'un suspect, lui attribuant automatiquement deux voix de pénalité au conseil."
    },
    {
      id: 'bouc_emissaire',
      name: 'Le Bouc Émissaire',
      fullTitle: 'Le Bouc Émissaire',
      count: '1 Carte',
      avatar: '🐐',
      camp: 'village',
      campLabel: 'Village',
      image: '/Images/Cartes/Le%20bouc%20emissaire.jpg',
      power: "S'il y a égalité lors d'un vote, c'est lui qui est éliminé d'office.",
      tip: "Fais-toi oublier ou manipule les votes pour éviter le bûcher !",
      rulesDetail: "En cas d'ex æquo lors du vote du village, le conseil n'épargne personne : le bouc émissaire est exécuté sur-le-champ."
    },

    // 💣 ÉLECTRON LIBRE & NEUTRES
    {
      id: 'pyromane',
      name: 'Le Pyromane',
      fullTitle: 'Le Pyromane (Rôle Custom Manoir)',
      count: '1 Carte',
      avatar: '💣',
      camp: 'neutre',
      campLabel: 'Électron libre',
      image: '/Images/Cartes/Le%20pyromane.jpg',
      power: "Peut placer de l'essence et faire exploser une pièce tous les 2 tours.",
      tip: "Pulvérise monstres comme innocents et condamne définitivement la pièce !",
      rulesDetail: "Tous les 2 tours, piége une pièce du Manoir. À l'aube, la salle explose : tous les dormeurs sont éliminés et la pièce devient inaccessible."
    },
    {
      id: 'cupidon',
      name: 'Cupidon',
      fullTitle: 'Cupidon',
      count: '1 Carte',
      avatar: '💘',
      camp: 'neutre',
      campLabel: 'Indépendant',
      image: '/Images/Cartes/Cupidon.jpg',
      power: "Désigne deux joueurs qui deviennent amoureux. Si les deux meurent, il peut en redésigner deux autres.",
      tip: "Unis le bon couple pour chambouler la partie !",
      rulesDetail: "Lie deux destins : si l'un d'eux meurt (de nuit ou par le vote), l'autre meurt immédiatement de chagrin à ses côtés."
    },
    {
      id: 'voleur',
      name: 'Le Voleur',
      fullTitle: 'Le Voleur',
      count: '1 Carte',
      avatar: '🎭',
      camp: 'neutre',
      campLabel: 'Neutre',
      image: '/Images/Cartes/Le%20voleur.jpg',
      power: "Peut échanger secrètement sa carte de rôle avec un autre joueur, une seule fois.",
      tip: "Vols le bon rôle au bon moment pour semer la confusion !",
      rulesDetail: "Peut dérober la carte d'un joueur endormi la première nuit et changer d'allégeance en cours de partie."
    },

    // 🧹 LE PERSONNEL DU MANOIR
    {
      id: 'villageois',
      name: 'Les Villageois',
      fullTitle: 'Les Villageois (Personnel du Manoir)',
      count: '3 Cartes',
      avatar: '👥',
      camp: 'personnel',
      campLabel: 'Personnel & Village',
      image: '/Images/Cartes/Les%20villageois.jpg',
      power: "Rôle de base sans pouvoir actif. C'est le nombre et la déduction qui font la force.",
      tip: "Observe, discute, et vote avec sagesse pour démasquer les monstres !",
      rulesDetail: "Comprend le Majordome, la Cuisinière et le Jardinier. Pas de pouvoirs nocturnes, mais leur vote pèse tout autant !"
    },

    // 👻 POUVOIRS DES MORTS
    {
      id: 'spectres',
      name: 'Les Spectres',
      fullTitle: 'Les Spectres (Pouvoirs des Morts)',
      count: 'Tous les éliminés',
      avatar: '👻',
      camp: 'spectre',
      campLabel: 'Au-delà',
      image: null,
      power: "Salon secret des Spectres (chat privé) & Apparitions spectrales sur l'écran TV (emojis anonymes).",
      tip: "Même éliminé, continuez de vous amuser et d'échanger entre défunts dans votre salon privé !",
      rulesDetail: "Les éliminés disposent d'un salon de discussion secret réservé aux défunts et peuvent projeter des emojis hantés anonymes sur l'écran TV."
    }
  ];

  window.MANOIR_CARDS_DATA = CARDS_DATA;

  let currentCardIndex = 0;
  let isTvStreaming = false;
  let currentActiveTab = 'roles';

  function checkIfHost() {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.includes('host') ||
      document.querySelector('.host-body') !== null ||
      document.body?.classList.contains('host-body');
  }

  function createModalHtml() {
    return `
    <!-- MODALE GLOBALE DES RÈGLES & CARTES -->
    <div id="modal-rules" class="modal-overlay" style="display: none; z-index: 99990;">
      <div class="rules-modal-content">
        
        <!-- En-tête compact et tactile avec bouton fermeture proéminent garanti visible -->
        <div class="rules-modal-header">
          <div class="rules-modal-title-group">
            <span style="font-size: 1.5rem; flex-shrink: 0;">🏰</span>
            <div class="rules-header-text">
              <h3 class="rules-header-h3">Règles & 13 Cartes</h3>
              <span class="rules-header-subtitle">Le Manoir Piégé &bull; Rôles Illustrés</span>
            </div>
          </div>
          <button id="btn-close-rules" type="button" class="btn-close-modal-prominent" title="Fermer les règles (Échap)">✕</button>
        </div>

        <!-- Onglets Navigation Segmentés -->
        <div class="rules-tabs-nav">
          <button class="rules-tab-btn active" data-tab="tab-roles">
            <span>🃏</span> <span>Cartes (13)</span>
          </button>
          <button class="rules-tab-btn" data-tab="tab-regles">
            <span>📜</span> <span>Règles</span>
          </button>
          <button class="rules-tab-btn" data-tab="tab-appel">
            <span>🌙</span> <span>Ordre d'Appel</span>
          </button>
        </div>

        <!-- Corps de la modale scrollable -->
        <div class="rules-modal-body">
          
          <!-- ONGLET 1 : DÉTAIL DES 13 CARTES (ILLUSTRÉES) -->
          <div id="tab-roles" class="rules-tab-pane active">
            
            <!-- Barre d'outils mobile : Sélecteur direct de rôle + Diaporama + Diffusion TV -->
            <div class="rules-quick-access-bar">
              <div class="quick-select-wrap">
                <select id="rules-quick-role-select" class="mobile-role-quick-select" aria-label="Sauter directement à un rôle">
                  <option value="">⚡ Aller directement à un rôle...</option>
                  ${CARDS_DATA.map((c, i) => `
                    <option value="${i}">${c.avatar} ${escapeHtml(c.name)} (${escapeHtml(c.campLabel)})</option>
                  `).join('')}
                </select>
              </div>
              <div class="rules-top-actions">
                <button id="btn-open-diaporama" class="btn-primary btn-rules-action" style="box-shadow: 0 0 12px rgba(245, 158, 11, 0.35);">
                  🎬 Diaporama
                </button>
                <button id="btn-toggle-tv-rules-stream" class="btn-secondary btn-rules-action" style="border-color: #a855f7; color: #d8b4fe; display: none;" title="Diffuser et synchroniser les cartes en direct sur l'écran TV">
                  📺 Projeter TV
                </button>
              </div>
            </div>

            <!-- Filtres des cartes horizontaux flickables au doigt -->
            <div class="roles-filter-bar">
              <button class="role-filter-chip active" data-filter="all">Toutes (${CARDS_DATA.length})</button>
              <button class="role-filter-chip" data-filter="monstres">🐺 Monstres</button>
              <button class="role-filter-chip" data-filter="village">🛡️ Village</button>
              <button class="role-filter-chip" data-filter="neutre">⚔️ Neutres</button>
              <button class="role-filter-chip" data-filter="personnel">🧹 Personnel</button>
              <button class="role-filter-chip" data-filter="spectre">👻 Spectres</button>
            </div>

            <!-- Grille / Liste des cartes tactiles -->
            <div id="rules-roles-grid" class="roles-grid">
              ${renderRolesCardsHtml('all')}
            </div>
          </div>

          <!-- ONGLET 2 : RÈGLES DU JEU -->
          <div id="tab-regles" class="rules-tab-pane">
            <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.88rem; line-height: 1.45; color: #e2e8f0;">
              
              <div style="background: rgba(212, 175, 55, 0.1); border: 1.5px solid rgba(212, 175, 55, 0.4); border-radius: var(--radius-sm); padding: 14px 16px;">
                <strong style="color: var(--gold-light); font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                  <span>🎯</span> Objectif de la Partie (<span class="rules-dyn-max-nights">5 Nuits</span> Maximum) :
                </strong>
                <p style="margin: 8px 0 0 0; color: #cbd5e1;">
                  • <strong>Les Villageois</strong> gagnent s'ils démasquent et éliminent les <strong class="rules-dyn-monsters-count">3 Monstres</strong> avant la fin des <strong class="rules-dyn-max-nights-2">5 nuits</strong>.<br>
                  • <strong>Les Monstres</strong> gagnent s'ils éliminent tous les villageois ou s'il reste au moins 1 monstre en vie à l'issue de la <span class="rules-dyn-final-night-label">5ème nuit</span> !<br>
                  • <strong>Le Pyromane</strong> gagne en solitaire s'il est le dernier survivant dans le Manoir.
                </p>
              </div>

              <div style="background: rgba(220, 38, 38, 0.15); border: 1.5px solid #ef4444; border-radius: var(--radius-sm); padding: 14px 16px;">
                <strong style="color: #fca5a5; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                  <span>🐺</span> La Règle d'Attaque Capitale des Monstres :
                </strong>
                <p style="margin: 8px 0 0 0; color: #fecaca;">
                  Pour réussir à éliminer une proie la nuit, les monstres doivent être <strong>au moins DEUX dans la même pièce</strong> que leur victime !<br>
                  S'il n'y a qu'<strong>un seul monstre isolé</strong> dans une pièce avec des villageois, <strong>il ne peut pas attaquer</strong>.
                </p>
              </div>

              <div style="background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: var(--radius-sm); padding: 14px 16px;">
                <strong style="color: #6ee7b7; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                  <span>🏰</span> Les 5 Pièces du Manoir & Le Choix en 60s :
                </strong>
                <p style="margin: 8px 0 0 0;">
                  Avant chaque nuit, le décompte de <strong>60 secondes</strong> démarre sur le grand écran. Chaque joueur choisit secrètement sa pièce sur son smartphone parmi les 5 salles :<br>
                  <span style="color: var(--gold-light); font-weight: 700;">🕷️ Grenier &bull; 🛏️ Chambre &bull; 🔥 Salon &bull; 🍲 Cuisine &bull; 🕯️ Salle à Manger</span>.<br>
                  <em>Note :</em> Si le temps expire sans validation, le joueur reste dans son refuge précédent (ou un refuge intact la 1ère nuit).
                </p>
              </div>

              <div style="background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: var(--radius-sm); padding: 14px 16px;">
                <strong style="color: #93c5fd; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                  <span>☀️</span> Le Jour : Révélation des Cachettes, Débats & Vote :
                </strong>
                <p style="margin: 8px 0 0 0;">
                  1. Le grand écran TV dévoile <strong>où a dormi chacun</strong>.<br>
                  2. L'animateur annonce le <strong>Bilan des morts de la nuit</strong>.<br>
                  3. <strong>Débat enflammé :</strong> les survivants confrontent leurs alibis et les témoins de chaque salle.<br>
                  4. <strong>Vote du Village :</strong> l'animateur enregistre l'élimination du suspect désigné par le vote des villageois.
                </p>
              </div>

              <div style="background: rgba(147, 51, 234, 0.2); border: 1.5px solid #c084fc; border-radius: var(--radius-sm); padding: 14px 16px;">
                <strong style="color: #e9d5ff; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                  <span>👻</span> Les Spectres (Les Éliminés continuent de jouer !) :
                </strong>
                <p style="margin: 8px 0 0 0; color: #f3e8ff;">
                  Les morts deviennent des <strong>Spectres</strong> et disposent de fonctionnalités exclusives depuis leur téléphone :<br>
                  • <strong>Le Salon des Spectres :</strong> Une messagerie secrète et privée entre tous les défunts.<br>
                  • <strong>Les Apparitions Spectrales :</strong> Projeter des emojis hantés flottants sur l'écran TV (100% Anonyme).
                </p>
              </div>

            </div>
          </div>

          <!-- ONGLET 3 : ORDRE D'APPEL DE NUIT -->
          <div id="tab-appel" class="rules-tab-pane">
            <div style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 14px;">
              Guide chronologique officiel pour l'animateur et repère pour les joueurs :
            </div>
            
            <!-- ÉTAPE 1 : FERMETURE DES YEUX -->
            <div class="call-order-step">
              <div class="call-order-num">1</div>
              <div>
                <strong style="color: #fef08a; font-size: 0.95rem;">⏳ Fin des 60s & Manoir Endormi</strong><br>
                <span style="font-size: 0.82rem; color: #94a3b8;">Le décompte se termine sur l'écran. Tout le monde ferme les yeux dans sa pièce choisie. Le silence règne dans le Manoir.</span>
              </div>
            </div>

            <!-- NUIT 1 UNIQUE : CUPIDON & VOLEUR -->
            <div class="call-order-step" style="border-left: 3px solid #ec4899; background: rgba(236, 72, 153, 0.15);">
              <div class="call-order-num" style="background: linear-gradient(135deg, #ec4899, #be185d);">✨</div>
              <div>
                <strong style="color: #f472b6; font-size: 0.95rem;">💘 Cupidon & 🎭 Le Voleur</strong><br>
                <span style="font-size: 0.82rem; color: #fce7f3;">1. <strong>Le Voleur :</strong> Se réveille en premier et choisit s'il dérobe une carte endormie.<br>2. <strong>Cupidon :</strong> Désigne 2 amoureux du doigt et se rendort. L'animateur touche discrètement les 2 amoureux qui se regardent en silence.</span>
              </div>
            </div>

            <!-- ÉTAPE 2 : LE FOSSOYEUR (DÈS LE DÉBUT DE NUIT) -->
            <div class="call-order-step" style="border-left: 3px solid #a855f7;">
              <div class="call-order-num" style="background: linear-gradient(135deg, #9333ea, #6b21a8);">2</div>
              <div>
                <strong style="color: #d8b4fe; font-size: 0.95rem;">⚰️ Le Fossoyeur (Recycleur d'Âmes)</strong><br>
                <span style="font-size: 0.82rem; color: #cbd5e1;">Choisit une âme villageoise au cimetière (jamais la même 2 nuits de suite) et utilise <strong>lui-même son pouvoir dès cette nuit</strong> (voyance, protection, corbeau...). S'il n'y a aucun mort actif, il se rendort.</span>
              </div>
            </div>

            <!-- ÉTAPE 3 : LE SALVATEUR -->
            <div class="call-order-step" style="border-left: 3px solid #10b981;">
              <div class="call-order-num" style="background: linear-gradient(135deg, #059669, #047857);">3</div>
              <div>
                <strong style="color: #6ee7b7; font-size: 0.95rem;">🛡️ Le Salvateur</strong><br>
                <span style="font-size: 0.82rem; color: #cbd5e1;">Ouvre les yeux, désigne une personne à immuniser contre l'attaque des monstres cette nuit (jamais la même 2 nuits de suite).</span>
              </div>
            </div>

            <!-- ÉTAPE 4 : LA VOYANTE -->
            <div class="call-order-step" style="border-left: 3px solid #38bdf8;">
              <div class="call-order-num" style="background: linear-gradient(135deg, #0284c7, #0369a1);">4</div>
              <div>
                <strong style="color: #7dd3fc; font-size: 0.95rem;">🔮 La Voyante</strong><br>
                <span style="font-size: 0.82rem; color: #cbd5e1;">Ouvre les yeux, pointe un joueur, l'animateur lui montre discrètement sa véritable carte de rôle.</span>
              </div>
            </div>

            <!-- ÉTAPE 5 : LES MONSTRES -->
            <div class="call-order-step" style="border-left: 3px solid #ef4444;">
              <div class="call-order-num" style="background: linear-gradient(135deg, #dc2626, #991b1b);">5</div>
              <div>
                <strong style="color: #fca5a5; font-size: 0.95rem;">🐺 Les Monstres</strong><br>
                <span style="font-size: 0.82rem; color: #cbd5e1;">Les 3 monstres ouvrent les yeux, vérifient s'ils sont au moins deux dans une pièce, et désignent leur victime en silence.</span>
              </div>
            </div>

            <!-- ÉTAPE 6 : LA SORCIÈRE -->
            <div class="call-order-step" style="border-left: 3px solid #eab308;">
              <div class="call-order-num" style="background: linear-gradient(135deg, #ca8a04, #a16207);">6</div>
              <div>
                <strong style="color: #fde047; font-size: 0.95rem;">🧪 La Sorcière</strong><br>
                <span style="font-size: 0.82rem; color: #cbd5e1;">L'animateur lui indique la victime des monstres. Elle choisit d'utiliser sa Potion de Vie et/ou sa Potion de Mort.</span>
              </div>
            </div>

            <!-- ÉTAPE 7 : LE PYROMANE -->
            <div class="call-order-step" style="border-left: 3px solid #f97316;">
              <div class="call-order-num" style="background: linear-gradient(135deg, #ea580c, #c2410c);">7</div>
              <div>
                <strong style="color: #fdba74; font-size: 0.95rem;">💣 Le Pyromane (Tous les 2 tours)</strong><br>
                <span style="font-size: 0.82rem; color: #cbd5e1;">Ouvre les yeux. Indique à l'animateur s'il pose une bombe dans une pièce (elle sautera à l'aube).</span>
              </div>
            </div>

            <!-- ÉTAPE 8 : LE CORBEAU -->
            <div class="call-order-step" style="border-left: 3px solid #94a3b8;">
              <div class="call-order-num" style="background: linear-gradient(135deg, #64748b, #475569);">8</div>
              <div>
                <strong style="color: #cbd5e1; font-size: 0.95rem;">🐦 Le Corbeau</strong><br>
                <span style="font-size: 0.82rem; color: #cbd5e1;">Ouvre les yeux et pointe le suspect qui recevra 2 voix d'office au vote du village.</span>
              </div>
            </div>

            <!-- L'AUBE -->
            <div class="call-order-step" style="border: 2px solid var(--gold); background: rgba(212, 175, 55, 0.12);">
              <div class="call-order-num" style="background: var(--gold); color: #000;">🌅</div>
              <div>
                <strong style="color: var(--gold-light); font-size: 1rem;">L'Aube : Le Manoir se Réveille !</strong><br>
                <span style="font-size: 0.84rem; color: #fff;">Tout le monde ouvre les yeux. Découverte des cachettes, Bilan des morts, débats animés et sentence du vote !</span>
              </div>
            </div>

          </div>

        </div>

        <!-- Pied de modale : bouton tactile fermer les règles -->
        <div class="rules-modal-footer">
          <button type="button" id="btn-close-rules-bottom" class="btn-secondary" style="width: 100%; padding: 10px; border-color: rgba(239, 68, 68, 0.4); color: #fca5a5; font-weight: 700; font-size: 0.9rem; justify-content: center; gap: 8px; background: rgba(220, 38, 38, 0.15);">
            <span>✕</span> <span>Fermer les Règles</span>
          </button>
        </div>
      </div>
    </div>

    <!-- DIAPORAMA / VISIONNEUSE PLEIN ÉCRAN DES CARTES -->
    <div id="modal-card-viewer" class="card-viewer-overlay" style="display: none;">
      <div class="card-viewer-box">
        
        <!-- Header Viewer -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(212, 175, 55, 0.3); padding-bottom: 8px; margin-bottom: 10px; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
            <span id="viewer-counter-badge" class="badge" style="background: rgba(212, 175, 55, 0.2); border: 1.5px solid var(--gold); color: #fef08a; font-size: 0.92rem; padding: 4px 12px; font-weight: 700; flex-shrink: 0;">
              Carte 1 / ${CARDS_DATA.length}
            </span>
            <span class="viewer-hint-text" style="color: #94a3b8; font-size: 0.78rem;">(Glissez ◀ ▶ pour naviguer)</span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
            <button id="btn-viewer-tv-stream" class="btn-secondary" style="padding: 6px 12px; font-size: 0.84rem; font-weight: 700; border-color: #a855f7; color: #d8b4fe; display: none;" title="Diffuser cette carte sur le Grand Écran TV">
              📺 Projeter TV
            </button>
            <button id="btn-close-card-viewer" type="button" class="btn-close-modal-prominent" title="Fermer la visionneuse (Échap)">✕</button>
          </div>
        </div>

        <!-- Stage : Image + Explications détaillées -->
        <div class="card-viewer-stage" id="card-viewer-stage-area">
          
          <div class="card-viewer-img-container">
            <img id="viewer-img" class="card-viewer-img" src="" alt="Carte de rôle" loading="eager">
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; justify-content: center; min-width: 0;">
            <div>
              <span id="viewer-camp-badge" class="badge" style="font-size: 0.85rem; padding: 4px 12px; font-weight: 700; margin-bottom: 4px; display: inline-block;">
                Camp
              </span>
              <h2 id="viewer-title" style="font-family: var(--font-gothic); font-size: 1.6rem; color: #fff; margin: 3px 0;">
                Titre
              </h2>
              <div id="viewer-count" style="font-size: 0.88rem; color: var(--gold-light); font-weight: 600;">
                Nombre de cartes
              </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: var(--radius-sm); padding: 12px 14px;">
              <div style="font-size: 0.82rem; text-transform: uppercase; color: var(--gold); font-weight: 800; letter-spacing: 0.5px; margin-bottom: 3px;">
                ⚡ Pouvoir & Rôle :
              </div>
              <div id="viewer-power" style="font-size: 0.98rem; color: #f1f5f9; line-height: 1.42; font-weight: 500;">
                ...
              </div>
            </div>

            <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: var(--radius-sm); padding: 10px 14px;">
              <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--gold-light); font-weight: 800; letter-spacing: 0.5px; margin-bottom: 3px;">
                💡 Conseil / Astuce :
              </div>
              <div id="viewer-tip" style="font-size: 0.88rem; color: #fef08a; font-style: italic; line-height: 1.38;">
                ...
              </div>
            </div>
          </div>

        </div>

        <!-- Footer Viewer : Boutons de navigation Thumb-Friendly + Jump Bar -->
        <div class="card-viewer-footer">
          <div class="card-viewer-nav-row">
            <button id="btn-viewer-prev" class="btn-secondary viewer-nav-btn" title="Carte précédente (◀)">
              ◀ Précédente
            </button>
            <button id="btn-viewer-tv-stream-footer" class="btn-secondary viewer-nav-tv-btn" style="border-color: #a855f7; color: #d8b4fe; display: none;" title="Diffuser cette carte sur l'écran TV">
              📺 Projeter TV
            </button>
            <button id="btn-viewer-next" class="btn-primary viewer-nav-btn" title="Carte suivante (▶)">
              Suivante ▶
            </button>
          </div>

          <!-- Jump Bar : Pilules pour sauter directement à n'importe quelle carte -->
          <div id="viewer-jump-bar" class="card-viewer-jump-bar">
            ${CARDS_DATA.map((c, i) => `
              <button type="button" class="card-jump-pill ${i === 0 ? 'active' : ''}" data-index="${i}">
                ${c.avatar} ${escapeHtml(c.name)}
              </button>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
    `;
  }

  function renderRolesCardsHtml(filter = 'all') {
    const list = filter === 'all' ? CARDS_DATA : CARDS_DATA.filter(r => r.camp === filter);
    return list.map(r => {
      const realIndex = CARDS_DATA.findIndex(c => c.id === r.id);
      const isCurrentlyStreamingCard = isTvStreaming && currentCardIndex === realIndex;
      return `
      <div class="role-card-item camp-${r.camp} ${isCurrentlyStreamingCard ? 'card-is-tv-live' : ''}" data-card-index="${realIndex}" id="role-card-${realIndex}">
        <div class="role-card-thumb-wrap" data-card-action="view">
          ${r.image ? `
            <img class="role-card-thumb" src="${r.image}" alt="${escapeHtml(r.name)}" loading="lazy">
            <span class="role-card-thumb-zoom">🔍</span>
          ` : `
            <div style="font-size: 2.2rem; filter: drop-shadow(0 0 10px #c084fc);">${r.avatar}</div>
          `}
        </div>
        <div class="role-card-info">
          <div data-card-action="view">
            <div class="role-card-title-row">
              <span class="role-card-name">${escapeHtml(r.name)}</span>
              <span class="role-card-badge badge-${r.camp}">${escapeHtml(r.campLabel)}</span>
            </div>
            <div class="role-card-power-text">${r.power}</div>
            <div class="role-card-tip-text">« ${escapeHtml(r.tip)} »</div>
          </div>
          <div class="role-card-actions-bar">
            <span class="role-card-count">🃏 ${escapeHtml(r.count)}</span>
            <div class="role-card-buttons-group">
              ${checkIfHost() ? `
                <button type="button" class="btn-card-project-direct" data-project-index="${realIndex}" title="Diffuser directement sur la TV">
                  ${isCurrentlyStreamingCard ? '🟢 En direct TV' : '📺 Projeter TV'}
                </button>
              ` : ''}
              <button type="button" class="btn-card-view-direct" data-view-index="${realIndex}" title="Voir en grand">
                👁️ Voir
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    }).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  function initRulesModal() {
    if (!document.getElementById('modal-rules')) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = createModalHtml();
      while (wrapper.firstElementChild) {
        document.body.appendChild(wrapper.firstElementChild);
      }
    }

    const modal = document.getElementById('modal-rules');
    const btnClose = document.getElementById('btn-close-rules');
    const btnCloseBottom = document.getElementById('btn-close-rules-bottom');
    const viewerModal = document.getElementById('modal-card-viewer');
    const btnCloseViewer = document.getElementById('btn-close-card-viewer');

    const btnViewerPrev = document.getElementById('btn-viewer-prev');
    const btnViewerNext = document.getElementById('btn-viewer-next');
    const btnViewerTvStream = document.getElementById('btn-viewer-tv-stream');
    const btnViewerTvStreamFooter = document.getElementById('btn-viewer-tv-stream-footer');
    const btnOpenDiaporama = document.getElementById('btn-open-diaporama');
    const btnToggleTvRulesStream = document.getElementById('btn-toggle-tv-rules-stream');
    const quickRoleSelect = document.getElementById('rules-quick-role-select');
    const rolesGrid = document.getElementById('rules-roles-grid');

    function getSocket() {
      if (typeof window !== 'undefined' && window.socket) return window.socket;
      if (typeof socket !== 'undefined' && socket) {
        if (typeof window !== 'undefined') window.socket = socket;
        return socket;
      }
      if (typeof io !== 'undefined') {
        window.socket = window.socket || io();
        return window.socket;
      }
      return null;
    }

    const isHostScreen = window.location.pathname.includes('host') || document.querySelector('.host-body') !== null;
    if (isHostScreen) {
      if (btnViewerTvStream) btnViewerTvStream.style.display = 'inline-flex';
      if (btnViewerTvStreamFooter) btnViewerTvStreamFooter.style.display = 'inline-flex';
      if (btnToggleTvRulesStream) btnToggleTvRulesStream.style.display = 'inline-flex';
    }

    function updateLiveCardBadges() {
      document.querySelectorAll('#rules-roles-grid .role-card-item').forEach(el => {
        const idx = parseInt(el.dataset.cardIndex, 10);
        const isLive = isTvStreaming && idx === currentCardIndex;
        el.classList.toggle('card-is-tv-live', isLive);
        const projBtn = el.querySelector('.btn-card-project-direct');
        if (projBtn) {
          projBtn.textContent = isLive ? '🟢 En direct TV' : '📺 Projeter TV';
        }
      });
    }

    function updateTvButtonsState(streaming) {
      isTvStreaming = !!streaming;
      const textViewer = isTvStreaming ? '🟢 TV En Direct' : '📺 Projeter TV';
      const textModal = isTvStreaming ? '🟢 TV En Direct (Actif)' : '📺 Projeter TV';

      [btnViewerTvStream, btnViewerTvStreamFooter].forEach(btn => {
        if (btn) {
          btn.textContent = textViewer;
          btn.style.borderColor = isTvStreaming ? '#10b981' : '#a855f7';
          btn.style.color = isTvStreaming ? '#6ee7b7' : '#d8b4fe';
          btn.style.boxShadow = isTvStreaming ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none';
        }
      });

      if (btnToggleTvRulesStream) {
        btnToggleTvRulesStream.textContent = textModal;
        btnToggleTvRulesStream.style.borderColor = isTvStreaming ? '#10b981' : '#a855f7';
        btnToggleTvRulesStream.style.color = isTvStreaming ? '#6ee7b7' : '#d8b4fe';
        btnToggleTvRulesStream.style.boxShadow = isTvStreaming ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none';
      }

      updateLiveCardBadges();
    }

    function closeModal() {
      if (modal) modal.style.display = 'none';
      if (viewerModal) viewerModal.style.display = 'none';
      // Ferme automatiquement la diffusion TV si l'hôte ferme les règles
      if (isTvStreaming) {
        isTvStreaming = false;
        updateTvButtonsState(false);
        const s = getSocket();
        if (s) {
          s.emit('host_action', {
            action: 'TV_RULES_PRESENT',
            payload: { visible: false }
          });
        }
      }
    }

    function syncDynamicRulesText() {
      const state = window.currentGameState || {};
      const maxN = state.maxNights || 5;
      const mCount = state.monstersCount || 3;
      modal?.querySelectorAll('.rules-dyn-max-nights').forEach(el => el.textContent = `${maxN} Nuits`);
      modal?.querySelectorAll('.rules-dyn-max-nights-2').forEach(el => el.textContent = `${maxN} nuits`);
      modal?.querySelectorAll('.rules-dyn-monsters-count').forEach(el => el.textContent = `${mCount} Monstre${mCount > 1 ? 's' : ''}`);
      modal?.querySelectorAll('.rules-dyn-final-night-label').forEach(el => el.textContent = `${maxN}ème nuit`);
    }

    function openModal() {
      if (window.soundEngine && window.soundEngine.playSelect) {
        window.soundEngine.init();
        window.soundEngine.playSelect();
      }
      syncDynamicRulesText();
      if (modal) modal.style.display = 'flex';
      updateLiveCardBadges();
    }

    function updateViewerCard(index) {
      if (index < 0) index = CARDS_DATA.length - 1;
      if (index >= CARDS_DATA.length) index = 0;
      currentCardIndex = index;

      const card = CARDS_DATA[currentCardIndex];
      const viewerImg = document.getElementById('viewer-img');
      const viewerTitle = document.getElementById('viewer-title');
      const viewerCampBadge = document.getElementById('viewer-camp-badge');
      const viewerCount = document.getElementById('viewer-count');
      const viewerPower = document.getElementById('viewer-power');
      const viewerTip = document.getElementById('viewer-tip');
      const viewerCounterBadge = document.getElementById('viewer-counter-badge');

      if (viewerCounterBadge) viewerCounterBadge.textContent = `Carte ${currentCardIndex + 1} / ${CARDS_DATA.length}`;

      if (viewerTitle) viewerTitle.textContent = card.fullTitle || card.name;
      if (viewerCount) viewerCount.textContent = `🃏 ${card.count}`;
      if (viewerPower) viewerPower.textContent = card.power;
      if (viewerTip) viewerTip.textContent = card.tip;

      if (viewerCampBadge) {
        viewerCampBadge.textContent = `${card.avatar} ${card.campLabel}`;
        viewerCampBadge.className = `badge badge-${card.camp}`;
      }

      if (viewerImg) {
        if (card.image) {
          viewerImg.src = card.image;
          viewerImg.style.display = 'block';
        } else {
          // Si Spectre (sans carte physique imprimée)
          viewerImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" fill="%231a0e2e" rx="16"/><text x="150" y="200" font-size="90" text-anchor="middle">👻</text><text x="150" y="260" font-size="22" fill="%23e9d5ff" font-family="sans-serif" font-weight="bold" text-anchor="middle">LES SPECTRES</text><text x="150" y="295" font-size="14" fill="%23cbd5e1" font-family="sans-serif" text-anchor="middle">Pouvoirs de l%27Au-delà</text></svg>';
          viewerImg.style.display = 'block';
        }
      }

      // Mettre à jour les pilules de saut et centrer celle active
      document.querySelectorAll('#viewer-jump-bar .card-jump-pill').forEach((pill, idx) => {
        const isActive = idx === currentCardIndex;
        pill.classList.toggle('active', isActive);
        if (isActive) {
          pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });

      // Synchroniser le select rapide
      if (quickRoleSelect) {
        quickRoleSelect.value = String(currentCardIndex);
      }

      // Synchroniser avec la TV si le stream est actif
      if (isTvStreaming) {
        const s = getSocket();
        if (s) {
          s.emit('host_action', {
            action: 'TV_RULES_SET_CARD',
            payload: { cardIndex: currentCardIndex }
          });
        }
        updateLiveCardBadges();
      }
    }

    function openCardViewer(index = 0) {
      if (window.soundEngine && window.soundEngine.playSelect) {
        window.soundEngine.init();
        window.soundEngine.playSelect();
      }
      currentActiveTab = 'roles';
      updateViewerCard(index);
      if (viewerModal) viewerModal.style.display = 'flex';

      if (isTvStreaming) {
        const s = getSocket();
        if (s) {
          s.emit('host_action', {
            action: 'TV_RULES_SET_TAB',
            payload: { tab: 'roles' }
          });
          s.emit('host_action', {
            action: 'TV_RULES_SET_CARD',
            payload: { cardIndex: currentCardIndex }
          });
        }
      }
    }

    function closeCardViewer() {
      if (viewerModal) viewerModal.style.display = 'none';
    }

    function toggleTvStream() {
      if (!checkIfHost()) return;
      isTvStreaming = !isTvStreaming;
      updateTvButtonsState(isTvStreaming);

      const s = getSocket();
      if (s) {
        s.emit('host_action', {
          action: 'TV_RULES_PRESENT',
          payload: {
            visible: isTvStreaming,
            cardIndex: currentCardIndex,
            tab: currentActiveTab
          }
        });
      }
    }

    // Projection directe d'une carte depuis la liste
    function projectCardDirectly(idx) {
      if (!checkIfHost()) return;
      currentCardIndex = idx;
      isTvStreaming = true;
      updateTvButtonsState(true);

      if (window.soundEngine && window.soundEngine.playSelect) {
        window.soundEngine.init();
        window.soundEngine.playSelect();
      }

      const s = getSocket();
      if (s) {
        s.emit('host_action', {
          action: 'TV_RULES_PRESENT',
          payload: {
            visible: true,
            cardIndex: currentCardIndex,
            tab: 'roles'
          }
        });
      }
    }

    btnClose?.addEventListener('click', closeModal);
    btnCloseBottom?.addEventListener('click', closeModal);
    btnCloseViewer?.addEventListener('click', closeCardViewer);
    btnOpenDiaporama?.addEventListener('click', () => openCardViewer(0));

    btnViewerPrev?.addEventListener('click', () => {
      if (window.soundEngine && window.soundEngine.playSelect) window.soundEngine.playSelect();
      updateViewerCard(currentCardIndex - 1);
    });
    btnViewerNext?.addEventListener('click', () => {
      if (window.soundEngine && window.soundEngine.playSelect) window.soundEngine.playSelect();
      updateViewerCard(currentCardIndex + 1);
    });

    btnViewerTvStream?.addEventListener('click', toggleTvStream);
    btnViewerTvStreamFooter?.addEventListener('click', toggleTvStream);
    btnToggleTvRulesStream?.addEventListener('click', toggleTvStream);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    viewerModal?.addEventListener('click', (e) => {
      if (e.target === viewerModal) closeCardViewer();
    });

    // Touch Swipe Gestures sur mobile pour le viewer
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    viewerModal?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    viewerModal?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
        if (diffX < 0) {
          // Swipe vers la gauche -> carte suivante
          if (window.soundEngine && window.soundEngine.playSelect) window.soundEngine.playSelect();
          updateViewerCard(currentCardIndex + 1);
        } else {
          // Swipe vers la droite -> carte précédente
          if (window.soundEngine && window.soundEngine.playSelect) window.soundEngine.playSelect();
          updateViewerCard(currentCardIndex - 1);
        }
      }
    }, { passive: true });

    // Sélecteur rapide de rôle (Mobile & Desktop)
    quickRoleSelect?.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val !== '') {
        const idx = parseInt(val, 10);
        if (!isNaN(idx)) {
          openCardViewer(idx);
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if (viewerModal && viewerModal.style.display === 'flex') {
        if (e.key === 'Escape') closeCardViewer();
        if (e.key === 'ArrowLeft') updateViewerCard(currentCardIndex - 1);
        if (e.key === 'ArrowRight') updateViewerCard(currentCardIndex + 1);
      } else if (modal && modal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal();
      }
    });

    // Attacher à tous les boutons déclencheurs
    document.querySelectorAll('#btn-open-rules, .btn-rules-trigger, #btn-host-rules, #btn-banner-rules').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    // Clics dans la grille des rôles : Projeter directement ou Ouvrir le viewer
    rolesGrid?.addEventListener('click', (e) => {
      const projBtn = e.target.closest('.btn-card-project-direct');
      if (projBtn && projBtn.dataset.projectIndex !== undefined) {
        e.stopPropagation();
        const idx = parseInt(projBtn.dataset.projectIndex, 10);
        projectCardDirectly(idx);
        return;
      }

      const viewBtn = e.target.closest('.btn-card-view-direct');
      if (viewBtn && viewBtn.dataset.viewIndex !== undefined) {
        e.stopPropagation();
        const idx = parseInt(viewBtn.dataset.viewIndex, 10);
        openCardViewer(idx);
        return;
      }

      const cardEl = e.target.closest('.role-card-item');
      if (cardEl && cardEl.dataset.cardIndex !== undefined) {
        const idx = parseInt(cardEl.dataset.cardIndex, 10);
        openCardViewer(idx);
      }
    });

    // Pilules de saut dans le viewer
    document.getElementById('viewer-jump-bar')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.card-jump-pill');
      if (pill && pill.dataset.index !== undefined) {
        if (window.soundEngine && window.soundEngine.playSelect) window.soundEngine.playSelect();
        updateViewerCard(parseInt(pill.dataset.index, 10));
      }
    });

    // Gestion des onglets
    const tabButtons = modal.querySelectorAll('.rules-tab-btn');
    const tabPanes = modal.querySelectorAll('.rules-tab-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.soundEngine && window.soundEngine.playSelect) window.soundEngine.playSelect();
        const targetId = btn.dataset.tab;
        if (targetId) {
          currentActiveTab = targetId.replace('tab-', '');
        }

        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');

        if (isTvStreaming) {
          const s = getSocket();
          if (s) {
            s.emit('host_action', {
              action: 'TV_RULES_SET_TAB',
              payload: { tab: currentActiveTab }
            });
          }
        }
      });
    });

    // Filtres des rôles
    const filterChips = modal.querySelectorAll('.role-filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (window.soundEngine && window.soundEngine.playSelect) window.soundEngine.playSelect();
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        if (rolesGrid) {
          rolesGrid.innerHTML = renderRolesCardsHtml(filter);
          updateLiveCardBadges();
        }
      });
    });

    // Écouteurs Socket.IO pour synchroniser l'état des boutons sur l'admin / hôte
    function attachSocketSync() {
      const s = getSocket();
      if (!s) return;
      s.on('tv_rules_display', ({ visible, cardIndex, tab }) => {
        if (typeof visible === 'boolean') updateTvButtonsState(visible);
        if (typeof cardIndex === 'number') currentCardIndex = cardIndex;
        if (tab) currentActiveTab = tab;
      });
      s.on('state_updated', (state) => {
        if (state && typeof state.tvRulesVisible === 'boolean') {
          updateTvButtonsState(state.tvRulesVisible);
          if (typeof state.tvRulesCardIndex === 'number') currentCardIndex = state.tvRulesCardIndex;
          if (state.tvRulesTab) currentActiveTab = state.tvRulesTab;
        }
      });
    }
    attachSocketSync();
    window.addEventListener('load', attachSocketSync);

    // Exposer l'API globale
    window.openRulesModal = openModal;
    window.closeRulesModal = closeModal;
    window.openCardViewer = openCardViewer;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRulesModal);
  } else {
    initRulesModal();
  }
})();

