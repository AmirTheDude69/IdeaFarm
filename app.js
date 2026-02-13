const ideaBtn = document.getElementById('ideaBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const createModal = document.getElementById('createModal');
const viewModal = document.getElementById('viewModal');
const poof = document.getElementById('poof');
const celebrationLayer = document.getElementById('celebrationLayer');
const ideasLayer = document.getElementById('ideasLayer');

const ideaTitle = document.getElementById('ideaTitle');
const ideaBody = document.getElementById('ideaBody');
const saveIdeaBtn = document.getElementById('saveIdeaBtn');

const viewTitle = document.getElementById('viewTitle');
const viewBody = document.getElementById('viewBody');
const editBtn = document.getElementById('editBtn');
const fulfillBtn = document.getElementById('fulfillBtn');
const deleteBtn = document.getElementById('deleteBtn');
const closeViewBtn = document.getElementById('closeViewBtn');

const STORAGE_KEY = 'ideaFarm.v1';

const drawingCount = 15;
const drawings = Array.from({ length: drawingCount }, (_, idx) => (
  `./assets/idea-drawings/idea-${String(idx + 1).padStart(2, '0')}.png`
));
const celebrationPhrases = [
  'You Rock!',
  'You De best!',
  'That was awesome!',
  'Keep it going dude!',
  'That was mad impressive!',
  'You are so inspiring!',
  'I wish I was half as cool as you!',
  'How is so much awesomeness possible?',
  'Where do you fit all that coolness?',
  "You're a machine!",
  'Kudos to you!',
  'I tip my hat off to you!',
];
const ideas = [];
let openIdeaId = null;
let idCounter = 1;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function openModal(modal) {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function showPoof() {
  poof.classList.remove('hidden');
  poof.style.animation = 'none';
  poof.offsetHeight;
  poof.style.animation = '';
  setTimeout(() => poof.classList.add('hidden'), 900);
}

function showCelebration(x, y) {
  const phrase = celebrationPhrases[Math.floor(Math.random() * celebrationPhrases.length)];
  const safeX = clamp(x, 180, window.innerWidth - 180);
  const safeY = clamp(y - 120, 110, window.innerHeight - 120);

  const bubble = document.createElement('div');
  bubble.className = 'celebration-bubble';
  bubble.textContent = phrase;
  bubble.style.left = `${safeX}px`;
  bubble.style.top = `${safeY}px`;

  const sparkles = document.createElement('div');
  sparkles.className = 'celebration-sparkles';
  sparkles.style.left = `${safeX}px`;
  sparkles.style.top = `${safeY}px`;

  celebrationLayer.append(sparkles, bubble);
  setTimeout(() => {
    bubble.remove();
    sparkles.remove();
  }, 1800);
}

function addIdea({ title, body }) {
  const drawing = drawings[Math.floor(Math.random() * drawings.length)];

  const item = {
    id: idCounter++,
    title: title.trim() || `Idea ${idCounter}`,
    body: body.trim(),
    drawing,
    x: random(120, window.innerWidth - 120),
    y: random(120, window.innerHeight - 220),
    vx: random(-0.7, 0.7),
    vy: random(-0.7, 0.7),
    fulfilled: false,
  };

  if (Math.abs(item.vx) < 0.15) item.vx = item.vx < 0 ? -0.3 : 0.3;
  if (Math.abs(item.vy) < 0.15) item.vy = item.vy < 0 ? -0.3 : 0.3;

  ideas.push(item);
  renderIdeas();
  persistIdeas();
}

function renderIdeas() {
  ideasLayer.innerHTML = '';

  for (const idea of ideas) {
    const node = document.createElement('article');
    node.className = `idea-item ${idea.fulfilled ? 'fulfilled' : ''}`;
    node.style.left = `${idea.x}px`;
    node.style.top = `${idea.y}px`;
    node.dataset.id = String(idea.id);

    const creature = document.createElement('div');
    creature.className = 'creature';

    const creatureImg = document.createElement('img');
    creatureImg.className = 'creature-img';
    creatureImg.src = idea.drawing;
    creatureImg.alt = idea.title || 'Idea drawing';

    creature.append(creatureImg);

    const label = document.createElement('div');
    label.className = 'idea-label';
    label.textContent = idea.title;

    node.append(creature, label);
    node.addEventListener('click', () => openView(idea.id));
    ideasLayer.appendChild(node);
  }
}

function openView(id) {
  const idea = ideas.find((entry) => entry.id === id);
  if (!idea) return;

  openIdeaId = id;
  viewTitle.value = idea.title;
  viewBody.value = idea.body;
  viewTitle.readOnly = true;
  viewBody.readOnly = true;
  editBtn.textContent = 'Edit';
  openModal(viewModal);
}

function updateOpenIdea(nextFields) {
  const idx = ideas.findIndex((entry) => entry.id === openIdeaId);
  if (idx < 0) return;

  ideas[idx] = { ...ideas[idx], ...nextFields };
  renderIdeas();
  persistIdeas();
}

ideaBtn.addEventListener('click', () => {
  ideaTitle.value = '';
  ideaBody.value = '';
  openModal(createModal);
  ideaTitle.focus();
});

saveIdeaBtn.addEventListener('click', () => {
  if (!ideaBody.value.trim()) {
    ideaBody.focus();
    return;
  }

  closeModal(createModal);
  showPoof();

  setTimeout(() => {
    addIdea({ title: ideaTitle.value, body: ideaBody.value });
  }, 350);
});

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(document.getElementById(btn.dataset.close)));
});

closeViewBtn.addEventListener('click', () => closeModal(viewModal));

deleteBtn.addEventListener('click', () => {
  const idx = ideas.findIndex((entry) => entry.id === openIdeaId);
  if (idx < 0) return;
  ideas.splice(idx, 1);
  closeModal(viewModal);
  renderIdeas();
  persistIdeas();
});

fulfillBtn.addEventListener('click', () => {
  const idea = ideas.find((entry) => entry.id === openIdeaId);
  if (!idea) return;
  const { x, y } = idea;
  const nextFulfilled = !idea.fulfilled;
  updateOpenIdea({ fulfilled: nextFulfilled });
  closeModal(viewModal);
  if (nextFulfilled) showCelebration(x, y);
});

editBtn.addEventListener('click', () => {
  if (viewTitle.readOnly) {
    viewTitle.readOnly = false;
    viewBody.readOnly = false;
    editBtn.textContent = 'Save';
    viewTitle.focus();
    return;
  }

  updateOpenIdea({
    title: viewTitle.value.trim() || 'Untitled Idea',
    body: viewBody.value.trim(),
  });

  viewTitle.readOnly = true;
  viewBody.readOnly = true;
  editBtn.textContent = 'Edit';
});

fullscreenBtn.addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    return;
  }
  await document.exitFullscreen();
});

function persistIdeas() {
  const payload = {
    idCounter,
    ideas: ideas.map(({ id, title, body, drawing, x, y, vx, vy, fulfilled }) => ({
      id,
      title,
      body,
      drawing,
      x,
      y,
      vx,
      vy,
      fulfilled,
    })),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restoreIdeas() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.ideas)) return;

    ideas.length = 0;
    data.ideas.forEach((idea) => {
      if (!idea || typeof idea !== 'object') return;
      ideas.push({
        id: Number(idea.id) || idCounter++,
        title: idea.title || 'Untitled Idea',
        body: idea.body || '',
        drawing: idea.drawing || drawings[Math.floor(Math.random() * drawings.length)],
        x: Number(idea.x) || random(140, window.innerWidth - 140),
        y: Number(idea.y) || random(140, window.innerHeight - 240),
        vx: Number(idea.vx) || random(-0.7, 0.7),
        vy: Number(idea.vy) || random(-0.7, 0.7),
        fulfilled: Boolean(idea.fulfilled),
      });
    });
    idCounter = Math.max(
      Number(data.idCounter) || idCounter,
      ideas.reduce((max, idea) => Math.max(max, idea.id), 0) + 1
    );
    renderIdeas();
  } catch (err) {
    console.warn('Failed to restore ideas', err);
  }
}

restoreIdeas();

function tick() {
  const min = 80;
  const maxX = window.innerWidth - 80;
  const maxY = window.innerHeight - 110;

  for (const idea of ideas) {
    idea.x += idea.vx;
    idea.y += idea.vy;

    if (idea.x < min || idea.x > maxX) idea.vx *= -1;
    if (idea.y < min || idea.y > maxY) idea.vy *= -1;
  }

  const nodes = ideasLayer.children;
  for (let i = 0; i < nodes.length; i += 1) {
    nodes[i].style.left = `${ideas[i].x}px`;
    nodes[i].style.top = `${ideas[i].y}px`;
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
