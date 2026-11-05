// 1. Récupération des éléments HTML
const cameraInput = document.getElementById('cameraInput');
const canvas = document.getElementById('listCanvas');
const ctx = canvas.getContext('2d');
const placeholderText = document.getElementById('placeholderText');
const clearBtn = document.getElementById('clearBtn');

let isDrawing = false;
let currentImage = null; // Stocke l'image originale

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
  const maxWidth = container.clientWidth;
  const maxHeight = container.clientHeight;

  // Calculer le ratio pour adapter la photo sans la déformer
  let width = img.width;
  let height = img.height;

  const ratio = Math.min(maxWidth / width, maxHeight / height);
  canvas.width = width * ratio;
  canvas.height = height * ratio;

  // Dessiner l'image sur le Canvas
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Configuration par défaut du trait de crayon
  ctx.strokeStyle = '#e74c3c'; // Rouge
  ctx.lineWidth = 6;            // Épaisseur du trait
  ctx.lineCap = 'round';        // Bouts arrondis
  ctx.lineJoin = 'round';
}

// 4. Gestion du tracé au doigt (ou à la souris)

// Obtenir la position exacte du contact tactile ou du curseur
function getCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

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