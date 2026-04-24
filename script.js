const cursorGlow = document.querySelector('.cursor-glow');
const reveals = document.querySelectorAll('.reveal');
const nodes = document.querySelectorAll('.node-dot');
const readout = document.getElementById('timelineReadout');

window.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;

  const x = (e.clientX / window.innerWidth - 0.5) * 12;
  const y = (e.clientY / window.innerHeight - 0.5) * 12;

  document.querySelector('.orb-a').style.transform = `translate(${x * -1.1}px, ${y * -1.1}px)`;
  document.querySelector('.orb-b').style.transform = `translate(${x * 1.2}px, ${y * 1.2}px)`;
  document.querySelector('.hero-visual').style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.18 });

reveals.forEach(section => observer.observe(section));

nodes.forEach(node => {
  node.addEventListener('mouseenter', () => updateNode(node));
  node.addEventListener('click', () => updateNode(node));
});

function updateNode(node){
  nodes.forEach(n => n.classList.remove('active'));
  node.classList.add('active');
  const title = node.dataset.title;
  const copy = node.dataset.copy;
  readout.innerHTML = `
    <p class="readout-kicker">Selected Node</p>
    <h3>${title}</h3>
    <p>${copy}</p>
  `;
}