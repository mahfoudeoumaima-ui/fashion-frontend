let allProducts = [];
  let cartCount = 0;
  let currentProduct = null;
  let activeCat = '';

  const liste = document.getElementById('liste');
  const inputNom = document.getElementById('input');
  const inputPrix = document.getElementById('prix');
  const categorieSelect = document.getElementById('categorie');
  const button = document.getElementById('button');
  const resultCount = document.getElementById('resultCount');
  const catTabs = document.getElementById('catTabs');

  [inputNom, inputPrix, categorieSelect].forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); button.click(); } });
  });

  categorieSelect.addEventListener('change', () => {
    activeCat = categorieSelect.value;
    const tabs = document.querySelectorAll('.cat-tab');
    tabs.forEach(t => {
      if (t.dataset.val === activeCat) t.classList.add('active');
      else t.classList.remove('active');
    });
    filterProducts();
  });

  function afficher(products, posts = []) {
    liste.innerHTML = '';

    if (!products.length && !posts.length) {
      liste.innerHTML = `<div class="empty-state">
        <div class="empty-icon">🧺</div>
        <h3>Aucun résultat trouvé</h3>
        <p>Essayez d'autres termes de recherche</p>
      </div>`;
      resultCount.textContent = '0 résultats';
      return;
    }

    const total = products.length + posts.length;
    resultCount.textContent = `${total} résultat${total > 1 ? 's' : ''}`;

    products.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'card';
      div.style.animationDelay = `${i * 0.05}s`;
      const isNew = i < 3;
      const safeP = JSON.stringify(p).replace(/"/g, '&quot;');
      div.innerHTML = `
        <div class="card-img-wrap">
          <img src="${p.image}" alt="${p.nom.trim()}" loading="lazy" />
          <div class="card-overlay">
            <p class="overlay-name">${p.nom.trim()}</p>
            <p class="overlay-price">${p.prix} dh</p>
            <button class="btn-add" onclick="openModal(event, ${safeP})">Voir le look</button>
          </div>
          ${isNew ? '<span class="card-badge">Nouveau</span>' : ''}
          <button class="card-wish" onclick="toggleWish(event, this)" title="Favoris">♡</button>
        </div>
        <div class="card-body">
          <div class="card-body-left">
            <p class="card-cat">${p.categorie}</p>
            <h3 class="card-name">${p.nom.trim()}</h3>
          </div>
          <p class="card-price">${p.prix} <span>dh</span></p>
        </div>
      `;
      div.addEventListener('click', (e) => {
        if (!e.target.closest('button')) openModalFromCard(p);
      });
      liste.appendChild(div);
    });

    posts.forEach((p, i) => {
      const idx = products.length + i;
      const card = document.createElement('div');
      card.className = 'post-card visible';
      card.dataset.cat = p.cat;
      card.style.animationDelay = `${idx * 0.05}s`;
      const isLiked = likedPosts.has(p.id);
      const isSaved = savedPosts.has(p.id);
      card.innerHTML = `
        <img src="${p.img}" alt="${p.title}" loading="lazy" />
        <div class="post-overlay">
          <span class="post-tag">${p.tag}</span>
          <p class="post-title">${p.title}</p>
          <p class="post-caption">${p.caption}</p>
          <div class="post-actions">
            <button class="post-action-btn ${isLiked?'liked':''}" data-id="${p.id}" data-type="like" title="J'aime">${isLiked?'♥':'♡'}</button>
            <button class="post-action-btn ${isSaved?'saved':''}" data-id="${p.id}" data-type="save" title="Sauvegarder">${isSaved?'🔖':'🏷'}</button>
          </div>
        </div>
        <div class="post-strip">
          <div class="post-strip-left">
            <p class="post-strip-cat">${p.tag}</p>
            <p class="post-strip-title">${p.title}</p>
          </div>
          <div class="post-strip-actions">
            <button class="strip-btn ${isLiked?'liked':''}" data-id="${p.id}" data-type="like">${isLiked?'♥':'♡'}</button>
            <button class="strip-btn ${isSaved?'saved':''}" data-id="${p.id}" data-type="save">${isSaved?'🔖':'🏷'}</button>
          </div>
        </div>
      `;
      liste.appendChild(card);
    });
  }

  function filterProducts() {
    const mot = inputNom.value.toLowerCase().trim();
    const prixVal = parseFloat(inputPrix.value);
    
    const resProducts = allProducts.filter(p => {
      const nomOK = p.nom.toLowerCase().includes(mot);
      const catOK = activeCat === '' || p.categorie === activeCat;
      const prixOK = isNaN(prixVal) || p.prix === prixVal;
      return nomOK && catOK && prixOK;
    });

    let resPosts = [];
    if (mot !== '') {
      resPosts = POSTS.filter(p => {
        return p.title.toLowerCase().includes(mot) || 
               p.caption.toLowerCase().includes(mot) || 
               p.tag.toLowerCase().includes(mot);
      });
    }

    afficher(resProducts, resPosts);
  }

  function openModalFromCard(p) {
    currentProduct = p;
    document.getElementById('modalImg').src = p.image;
    document.getElementById('modalImg').alt = p.nom.trim();
    document.getElementById('modalCat').textContent = p.categorie;
    document.getElementById('modalName').textContent = p.nom.trim();
    document.getElementById('modalPrice').textContent = `${p.prix} dh`;
    document.getElementById('modalBg').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function openModal(e, p) {
    e.stopPropagation();
    openModalFromCard(p);
  }

  function closeModal(e) {
    if (e.target === document.getElementById('modalBg')) closeModalDirect();
  }

  function closeModalDirect() {
    document.getElementById('modalBg').classList.remove('open');
    document.body.style.overflow = '';
  }

  function addToCartModal() {
    if (currentProduct) addToCart(currentProduct.nom.trim());
    closeModalDirect();
  }

  function addToCart(name) {
    cartCount++;
    const badge = document.getElementById('cartBadge');
    badge.style.display = 'flex';
    badge.textContent = cartCount;
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = `"${name}" ajouté au panier !`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function showCart() {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = cartCount ? `${cartCount} article${cartCount > 1 ? 's' : ''} dans votre panier` : 'Votre panier est vide';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function toggleWish(e, btn) {
    e.stopPropagation();
    btn.classList.toggle('wished');
    btn.textContent = btn.classList.contains('wished') ? '♥' : '♡';
  }

  function buildCatTabs(categories) {
    catTabs.innerHTML = '';
    const allTab = document.createElement('button');
    allTab.className = 'cat-tab active';
    allTab.textContent = 'Tout';
    allTab.dataset.val = '';
    allTab.onclick = () => { activeCat = ''; categorieSelect.value = ''; setActiveTab(allTab); filterProducts(); };
    catTabs.appendChild(allTab);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-tab';
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1) + 's';
      btn.dataset.val = cat;
      btn.onclick = () => { activeCat = cat; categorieSelect.value = cat; setActiveTab(btn); filterProducts(); };
      catTabs.appendChild(btn);

      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categorieSelect.appendChild(opt);
    });
  }

  function setActiveTab(tab) {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  }

  button.addEventListener('click', filterProducts);

  const prouduitsData = [
    { "nom":"chemise biege", "prix": 600, "categorie" : "chemise", "image": "image/ch1.jpeg" },
    { "nom":"chemise blue", "prix": 400, "categorie":"chemise", "image":"image/ch2.jpg" },
    { "nom":"chemise rouge", "prix": 200, "categorie":"chemise", "image":"image/ch3.jpeg" },
    { "nom":"chemise rose", "prix": 250, "categorie":"chemise", "image":"image/ch4.jpeg" },
    { "nom":"ensemble luxe", "prix": 3500, "categorie":"ensemble", "image": "image/en1.jpeg" },
    { "nom":"ensemble simple", "prix": 999, "categorie":"ensemble", "image":"image/en2.jpeg" },
    { "nom":"ensemble verte", "prix": 880, "categorie":"ensemble", "image":"image/en3.jpeg" },
    { "nom":"ensemble karaz", "prix": 3000, "categorie":"ensemble", "image":"image/en4.jpeg" },
    { "nom":"ensemble noir", "prix": 2500, "categorie":"ensemble", "image":"image/en5.jpeg" },
    { "nom":"ensemble d'élégence", "prix": 3000, "categorie":"ensemble", "image":"image/en6.jpeg" },
    { "nom":"ensemble angle", "prix": 4000, "categorie":"ensemble", "image":"image/en7.jpeg" },
    { "nom":"noir jupe", "prix": 500, "categorie":"jupe", "image":"image/jb1.jpeg" },
    { "nom":"magique jupe", "prix": 1000, "categorie":"jupe", "image":"image/jb2.jpeg" },
    { "nom":"jupe à volants", "prix": 800, "categorie":"jupe", "image":"image/jb3.jpeg" },
    { "nom":"simple jupe", "prix": 400, "categorie":"jupe", "image":"image/jb4.jpeg" }
  ];

  allProducts = prouduitsData;
  const cats = [...new Set(allProducts.map(p => p.categorie))];
  buildCatTabs(cats);
  afficher(allProducts);

  /* ── LOOKBOOK POSTS ─────────────────────────────────────────── */
  const POSTS = [
    { id:1,  img:'image/en1.jpeg',  title:'Look Luxe',         caption:'Ensemble élégant pour soirée',   cat:'elegant',    tag:'Élégant' },
    { id:2,  img:'image/jb1.jpeg',  title:'Noir Mystère',       caption:'Jupe dentelle & top sombre',     cat:'chic',       tag:'Chic' },
    { id:3,  img:'image/ch1.jpeg',  title:'Satin & Grâce',      caption:'Chemise beige enveloppante',     cat:'elegant',    tag:'Élégant' },
    { id:4,  img:'image/en5.jpeg',  title:'Nuit Parisienne',    caption:'Ensemble noir sophistiqué',      cat:'chic',       tag:'Chic' },
    { id:5,  img:'image/jb2.jpeg',  title:'Magie du Matin',     caption:'Jupe fluide & allure libre',     cat:'boheme',     tag:'Bohème' },
    { id:6,  img:'image/ch2.jpg',   title:'Blue Bow Day',       caption:'Chemise rayée & détails noeuds', cat:'casual',     tag:'Casual' },
    { id:7,  img:'image/en2.jpeg',  title:'Sunday Simple',      caption:'Ensemble simple & stylé',        cat:'casual',     tag:'Casual' },
    { id:8,  img:'image/jb3.jpeg',  title:'Volants en Fête',    caption:'Jupe à volants — mouvement pur', cat:'boheme',     tag:'Bohème' },
    { id:9,  img:'image/ch3.jpeg',  title:'Rouge Passion',      caption:'Chemise bordeaux & noeud chic',  cat:'chic',       tag:'Chic' },
    { id:10, img:'image/en6.jpeg',  title:'Élégance dOr',       caption:'Look raffiné aux reflets chauds',cat:'elegant',    tag:'Élégant' },
    { id:11, img:'image/jb4.jpeg',  title:'Neutral Energy',     caption:'Jupe simple, style affirmé',     cat:'streetwear', tag:'Street' },
    { id:12, img:'image/ch4.jpeg',  title:'Rose Wrap',          caption:'Chemise rose & coupe fluide',    cat:'casual',     tag:'Casual' },
    { id:13, img:'image/en3.jpeg',  title:'Vert Liberté',       caption:'Ensemble vert & énergie douce',  cat:'boheme',     tag:'Bohème' },
    { id:14, img:'image/en7.jpeg',  title:'Power Look',         caption:'Ensemble angle — coupe forte',   cat:'streetwear', tag:'Street' },
    { id:15, img:'image/en4.jpeg',  title:'Karaz Royale',       caption:'Ensemble brodé tradition chic',  cat:'elegant',    tag:'Élégant' },
  ];

  const BATCH = 10;
  let shownPosts = 0;
  let activeCatPosts = 'all';
  const likedPosts = new Set();
  const savedPosts = new Set();

  function renderPosts(reset) {
    const grid = document.getElementById('postsGrid');
    const filtered = activeCatPosts === 'all'
      ? POSTS
      : POSTS.filter(p => p.cat === activeCatPosts);

    if (reset) { grid.innerHTML = ''; shownPosts = 0; }

    const slice = filtered.slice(shownPosts, shownPosts + BATCH);
    shownPosts += slice.length;

    slice.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.dataset.cat = p.cat;
      card.style.transitionDelay = (idx * 0.045) + 's';

      const isLiked = likedPosts.has(p.id);
      const isSaved = savedPosts.has(p.id);

      card.innerHTML = `
        <img src="${p.img}" alt="${p.title}" loading="lazy" />
        <div class="post-overlay">
          <span class="post-tag">${p.tag}</span>
          <p class="post-title">${p.title}</p>
          <p class="post-caption">${p.caption}</p>
          <div class="post-actions">
            <button class="post-action-btn ${isLiked?'liked':''}" data-id="${p.id}" data-type="like" title="J'aime">${isLiked?'♥':'♡'}</button>
            <button class="post-action-btn ${isSaved?'saved':''}" data-id="${p.id}" data-type="save" title="Sauvegarder">${isSaved?'🔖':'🏷'}</button>
          </div>
        </div>
        <div class="post-strip">
          <div class="post-strip-left">
            <p class="post-strip-cat">${p.tag}</p>
            <p class="post-strip-title">${p.title}</p>
          </div>
          <div class="post-strip-actions">
            <button class="strip-btn ${isLiked?'liked':''}" data-id="${p.id}" data-type="like">${isLiked?'♥':'♡'}</button>
            <button class="strip-btn ${isSaved?'saved':''}" data-id="${p.id}" data-type="save">${isSaved?'🔖':'🏷'}</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // show / hide load more
    document.getElementById('loadMoreBtn').style.display =
      shownPosts >= filtered.length ? 'none' : 'inline-flex';

    // trigger scroll observer on new cards
    observePostCards();
  }

  // intersection observer for scroll-reveal
  function observePostCards() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.post-card:not(.visible)').forEach(c => io.observe(c));
  }

  // like / save toggle (event delegation)
  const handlePostAction = e => {
    const btn = e.target.closest('[data-type]');
    if (!btn) return;
    if (!btn.classList.contains('post-action-btn') && !btn.classList.contains('strip-btn')) return;
    e.stopPropagation();
    const id = +btn.dataset.id;
    const type = btn.dataset.type;

    if (type === 'like') {
      likedPosts.has(id) ? likedPosts.delete(id) : likedPosts.add(id);
    } else {
      savedPosts.has(id) ? savedPosts.delete(id) : savedPosts.add(id);
    }

    // update ALL buttons for this id
    document.querySelectorAll(`[data-id="${id}"][data-type="like"]`).forEach(b => {
      const on = likedPosts.has(id);
      b.classList.toggle('liked', on);
      b.textContent = on ? '♥' : '♡';
    });
    document.querySelectorAll(`[data-id="${id}"][data-type="save"]`).forEach(b => {
      const on = savedPosts.has(id);
      b.classList.toggle('saved', on);
      b.textContent = on ? '🔖' : '🏷';
    });
  };

  document.getElementById('postsGrid').addEventListener('click', handlePostAction);
  liste.addEventListener('click', handlePostAction);

  // filter buttons
  document.getElementById('postFilters').addEventListener('click', e => {
    const btn = e.target.closest('.post-filter-btn');
    if (!btn) return;
    document.querySelectorAll('.post-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCatPosts = btn.dataset.cat;
    renderPosts(true);
  });

  // load more
  document.getElementById('loadMoreBtn').addEventListener('click', () => renderPosts(false));

  // initial render
  renderPosts(true);
  /* ── END LOOKBOOK ────────────────────────────────────────────── */