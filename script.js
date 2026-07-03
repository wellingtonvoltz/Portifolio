const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');

menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.classList.toggle('active', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', open);
});

menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.classList.remove('active');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  document.body.classList.remove('menu-open');
}));

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('visible');
  observer.unobserve(entry.target);
}), { threshold: .12 });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const carousel = document.querySelector('.project-carousel');
const track = carousel.querySelector('.carousel-track');
const slides = [...carousel.querySelectorAll('.project-slide')];
const previousButton = carousel.querySelector('.carousel-prev');
const nextButton = carousel.querySelector('.carousel-next');
const currentLabel = carousel.querySelector('.carousel-count strong');
const progress = carousel.querySelector('.carousel-progress span');
const carouselViewport = carousel.querySelector('.carousel-viewport');
let currentSlide = 0;
let dragStartX = 0;
let dragOffsetX = 0;
let isDragging = false;

slides.forEach((slide, index) => {
  const url = slide.dataset.projectUrl.trim();
  const liveLink = slide.querySelector('.project-live');
  const preview = slide.querySelector('.project-preview');

  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1} de ${slides.length}: ${slide.getAttribute('aria-label').replace('Projeto ', '')}`);

  if (url) {
    slide.classList.add('has-link');
    liveLink.href = url;
    liveLink.target = '_blank';
    liveLink.rel = 'noreferrer';
    liveLink.removeAttribute('aria-disabled');
    liveLink.querySelector('span').textContent = 'Acessar aplicação';
    liveLink.querySelector('i').className = 'bi bi-arrow-up-right';
    preview.tabIndex = 0;
    preview.setAttribute('role', 'link');
    preview.setAttribute('aria-label', 'Abrir aplicação em uma nova aba');
    const openProject = () => window.open(url, '_blank', 'noopener,noreferrer');
    preview.addEventListener('click', openProject);
    preview.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProject();
      }
    });
  } else {
    liveLink.addEventListener('click', event => event.preventDefault());
    slide.querySelector('.preview-overlay').remove();
  }
});

function updateCarousel() {
  track.style.transform = `translateX(-${slides[currentSlide].offsetLeft}px)`;
  currentLabel.textContent = String(currentSlide + 1).padStart(2, '0');
  progress.style.transform = `scaleX(${(currentSlide + 1) / slides.length})`;
  previousButton.disabled = currentSlide === 0;
  nextButton.disabled = currentSlide === slides.length - 1;
  slides.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index !== currentSlide)));
}

previousButton.addEventListener('click', () => {
  if (currentSlide > 0) { currentSlide--; updateCarousel(); }
});

nextButton.addEventListener('click', () => {
  if (currentSlide < slides.length - 1) { currentSlide++; updateCarousel(); }
});

carousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' && currentSlide > 0) { currentSlide--; updateCarousel(); }
  if (event.key === 'ArrowRight' && currentSlide < slides.length - 1) { currentSlide++; updateCarousel(); }
});

function finishDrag() {
  if (!isDragging) return;
  isDragging = false;
  carouselViewport.classList.remove('is-dragging');
  track.style.transition = '';

  const threshold = Math.min(45, carouselViewport.clientWidth * .09);
  if (dragOffsetX < -threshold && currentSlide < slides.length - 1) currentSlide++;
  if (dragOffsetX > threshold && currentSlide > 0) currentSlide--;
  dragOffsetX = 0;
  updateCarousel();
}

carouselViewport.addEventListener('pointerdown', event => {
  if (!window.matchMedia('(max-width: 700px)').matches || event.pointerType === 'mouse') return;
  isDragging = true;
  dragStartX = event.clientX;
  dragOffsetX = 0;
  track.style.transition = 'none';
  carouselViewport.classList.add('is-dragging');
  carouselViewport.setPointerCapture(event.pointerId);
});

carouselViewport.addEventListener('pointermove', event => {
  if (!isDragging) return;
  dragOffsetX = event.clientX - dragStartX;
  const atFirst = currentSlide === 0 && dragOffsetX > 0;
  const atLast = currentSlide === slides.length - 1 && dragOffsetX < 0;
  const resistance = atFirst || atLast ? .28 : 1;
  track.style.transform = `translateX(${-slides[currentSlide].offsetLeft + dragOffsetX * resistance}px)`;
});

carouselViewport.addEventListener('pointerup', finishDrag);
carouselViewport.addEventListener('pointercancel', finishDrag);
window.addEventListener('resize', updateCarousel);

updateCarousel();
document.querySelector('#year').textContent = new Date().getFullYear();
