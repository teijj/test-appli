// 1. Récupération des éléments HTML
const cameraInput = document.getElementById('cameraInput');
const canvas = document.getElementById('listCanvas');
const ctx = canvas.getContext('2d');
const placeholderText = document.getElementById('placeholderText');
const clearBtn = document.getElementById('clearBtn');
const brushSizeInput = document.getElementById('brushSize');
const sizeValueSpan = document.getElementById('sizeValue');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

let isDrawing = false;
let currentImage = null; // Stocke l'image originale
let currentColor = '#070100'; // noir par défaut

// Ouvrir les paramètres
settingsBtn.addEventListener('click', function() {
  settingsModal.style.display = 'flex';
});

// Fermer les paramètres via la croix
closeSettingsBtn.addEventListener('click', function() {
  settingsModal.style.display = 'none';
});

// Fermer aussi si on clique en dehors de la boîte blanche
settingsModal.addEventListener('click', function(e) {
  if (e.target === settingsModal) {
    settingsModal.style.display = 'none';
  }
});

// 2. Écouter la prise de photo
cameraInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      currentImage = img;
      displayImage(img);
    };
    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

// 3. Fonction pour afficher l'image dans le Canvas avec de la haute résolution
function displayImage(img) {
  // Masquer le texte d'attente et afficher le Canvas et le bouton Réinitialiser
  placeholderText.style.display = 'none';
  canvas.style.display = 'block';
  clearBtn.style.display = 'inline-block';

  // Obtenir la taille disponible dans le conteneur
  const container = canvas.parentElement;
  const containerWidth = container.clientWidth - 10;
  const containerHeight = container.clientHeight - 10;

  // Calcul des proportions
  const imgRatio = img.width / img.height;
  const containerRatio = containerWidth / containerHeight;

  let renderWidth, renderHeight;

  if (imgRatio > containerRatio) {
    renderWidth = containerWidth;
    renderHeight = containerWidth / imgRatio;
  } else {
    renderHeight = containerHeight;
    renderWidth = containerHeight * imgRatio;
  }

  // Prise en compte de la densité de pixels du smartphone (Retina / OLED)
  const dpr = window.devicePixelRatio || 1;
  canvas.width = renderWidth * dpr;
  canvas.height = renderHeight * dpr;

  // Ajustement de la taille d'affichage CSS
  canvas.style.width = renderWidth + 'px';
  canvas.style.height = renderHeight + 'px';

  // Mise à l'échelle du contexte pour garder des traits nets
  ctx.scale(dpr, dpr);

  // Redessiner l'image
  ctx.drawImage(img, 0, 0, renderWidth, renderHeight);

  // Reconfigurer le pinceau après le redimensionnement
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = brushSizeInput.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

brushSizeInput.addEventListener('input', function () {
  const size = brushSizeInput.value;
  ctx.lineWidth = size;
  sizeValueSpan.textContent = size + 'px';
});

// Calcul ultra-précis du point de contact au doigt
function getCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches ? e.touches[0] : e;

  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

// Redimensionnement automatique si le téléphone tourne ou change de taille
window.addEventListener('resize', () => {
  if (currentImage) {
    displayImage(currentImage);
  }
});

function startDrawing(e) {
  isDrawing = true;
  const pos = getCoords(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!isDrawing) return;
  e.preventDefault(); // Empêche le défilement de la page pendant qu'on barre une tâche

  const pos = getCoords(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

// Événements Tactiles (Smartphones / Tablettes)
canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

// Événements Souris (pour tester sur ordinateur)
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// 5. Réinitialiser la photo (effacer tous les traits barrés)
clearBtn.addEventListener('click', function () {
  if (currentImage) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
  }
});

// Gestion de la palette de couleurs
const colorDots = document.querySelectorAll('.color-dot');

colorDots.forEach(dot => {
  dot.addEventListener('click', function () {
    // Retirer la classe 'active' de toutes les pastilles
    colorDots.forEach(d => d.classList.remove('active'));
    
    // Ajouter la classe 'active' sur la pastille cliquée
    this.classList.add('active');
    
    // Mettre à jour la couleur du pinceau
    currentColor = this.getAttribute('data-color');
    ctx.strokeStyle = currentColor;
  });
});