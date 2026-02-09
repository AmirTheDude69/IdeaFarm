const ideaBtn = document.getElementById('ideaBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const createModal = document.getElementById('createModal');
const viewModal = document.getElementById('viewModal');
const poof = document.getElementById('poof');
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

const drawingCount = 15;
const drawings = Array.from({ length: drawingCount }, (_, idx) => (
  `./assets/idea-drawings/idea-${String(idx + 1).padStart(2, '0')}.png`
));
const ideas = [];
let openIdeaId = null;
let idCounter = 1;

function random(min, max) {
  return Math.random() * (max - min) + min;
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

function addIdea({ title, body }) {
  const item = {
    id: idCounter++,
    title: title.trim() || `Idea ${idCounter}`,
    body: body.trim(),
    drawing: drawings[Math.floor(Math.random() * drawings.length)],
    x: random(120, window.innerWidth - 120),
    y: random(120, window.innerHeight - 220),
    vx: random(-0.35, 0.35),
    vy: random(-0.35, 0.35),
    fulfilled: false,
  };

  if (Math.abs(item.vx) < 0.1) item.vx = item.vx < 0 ? -0.18 : 0.18;
  if (Math.abs(item.vy) < 0.1) item.vy = item.vy < 0 ? -0.18 : 0.18;

  ideas.push(item);
  renderIdeas();
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
});

fulfillBtn.addEventListener('click', () => {
  const idea = ideas.find((entry) => entry.id === openIdeaId);
  if (!idea) return;
  updateOpenIdea({ fulfilled: !idea.fulfilled });
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

addIdea({ title: 'grocery', body: 'Get food and snacks for this week.' });
requestAnimationFrame(tick);
