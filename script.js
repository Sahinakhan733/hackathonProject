
const form = document.getElementById('portfolioForm');
const cardsContainer = document.getElementById('portfolioCards');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const modal = new bootstrap.Modal(document.getElementById('portfolioModal'));
const modalBody = document.getElementById('modalBody');

let portfolios = JSON.parse(localStorage.getItem('portfolios')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';

function setTheme(theme) {
  const body = document.body;
  const cards = document.querySelectorAll('.card');
  const inputs = document.querySelectorAll('.form-control, .form-select');
  const modalContent = document.querySelectorAll('.modal-content');

  if (theme === 'dark') {
    body.classList.add('bg-dark', 'text-light');
    body.classList.remove('bg-light');

    cards.forEach(card => card.classList.add('bg-dark', 'text-light'));
    inputs.forEach(input => input.classList.add('bg-dark', 'text-light', 'border-light'));
    modalContent.forEach(modal => modal.classList.add('bg-dark', 'text-light'));

    themeToggle.innerHTML = '<i class="bi bi-sun"></i> Toggle Theme';
  } else {
    body.classList.remove('bg-dark', 'text-light');
    body.classList.add('bg-light');

    cards.forEach(card => card.classList.remove('bg-dark', 'text-light'));
    inputs.forEach(input => input.classList.remove('bg-dark', 'text-light', 'border-light'));
    modalContent.forEach(modal => modal.classList.remove('bg-dark', 'text-light'));

    themeToggle.innerHTML = '<i class="bi bi-moon"></i> Toggle Theme';
  }

  localStorage.setItem('theme', theme);
  currentTheme = theme;
}
themeToggle.addEventListener('click', () => {
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
});
setTheme(currentTheme);

// Vibrant gradient palette
const gradients = [
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
  'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)',
  'linear-gradient(135deg, #fcb69f 0%, #ffecd2 100%)',
  'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
  'linear-gradient(135deg, #00c3ff 0%, #ffff1c 100%)',
  'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)'
];

// Function to render all portfolio cards
function renderPortfolios(filter = '') {
  cardsContainer.innerHTML = '';
  let filtered = portfolios.filter(portfolio => {
    const search = filter.toLowerCase();
    return (
      portfolio.name.toLowerCase().includes(search) ||
      portfolio.college.toLowerCase().includes(search) ||
      (portfolio.skills && portfolio.skills.join(',').toLowerCase().includes(search))
    );
  });
  filtered.forEach((portfolio, index) => {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    // Use user-selected color or fallback to gradient
    let cardBg = portfolio.cardColor || (portfolio.gradientIndex !== undefined ? gradients[portfolio.gradientIndex] : '#4f8cff');
    // Profile image or initials
    let avatarHtml = '';
    if (portfolio.profilePic) {
      avatarHtml = `<img src="${portfolio.profilePic}" class="rounded-circle me-2" style="width:48px;height:48px;object-fit:cover;">`;
    } else {
      const initials = portfolio.name.split(' ').map(n => n[0]).join('').toUpperCase();
      avatarHtml = `<div class="avatar-circle me-2">${initials}</div>`;
    }
    // Skills badges
    let skillsHtml = '';
    if (portfolio.skills && portfolio.skills.length) {
      skillsHtml = portfolio.skills.map(skill => `<span class="badge bg-primary me-1">${skill.trim()}</span>`).join(' ');
    }
    // Social links
    let socialsHtml = '';
    if (portfolio.linkedin) socialsHtml += `<a href="${portfolio.linkedin}" target="_blank" class="me-2"><i class="bi bi-linkedin"></i></a>`;
    if (portfolio.github) socialsHtml += `<a href="${portfolio.github}" target="_blank" class="me-2"><i class="bi bi-github"></i></a>`;
    if (portfolio.website) socialsHtml += `<a href="${portfolio.website}" target="_blank" class="me-2"><i class="bi bi-globe"></i></a>`;
    card.innerHTML = `
      <div class="card card-portfolio h-100 shadow-lg border-0" style="background: ${cardBg};" id="portfolioCard-${index}">
        <div class="card-header card-header-gradient d-flex align-items-center justify-content-center" style="background: ${cardBg};">
          ${avatarHtml}
          <span class="fw-bold text-white">${portfolio.name}</span>
        </div>
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted"><i class="bi bi-mortarboard"></i> ${portfolio.college}</h6>
          <p><i class="bi bi-lightbulb"></i> <strong>Project:</strong> ${portfolio.project}</p>
          <p><i class="bi bi-calendar-event"></i> <strong>Event:</strong> ${portfolio.event}</p>
          <p><i class="bi bi-trophy"></i> <strong>Achievements:</strong> ${portfolio.achievements}</p>
          <div class="mb-2">${skillsHtml}</div>
          <div class="mb-2">${socialsHtml}</div>
          <a href="${portfolio.certificate}" class="btn btn-sm btn-success mt-2" target="_blank"><i class="bi bi-link-45deg"></i> View Certificate</a>
          <button class="btn btn-sm btn-outline-primary ms-2" data-index="${index}" data-action="details"><i class="bi bi-info-circle"></i> View Details</button>
          <button class="btn btn-sm btn-outline-secondary ms-2" data-index="${index}" data-action="download-pdf"><i class="bi bi-download"></i> Download PDF</button>
        </div>
      </div>
    `;
    cardsContainer.appendChild(card);
  });
  // Add event listeners for details buttons
  document.querySelectorAll('button[data-action="details"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = this.getAttribute('data-index');
      showModal(filtered[idx]);
    });
  });
  // Add event listeners for download PDF buttons
  document.querySelectorAll('button[data-action="download-pdf"]').forEach(btn => {
    btn.addEventListener('click', async function() {
      const idx = this.getAttribute('data-index');
      const cardElem = document.getElementById(`portfolioCard-${idx}`);
      if (!cardElem) return;
      // Use html2canvas to capture the card
      const canvas = await html2canvas(cardElem, {backgroundColor: null, scale: 2});
      const imgData = canvas.toDataURL('image/png');
      // Use jsPDF to create PDF
      const pdf = new window.jspdf.jsPDF({orientation: 'portrait', unit: 'pt', format: 'a4'});
      // Calculate width/height to fit A4
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const imgHeight = canvas.height * (imgWidth / canvas.width);
      pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
      pdf.save(`${filtered[idx].name.replace(/\s+/g, '_')}_portfolio.pdf`);
    });
  });
  // Save updated gradients
  localStorage.setItem('portfolios', JSON.stringify(portfolios));
}

function showModal(portfolio) {
  let avatarHtml = '';
  if (portfolio.profilePic) {
    avatarHtml = `<img src="${portfolio.profilePic}" class="rounded-circle mb-3" style="width:96px;height:96px;object-fit:cover;">`;
  } else {
    const initials = portfolio.name.split(' ').map(n => n[0]).join('').toUpperCase();
    avatarHtml = `<div class="avatar-circle mb-3" style="width:96px;height:96px;font-size:2rem;">${initials}</div>`;
  }
  let skillsHtml = '';
  if (portfolio.skills && portfolio.skills.length) {
    skillsHtml = portfolio.skills.map(skill => `<span class="badge bg-primary me-1">${skill.trim()}</span>`).join(' ');
  }
  let socialsHtml = '';
  if (portfolio.linkedin) socialsHtml += `<a href="${portfolio.linkedin}" target="_blank" class="me-2"><i class="bi bi-linkedin"></i></a>`;
  if (portfolio.github) socialsHtml += `<a href="${portfolio.github}" target="_blank" class="me-2"><i class="bi bi-github"></i></a>`;
  if (portfolio.website) socialsHtml += `<a href="${portfolio.website}" target="_blank" class="me-2"><i class="bi bi-globe"></i></a>`;

  // Set modal background to match card color or gradient
  const cardBg = portfolio.cardColor || (portfolio.gradientIndex !== undefined ? gradients[portfolio.gradientIndex] : '#4f8cff');
  const modalDialog = document.querySelector('#portfolioModal .modal-content');
  const modalHeader = document.querySelector('#portfolioModal .modal-header');
  const modalBodyDiv = document.querySelector('#portfolioModal .modal-body');
  if (modalDialog) modalDialog.style.background = cardBg;
  if (modalHeader) modalHeader.style.background = cardBg;
  if (modalBodyDiv) modalBodyDiv.style.background = cardBg;
  if (modalHeader) modalHeader.style.borderBottom = 'none';

  modalBody.innerHTML = `
    <div class="text-center">${avatarHtml}</div>
    <h4 class="text-center">${portfolio.name}</h4>
    <h6 class="text-center text-muted">${portfolio.college}</h6>
    <div class="text-center mb-3">${skillsHtml}</div>
    <div class="text-center mb-3">${socialsHtml}</div>
    <p><strong>Project:</strong> ${portfolio.project}</p>
    <p><strong>Event:</strong> ${portfolio.event}</p>
    <p><strong>Achievements:</strong> ${portfolio.achievements}</p>
    <a href="${portfolio.certificate}" class="btn btn-success" target="_blank"><i class="bi bi-link-45deg"></i> View Certificate</a>
  `;
  modal.show();
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  let profilePic = '';
  const fileInput = form.profilePic;
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (event) {
      profilePic = event.target.result;
      savePortfolio(profilePic);
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    savePortfolio('');
  }
});

function savePortfolio(profilePic) {
  const portfolio = {
    name: form.name.value,
    college: form.college.value,
    project: form.project.value,
    event: form.event.value,
    certificate: form.certificate.value,
    achievements: form.achievements.value,
    skills: form.skills.value.split(',').map(s => s.trim()).filter(Boolean),
    linkedin: form.linkedin.value,
    github: form.github.value,
    website: form.website.value,
    profilePic: profilePic,
    cardColor: form.cardColor.value
    // gradientIndex for old portfolios
  };
  portfolios.push(portfolio);
  localStorage.setItem('portfolios', JSON.stringify(portfolios));
  renderPortfolios(searchInput.value);
  form.reset();
}

searchInput.addEventListener('input', function () {
  renderPortfolios(this.value);
});

// Initial rendering
renderPortfolios();
