import JSZip from 'jszip'
import doctorCss from '../pages/templates/DoctorTemplate.css?raw'
import photographerCss from '../pages/templates/PhotographerTemplate.css?raw'
import designerCss from '../pages/templates/GraphicDesignerTemplate.css?raw'
import writerCss from '../pages/templates/WriterTemplate.css?raw'
import developerCss from '../pages/templates/DeveloperTemplate.css?raw'
import lawyerCss from '../pages/templates/LawyerTemplate.css?raw'
import musicianCss from '../pages/templates/MusicianTemplate.css?raw'
import architectCss from '../pages/templates/ArchitectTemplate.css?raw'
import fitnessCss from '../pages/templates/FitnessTrainerTemplate.css?raw'
import chefCss from '../pages/templates/ChefTemplate.css?raw'
import { API_ORIGIN, resolveAssetUrl } from '../services/api'

function esc(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatLogDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function computeYearsExperience(experiences) {
  if (!experiences?.length) return null
  const starts = experiences.map(e => new Date(e.startDate)).filter(d => !isNaN(d.getTime()))
  if (!starts.length) return null
  const earliest = new Date(Math.min(...starts))
  const years = Math.floor((Date.now() - earliest.getTime()) / (365.25 * 24 * 3600 * 1000))
  return Math.max(1, years)
}

function getInitials(name) {
  if (!name) return '?'
  const cleaned = name.replace(/^Dr\.?\s*/i, '').trim()
  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length === 0) return name[0]?.toUpperCase() || '?'
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

// Read-only "build in public" log, styled with inline opacity-based muting so it looks right
// regardless of the surrounding template's light/dark palette - see components/ProjectBuildLog.jsx
// for the live-app equivalent (not reused directly since its CSS relies on global theme tokens
// that standalone exports don't have loaded).
function buildLogHtml(entries) {
  if (!entries?.length) return ''
  return `
    <div style="margin-top:12px;padding-top:12px;border-top:1px dashed currentColor;opacity:.9;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;opacity:.6;">Build Log</div>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">
        ${entries.map(e => `
          <li style="display:flex;gap:10px;font-size:13px;line-height:1.5;">
            <span style="flex-shrink:0;font-size:11px;white-space:nowrap;opacity:.6;padding-top:2px;">${formatLogDate(e.createdAt)}</span>
            <span>${esc(e.content)}</span>
          </li>`).join('')}
      </ul>
    </div>`
}

function pageShell({ title, css, extraStyle = '', bodyClass = '', bodyContent, script = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<style>${css}
body { margin: 0; }
${extraStyle}
</style>
</head>
<body>
<div class="${bodyClass}" style="margin: 0; width: 100%;">
${bodyContent}
</div>
${script}
</body>
</html>`
}

function buildDoctorHtml(portfolio) {
  const initials = getInitials(portfolio.title)
  const yearsExperience = computeYearsExperience(portfolio.experiences)
  const photoHtml = portfolio.photoUrl
    ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" class="dr-avatar-photo" />`
    : `<div class="dr-avatar-circle">${esc(initials)}</div>`

  const skillsHtml = portfolio.skills?.length ? `
    <section class="dr-section" id="dr-expertise">
      <div class="dr-container">
        <div class="dr-section-heading"><h2>Areas of Expertise</h2><div class="dr-underline"></div></div>
        <div class="dr-expertise-grid">
          ${portfolio.skills.map(s => `
            <div class="dr-card">
              <h3>${esc(s.skillName)}</h3>
              <p>Proficiency: ${esc(s.proficiencyLevel)}</p>
              ${s.endorsements > 0 ? `<div class="dr-badge-row"><span class="dr-badge">${s.endorsements} endorsement${s.endorsements === 1 ? '' : 's'}</span></div>` : ''}
            </div>`).join('')}
        </div>
      </div>
    </section>` : ''

  const experienceHtml = portfolio.experiences?.length ? `
    <section class="dr-section dr-timeline-section" id="dr-experience">
      <div class="dr-container">
        <div class="dr-section-heading"><h2>Professional Experience</h2><div class="dr-underline"></div></div>
        <div class="dr-timeline">
          ${portfolio.experiences.map(e => `
            <div class="dr-timeline-item">
              <div class="dr-timeline-icon">&#128188;</div>
              <div>
                <h4>${esc(e.jobTitle)}</h4>
                <p class="dr-timeline-role">${esc(e.companyName)}${e.location ? ` — ${esc(e.location)}` : ''}</p>
                <p class="dr-timeline-meta">${formatDate(e.startDate)} – ${e.isCurrent ? 'Present' : formatDate(e.endDate)}</p>
                ${e.description ? `<p class="dr-timeline-desc">${esc(e.description)}</p>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>
    </section>` : ''

  const educationHtml = portfolio.educations?.length ? `
    <section class="dr-section" id="dr-education">
      <div class="dr-container">
        <div class="dr-section-heading"><h2>Academic Foundation</h2><div class="dr-underline"></div></div>
        <div class="dr-timeline">
          ${portfolio.educations.map(ed => `
            <div class="dr-timeline-item">
              <div class="dr-timeline-icon">&#127891;</div>
              <div>
                <h4>${esc(ed.institutionName)}</h4>
                <p class="dr-timeline-role">${esc([ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in '))}</p>
                ${ed.graduationDate ? `<p class="dr-timeline-meta">${formatDate(ed.graduationDate)}</p>` : ''}
                ${ed.description ? `<p class="dr-timeline-desc">${esc(ed.description)}</p>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>
    </section>` : ''

  const projectsHtml = portfolio.projects?.length ? `
    <section class="dr-section dr-timeline-section" id="dr-projects">
      <div class="dr-container">
        <div class="dr-section-heading"><h2>Case Studies &amp; Publications</h2><div class="dr-underline"></div></div>
        <div class="dr-projects-grid">
          ${portfolio.projects.map(p => `
            <div class="dr-card">
              <h3>${esc(p.title)}</h3>
              ${p.description ? `<p>${esc(p.description)}</p>` : ''}
              ${p.technologies ? `<div class="dr-badge-row">${p.technologies.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="dr-badge">${esc(t)}</span>`).join('')}</div>` : ''}
              ${(p.projectUrl || p.githubUrl) ? `<div class="dr-project-links">${p.projectUrl ? `<a href="${esc(p.projectUrl)}" target="_blank" rel="noopener noreferrer">View</a>` : ''}${p.githubUrl ? `<a href="${esc(p.githubUrl)}" target="_blank" rel="noopener noreferrer">Source</a>` : ''}</div>` : ''}
              ${buildLogHtml(p.logEntries)}
            </div>`).join('')}
        </div>
      </div>
    </section>` : ''

  const bookingHtml = `
    <section class="dr-section dr-timeline-section" id="dr-booking">
      <div class="dr-container">
        <div class="dr-section-heading"><h2>Book an Appointment</h2><div class="dr-underline"></div></div>
        <div class="dr-booking-grid">
          <div class="dr-card">
            <label class="dr-field-label">Select a date</label>
            <input type="date" id="dr-export-date" class="dr-date-input" />
            <div class="dr-slot-grid" id="dr-export-slots"></div>
          </div>
          <form class="dr-card" id="dr-export-form">
            <label class="dr-field-label">Your Name</label>
            <input type="text" required id="dr-export-name" class="dr-text-input" />
            <label class="dr-field-label">Email</label>
            <input type="email" required id="dr-export-email" class="dr-text-input" />
            <label class="dr-field-label">Reason for Visit (optional)</label>
            <textarea rows="3" id="dr-export-note" class="dr-text-input"></textarea>
            <p id="dr-export-error" class="dr-booking-error" style="display:none"></p>
            <p id="dr-export-success" style="display:none;color:var(--dr-secondary);font-weight:600;margin-top:16px;"></p>
            <button type="submit" class="dr-btn dr-btn-primary" id="dr-export-submit" disabled>Confirm Booking</button>
          </form>
        </div>
      </div>
    </section>`

  const bookingScript = `
    <script>
      (function () {
        var API = ${JSON.stringify(API_ORIGIN)};
        var PORTFOLIO_ID = ${JSON.stringify(portfolio.id)};
        var ALL_SLOTS = ["09:00 AM","10:30 AM","01:15 PM","02:45 PM","04:00 PM","05:30 PM"];
        var dateInput = document.getElementById('dr-export-date');
        var slotsEl = document.getElementById('dr-export-slots');
        var submitBtn = document.getElementById('dr-export-submit');
        var errorEl = document.getElementById('dr-export-error');
        var successEl = document.getElementById('dr-export-success');
        var form = document.getElementById('dr-export-form');
        var selectedSlot = null;
        var today = new Date().toISOString().slice(0, 10);
        dateInput.min = today;
        dateInput.value = today;

        function renderSlots(booked) {
          slotsEl.innerHTML = '';
          ALL_SLOTS.forEach(function (slot) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dr-slot' + (booked.indexOf(slot) > -1 ? ' taken' : '');
            btn.textContent = slot;
            btn.disabled = booked.indexOf(slot) > -1;
            btn.onclick = function () {
              selectedSlot = slot;
              submitBtn.disabled = false;
              Array.prototype.forEach.call(slotsEl.children, function (c) { c.classList.remove('selected'); });
              btn.classList.add('selected');
            };
            slotsEl.appendChild(btn);
          });
        }

        function loadAvailability() {
          selectedSlot = null;
          submitBtn.disabled = true;
          fetch(API + '/api/portfolios/' + PORTFOLIO_ID + '/appointments/availability?date=' + dateInput.value)
            .then(function (r) { return r.json(); })
            .then(function (data) { renderSlots(data.bookedSlots || []); })
            .catch(function () { errorEl.style.display = 'block'; errorEl.textContent = 'Could not load availability.'; });
        }

        dateInput.addEventListener('change', loadAvailability);
        loadAvailability();

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          errorEl.style.display = 'none';
          fetch(API + '/api/portfolios/' + PORTFOLIO_ID + '/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visitorName: document.getElementById('dr-export-name').value,
              visitorEmail: document.getElementById('dr-export-email').value,
              note: document.getElementById('dr-export-note').value,
              appointmentDate: dateInput.value,
              timeSlot: selectedSlot
            })
          }).then(function (r) {
            if (r.status === 409) { throw new Error('That time slot was just booked — please pick another.'); }
            if (!r.ok) { throw new Error('Could not book this appointment.'); }
            return r.json();
          }).then(function () {
            form.style.display = 'none';
            successEl.style.display = 'block';
            successEl.textContent = 'Booking confirmed for ' + dateInput.value + ' at ' + selectedSlot + '.';
          }).catch(function (err) {
            errorEl.style.display = 'block';
            errorEl.textContent = err.message;
            loadAvailability();
          });
        });
      })();
    </script>`

  const body = `
  <nav class="dr-nav">
    <div class="dr-nav-inner">
      <span class="dr-brand">${esc(portfolio.title)}</span>
      <div class="dr-nav-links">
        ${portfolio.skills?.length ? '<a href="#dr-expertise">Expertise</a>' : ''}
        ${portfolio.experiences?.length ? '<a href="#dr-experience">Experience</a>' : ''}
        ${portfolio.educations?.length ? '<a href="#dr-education">Education</a>' : ''}
        ${portfolio.projects?.length ? '<a href="#dr-projects">Case Studies</a>' : ''}
        <a href="#dr-booking">Book Appointment</a>
      </div>
    </div>
  </nav>

  <section class="dr-section dr-hero">
    <div class="dr-container dr-hero-grid">
      <div>
        ${portfolio.template?.category ? `<span class="dr-eyebrow">${esc(portfolio.template.category)}</span>` : ''}
        <h1>${esc(portfolio.headline || portfolio.title)}</h1>
        ${portfolio.aboutMe ? `<p class="dr-hero-about">${esc(portfolio.aboutMe)}</p>` : ''}
        <div class="dr-hero-stats">
          ${yearsExperience ? `<div class="dr-stat"><span class="dr-stat-value">${yearsExperience}+</span><span class="dr-stat-label">Years Experience</span></div>` : ''}
          ${portfolio.skills?.length ? `<div class="dr-stat"><span class="dr-stat-value">${portfolio.skills.length}</span><span class="dr-stat-label">Areas of Expertise</span></div>` : ''}
          <div class="dr-stat"><span class="dr-stat-value">${portfolio.viewCount}</span><span class="dr-stat-label">Profile Views</span></div>
        </div>
      </div>
      <div class="dr-hero-avatar">${photoHtml}</div>
    </div>
  </section>

  ${skillsHtml}
  ${experienceHtml}
  ${educationHtml}
  ${projectsHtml}
  ${bookingHtml}

  <footer class="dr-footer">
    <div class="dr-footer-inner">
      <div class="dr-footer-brand">${esc(portfolio.title)}</div>
      ${portfolio.headline ? `<p class="dr-footer-tagline">${esc(portfolio.headline)}</p>` : ''}
      <p class="dr-footer-meta">${portfolio.viewCount} profile views &middot; Built with PortfolioX</p>
    </div>
  </footer>`

  return pageShell({
    title: portfolio.title,
    css: doctorCss,
    extraStyle: '.dr-timeline-icon { font-size: 18px; }',
    bodyClass: 'doctor-template',
    bodyContent: body,
    script: bookingScript
  })
}

function buildPhotographerHtml(portfolio) {
  const initials = getInitials(portfolio.title)
  const yearsActive = computeYearsExperience(portfolio.experiences)
  const galleryPhotos = portfolio.galleryPhotos || []
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0

  const body = `
  <nav class="ph-nav">
    <div class="ph-nav-inner">
      <span class="ph-brand">${esc(portfolio.title)}</span>
      <div class="ph-nav-links">
        <a href="#ph-gallery">Gallery</a>
        ${hasSkills ? '<a href="#ph-expertise">Specialties</a>' : ''}
        ${hasExperience ? '<a href="#ph-experience">Experience</a>' : ''}
        ${hasEducation ? '<a href="#ph-education">Education</a>' : ''}
      </div>
    </div>
  </nav>

  <section class="ph-hero">
    <div class="ph-pane">
      <div>
        <span class="ph-eyebrow">Portfolio / 01</span>
        <h1 class="ph-hero-title">${esc(portfolio.headline || portfolio.title)}</h1>
      </div>
      <span class="ph-hero-year">'${new Date().getFullYear().toString().slice(-2)}</span>
    </div>

    <div class="ph-pane ph-pane-photo">
      ${portfolio.photoUrl
        ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" />`
        : `<div class="ph-pane-photo-fallback">${esc(initials)}</div>`}
      ${portfolio.aboutMe ? `<div class="ph-pane-photo-caption">${esc(portfolio.title)}</div>` : ''}
    </div>

    <div class="ph-pane ph-pane-stats">
      <div class="ph-stat-row"><span class="ph-stat-label">Photos Showcased</span><span class="ph-stat-value">${galleryPhotos.length}</span></div>
      ${yearsActive ? `<div class="ph-stat-row"><span class="ph-stat-label">Years Active</span><span class="ph-stat-value">${yearsActive}+</span></div>` : ''}
      <div class="ph-stat-row"><span class="ph-stat-label">Profile Views</span><span class="ph-stat-value">${portfolio.viewCount}</span></div>
    </div>
  </section>

  ${portfolio.aboutMe ? `
  <section class="ph-section">
    <div class="ph-container ph-philosophy-grid">
      <div class="ph-philosophy-heading">
        <span class="ph-eyebrow">Philosophy / 02</span>
        <h2>The Art of Seeing.</h2>
      </div>
      <div class="ph-philosophy-body"><p>${esc(portfolio.aboutMe)}</p></div>
    </div>
  </section>` : ''}

  <section class="ph-section" id="ph-gallery" style="border-top:1px dashed var(--ph-medium-gray)">
    <div class="ph-container">
      <span class="ph-eyebrow">Showcase / 03</span>
      <h2 style="margin-bottom:40px">Selected Work</h2>
      <div class="ph-gallery-grid">
        ${galleryPhotos.length === 0 ? '<div class="ph-gallery-empty">Showcase photos coming soon.</div>' : ''}
        ${galleryPhotos.map(g => `
          <div class="ph-gallery-card">
            <img src="${esc(resolveAssetUrl(g.imageUrl))}" alt="${esc(g.caption || portfolio.title)}" />
            ${g.caption ? `<div class="ph-gallery-caption">${esc(g.caption)}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>

  ${hasSkills ? `
  <section class="ph-section" id="ph-expertise">
    <div class="ph-container">
      <span class="ph-eyebrow">Specialties / 04</span>
      <h2 style="margin-bottom:40px">Areas of Focus</h2>
      <div class="ph-expertise-grid">
        ${portfolio.skills.map(s => `
          <div class="ph-expertise-card">
            <div style="font-size:24px">&#128247;</div>
            <h3>${esc(s.skillName)}</h3>
            <p>${esc(s.proficiencyLevel)}</p>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasExperience ? `
  <section class="ph-section ph-timeline-section" id="ph-experience">
    <div class="ph-container">
      <span class="ph-eyebrow">Experience / 05</span>
      <h2 style="margin-bottom:40px">Studio Timeline</h2>
      <div class="ph-timeline">
        ${portfolio.experiences.map(e => `
          <div class="ph-timeline-item">
            <div class="ph-timeline-meta">${formatDate(e.startDate)} – ${e.isCurrent ? 'Present' : formatDate(e.endDate)}</div>
            <div>
              <h4>${esc(e.jobTitle)}</h4>
              <p class="ph-timeline-role">${esc(e.companyName)}${e.location ? ` — ${esc(e.location)}` : ''}</p>
              ${e.description ? `<p class="ph-timeline-desc">${esc(e.description)}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasEducation ? `
  <section class="ph-section" id="ph-education">
    <div class="ph-container">
      <span class="ph-eyebrow">Education / 06</span>
      <h2 style="margin-bottom:40px">Academic Foundation</h2>
      <div class="ph-timeline">
        ${portfolio.educations.map(ed => `
          <div class="ph-timeline-item">
            <div class="ph-timeline-meta">${ed.graduationDate ? formatDate(ed.graduationDate) : ''}</div>
            <div>
              <h4>${esc(ed.institutionName)}</h4>
              <p class="ph-timeline-role">${esc([ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in '))}</p>
              ${ed.description ? `<p class="ph-timeline-desc">${esc(ed.description)}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <section class="ph-vision">
    <blockquote>"${esc(portfolio.headline || 'Art is not what you see, but what you make others see.')}"</blockquote>
    <div class="ph-vision-divider"></div>
  </section>

  <footer class="ph-footer">
    <span class="ph-footer-brand">${esc(portfolio.title)}</span>
    <span class="ph-footer-meta">&#128065; ${portfolio.viewCount} profile views &middot; Built with PortfolioX</span>
  </footer>`

  return pageShell({ title: portfolio.title, css: photographerCss, bodyClass: 'photographer-template', bodyContent: body })
}

function buildGraphicDesignerHtml(portfolio) {
  const initials = getInitials(portfolio.title)
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasProjects = portfolio.projects?.length > 0

  const body = `
  <nav class="gd-nav">
    <div class="gd-nav-inner">
      <span class="gd-brand">${esc(portfolio.title)}</span>
      <div class="gd-nav-links">
        ${hasSkills ? '<a href="#gd-expertise">Expertise</a>' : ''}
        ${hasExperience ? '<a href="#gd-experience">Experience</a>' : ''}
        ${hasProjects ? '<a href="#gd-portfolio">Portfolio</a>' : ''}
      </div>
    </div>
  </nav>

  <section class="gd-section" style="padding-bottom:48px">
    <div class="gd-container">
      <h1 class="gd-hero-title">${esc(portfolio.headline || portfolio.title)}</h1>
      <div class="gd-hero-row">
        ${portfolio.aboutMe ? `<p class="gd-hero-blurb">${esc(portfolio.aboutMe)}</p>` : ''}
        <div class="gd-hero-person">
          <div class="gd-avatar">
            ${portfolio.photoUrl
              ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" />`
              : `<div class="gd-avatar-fallback">${esc(initials)}</div>`}
          </div>
          <div>
            <p class="gd-hero-person-name">${esc(portfolio.title)}</p>
            ${portfolio.template?.category ? `<p class="gd-hero-person-tag">${esc(portfolio.template.category)} Specialist</p>` : ''}
          </div>
        </div>
      </div>
    </div>
  </section>

  ${portfolio.aboutMe ? `
  <section class="gd-section" style="background:#fff">
    <div class="gd-container gd-about-grid">
      <div>
        <span class="gd-pill">About Me</span>
        <h2 class="gd-about-heading" style="margin-top:24px">${esc(portfolio.aboutMe)}</h2>
        <div class="gd-about-media">
          ${portfolio.photoUrl
            ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" />`
            : `<span class="gd-about-media-fallback">${esc(initials)}</span>`}
        </div>
      </div>
      <div style="padding-top:48px">
        <div class="gd-stat-block"><h3 class="gd-stat-value">${portfolio.projects?.length || 0}</h3><p class="gd-stat-label">Portfolio pieces completed and showcased.</p></div>
        <div class="gd-stat-block"><h3 class="gd-stat-value">${portfolio.skills?.length || 0}</h3><p class="gd-stat-label">Core areas of design expertise.</p></div>
        <div class="gd-stat-block"><h3 class="gd-stat-value">${portfolio.viewCount}</h3><p class="gd-stat-label">Profile views and counting.</p></div>
      </div>
    </div>
  </section>` : ''}

  ${hasSkills ? `
  <section class="gd-section" id="gd-expertise">
    <div class="gd-container">
      <span class="gd-pill">Expertise</span>
      <h2 style="font-size:40px;margin:24px 0 40px">A look at my core design skills</h2>
      <div class="gd-skills-grid">
        ${portfolio.skills.map(s => `
          <div class="gd-skill-card"><h4>${esc(s.skillName)}</h4><span class="gd-skill-level">${esc(s.proficiencyLevel)}</span></div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasExperience ? `
  <section class="gd-section" id="gd-experience" style="background:#fff">
    <div class="gd-container">
      <span class="gd-pill">Experience</span>
      <h2 style="font-size:40px;margin:24px 0 40px">A yearly snapshot of my creative growth</h2>
      <div>
        ${portfolio.experiences.map(e => `
          <div class="gd-exp-row">
            <div><h4>${esc(e.jobTitle)} at ${esc(e.companyName)}</h4><p>${esc(e.description)}</p></div>
            <div class="gd-exp-date">${formatDate(e.startDate)} – ${e.isCurrent ? 'Now' : formatDate(e.endDate)}</div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasProjects ? `
  <section class="gd-section" id="gd-portfolio">
    <div class="gd-container">
      <span class="gd-pill">Portfolio</span>
      <h2 style="font-size:40px;margin:24px 0 40px">Explore my portfolio of creative solutions</h2>
      <div class="gd-portfolio-grid">
        ${portfolio.projects.map((p, i) => {
          const link = p.projectUrl || p.githubUrl
          return `
          <div class="gd-portfolio-item ${i % 4 === 3 ? 'wide' : ''}">
            <div class="gd-portfolio-media">
              ${p.imageUrl
                ? `<img src="${esc(resolveAssetUrl(p.imageUrl))}" alt="${esc(p.title)}" />`
                : `<span class="gd-portfolio-media-fallback">${esc(p.title?.[0]?.toUpperCase() || '?')}</span>`}
            </div>
            <div class="gd-portfolio-meta">
              <h5>${esc(p.title)}</h5>
              ${link ? `<a class="gd-portfolio-link" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${p.githubUrl && !p.projectUrl ? 'Source &#8599;' : 'View &#8599;'}</a>` : ''}
              ${buildLogHtml(p.logEntries)}
            </div>
          </div>`
        }).join('')}
      </div>
    </div>
  </section>` : ''}

  <section class="gd-section"><div class="gd-connect"><h2>Let's Connect</h2></div></section>

  <footer class="gd-footer">
    <span class="gd-footer-brand">${esc(portfolio.title)}</span>
    <span class="gd-footer-meta">&#128065; ${portfolio.viewCount} profile views &middot; Built with PortfolioX</span>
  </footer>`

  return pageShell({ title: portfolio.title, css: designerCss, bodyClass: 'designer-template', bodyContent: body })
}

function buildWriterHtml(portfolio) {
  const initials = getInitials(portfolio.title)
  const hasBooks = portfolio.books?.length > 0
  const hasExperience = portfolio.experiences?.length > 0

  const body = `
  <nav class="wr-nav">
    <div class="wr-nav-inner">
      <span class="wr-brand">${esc(portfolio.title)}</span>
      <div class="wr-nav-links">
        <a href="#wr-bookshelf">Bookshelf</a>
        ${hasExperience ? '<a href="#wr-experience">Experience</a>' : ''}
      </div>
    </div>
  </nav>

  <section class="wr-section" style="padding-bottom:64px">
    <div class="wr-container wr-hero">
      <div>
        ${portfolio.template?.category ? `<span class="wr-label" style="display:block;margin-bottom:16px">Author &amp; ${esc(portfolio.template.category)}</span>` : ''}
        <h1 class="wr-hero-title">${esc(portfolio.headline || portfolio.title)}</h1>
        ${portfolio.aboutMe ? `<p class="wr-hero-blurb">${esc(portfolio.aboutMe)}</p>` : ''}
        <div class="wr-hero-actions">
          <a href="#wr-bookshelf" class="wr-btn wr-btn-solid">Explore the Bookshelf</a>
          ${hasExperience ? '<a href="#wr-experience" class="wr-btn wr-btn-ghost">Literary Timeline</a>' : ''}
        </div>
      </div>
      <div class="wr-portrait">
        ${portfolio.photoUrl
          ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" />`
          : `<div class="wr-portrait-fallback">${esc(initials)}</div>`}
        <div class="wr-portrait-frame"></div>
      </div>
    </div>
  </section>

  <div class="wr-container"><div class="wr-divider"></div></div>

  <section class="wr-section" id="wr-bookshelf">
    <div class="wr-container">
      <div class="wr-bookshelf-header">
        <div>
          <span class="wr-label" style="display:block;margin-bottom:8px">Selected Bibliography</span>
          <h2 style="font-size:32px">The Bookshelf</h2>
        </div>
      </div>
      <div class="wr-books-grid">
        ${!hasBooks ? '<div class="wr-bookshelf-empty">The bookshelf is being curated — check back soon.</div>' : ''}
        ${(portfolio.books || []).map(b => `
          <div class="wr-book-card">
            <div class="wr-book-cover">
              ${b.coverImageUrl
                ? `<img src="${esc(resolveAssetUrl(b.coverImageUrl))}" alt="${esc(b.title)}" />`
                : `<span class="wr-book-cover-fallback">${esc(b.title?.[0]?.toUpperCase() || '?')}</span>`}
            </div>
            ${(b.genre || b.publishedYear) ? `<span class="wr-label wr-book-meta">${esc([b.genre, b.publishedYear].filter(Boolean).join(' | '))}</span>` : ''}
            <h3 class="wr-book-title">${esc(b.title)}</h3>
            ${b.description ? `<p class="wr-book-desc">${esc(b.description)}</p>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>

  ${hasExperience ? `
  <div class="wr-container"><div class="wr-divider"></div></div>
  <section class="wr-section" id="wr-experience">
    <div class="wr-container">
      <div style="text-align:center;margin-bottom:64px">
        <span class="wr-label">Career in Letters</span>
        <h2 style="font-size:32px;margin-top:8px">Literary Timeline</h2>
      </div>
      <div class="wr-toc">
        ${portfolio.experiences.map(e => `
          <div class="wr-toc-entry">
            <div class="wr-toc-row">
              <span class="wr-toc-title">${esc(e.jobTitle)} at ${esc(e.companyName)}</span>
              <span class="wr-toc-date">${formatDate(e.startDate)} – ${e.isCurrent ? 'Present' : formatDate(e.endDate)}</span>
            </div>
            ${e.description ? `<p class="wr-toc-desc">${esc(e.description)}</p>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <footer class="wr-footer">
    <span class="wr-footer-brand">${esc(portfolio.title)}</span>
    <span class="wr-footer-meta">&#128065; ${portfolio.viewCount} profile views &middot; Built with PortfolioX</span>
  </footer>`

  return pageShell({ title: portfolio.title, css: writerCss, bodyClass: 'writer-template', bodyContent: body })
}

function buildDeveloperHtml(portfolio) {
  const initials = getInitials(portfolio.title)
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const projects = portfolio.projects || []
  const featured = projects[0]
  const restProjects = featured ? projects.slice(1) : []

  const body = `
  <div class="dv-frame">
    <nav class="dv-nav">
      <div class="dv-nav-brand">
        ${portfolio.photoUrl
          ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;" />`
          : `<span class="dv-mono" style="font-size:12px;font-weight:700">${esc(initials)}</span>`}
        <span class="dv-status-dot"></span>
        <span class="dv-status-label">Available Now</span>
      </div>
      <div class="dv-nav-links">
        <a href="#">Home</a>
        ${projects.length > 0 ? '<a href="#dv-projects">Projects</a>' : ''}
        <a href="#dv-contact">Contact</a>
      </div>
      <a href="#dv-contact" class="dv-btn-primary">Get In Touch</a>
    </nav>

    <section class="dv-hero">
      <div class="dv-container">
        <div class="dv-hero-grid">
          <div class="dv-hero-id">
            <div class="dv-hero-photo">
              <div class="dv-hero-photo-backdrop"></div>
              ${portfolio.photoUrl
                ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" />`
                : `<div class="dv-hero-photo-fallback">${esc(initials)}</div>`}
            </div>
            <div>
              <span class="dv-hero-im">I'M</span>
              <h1 class="dv-hero-name">${esc(portfolio.title)}</h1>
            </div>
          </div>
          <div class="dv-hero-tagline"><span>${esc(portfolio.headline || 'Full-Stack Developer')}</span></div>
        </div>

        ${featured ? `
        <div class="dv-featured">
          <div class="dv-featured-inner">
            <div class="dv-featured-head">
              <div><span class="dv-mono dv-featured-eyebrow">FEATURED PROJECT // 01</span></div>
              ${(featured.projectUrl || featured.githubUrl) ? `<a href="${esc(featured.projectUrl || featured.githubUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--dv-orange);font-weight:700;font-size:13px;text-decoration:none;">Explore the Work &#8594;</a>` : ''}
            </div>
            <div class="dv-featured-panel">
              <h3>${esc(featured.title)}</h3>
              ${featured.description ? `<p>${esc(featured.description)}</p>` : ''}
              ${featured.technologies ? `<div class="dv-project-tags" style="margin-top:24px">${featured.technologies.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="dv-project-tag" style="color:#9ca3af;border-color:#334155;">${esc(t)}</span>`).join('')}</div>` : ''}
              ${buildLogHtml(featured.logEntries)}
            </div>
          </div>
        </div>` : ''}
      </div>
    </section>

    ${hasSkills ? `
    <section class="dv-section-dark" id="dv-skills">
      <div class="dv-container">
        <div class="dv-section-head"><div class="dv-section-icon">&#9638;</div><h2 style="font-size:28px">Tech Stack</h2></div>
        <div class="dv-skills-grid">
          ${portfolio.skills.map(s => `<span class="dv-skill-chip"><span class="dot"></span>${esc(s.skillName)} — ${esc(s.proficiencyLevel)}</span>`).join('')}
        </div>
      </div>
    </section>` : ''}

    ${restProjects.length > 0 ? `
    <section class="dv-section-dark" id="dv-projects" style="padding-top:${hasSkills ? '0' : 'undefined'}">
      <div class="dv-container">
        <div class="dv-section-head"><div class="dv-section-icon">&#9638;</div><h2 style="font-size:28px">Recent Projects</h2></div>
        <div class="dv-projects-grid">
          ${restProjects.map(p => {
            const link = p.projectUrl || p.githubUrl
            return `
            <div>
              <div class="dv-project-media">
                ${p.imageUrl
                  ? `<img src="${esc(resolveAssetUrl(p.imageUrl))}" alt="${esc(p.title)}" />`
                  : `<div class="dv-project-media-fallback">${esc(p.title?.[0]?.toUpperCase() || '?')}</div>`}
                ${link ? `<a class="dv-project-overlay" href="${esc(link)}" target="_blank" rel="noopener noreferrer"><span>View Project</span></a>` : ''}
              </div>
              <h3 class="dv-project-title">${esc(p.title)}</h3>
              ${p.technologies ? `<div class="dv-project-tags">${p.technologies.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="dv-project-tag">${esc(t)}</span>`).join('')}</div>` : ''}
              ${buildLogHtml(p.logEntries)}
            </div>`
          }).join('')}
        </div>
      </div>
    </section>` : ''}

    ${hasExperience ? `
    <section class="dv-section-light">
      <div class="dv-container">
        <div class="dv-section-head"><div class="dv-section-icon">&#9993;</div><h2 style="font-size:28px;color:var(--dv-black)">Experience</h2></div>
        <div>
          ${portfolio.experiences.map(e => `
            <div class="dv-timeline-item">
              <div>
                <h4 class="dv-timeline-role">${esc(e.jobTitle)}</h4>
                <p class="dv-timeline-company">${esc(e.companyName)}${e.location ? ` — ${esc(e.location)}` : ''}</p>
                ${e.description ? `<p class="dv-timeline-desc">${esc(e.description)}</p>` : ''}
              </div>
              <div class="dv-timeline-date">${formatDate(e.startDate)} – ${e.isCurrent ? 'Present' : formatDate(e.endDate)}</div>
            </div>`).join('')}
        </div>
      </div>
    </section>` : ''}

    <section class="dv-cta" id="dv-contact">
      <div class="dv-cta-bg-text dv-mono" style="font-family:Anybody, sans-serif;font-weight:900;text-transform:uppercase;">${esc(portfolio.title)}</div>
      <h3>LET'S BUILD SOMETHING<br />GREAT TOGETHER</h3>
      <p class="dv-mono" style="color:var(--dv-gray);font-size:13px;">${portfolio.viewCount} profile views &middot; Built with PortfolioX</p>
    </section>

    <footer class="dv-footer">
      <span class="dv-footer-brand">${esc(portfolio.title)}</span>
      <span class="dv-footer-meta">© ${new Date().getFullYear()} ${esc(portfolio.title)}. All rights reserved.</span>
    </footer>
  </div>`

  return pageShell({ title: portfolio.title, css: developerCss, bodyClass: 'developer-template', bodyContent: body })
}

function buildLawyerHtml(portfolio) {
  const initials = getInitials(portfolio.title)
  const yearsExperience = computeYearsExperience(portfolio.experiences)
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const expertiseIcons = ['&#9878;', '&#128188;', '&#128737;', '&#129309;', '&#127968;', '&#128196;']

  const body = `
  <nav class="lw-nav">
    <div class="lw-nav-inner">
      <span class="lw-brand">${esc(portfolio.title)}</span>
      <div class="lw-nav-links">
        ${hasSkills ? '<a href="#lw-expertise">Expertise</a>' : ''}
        ${hasExperience ? '<a href="#lw-experience">Experience</a>' : ''}
        <a href="#lw-contact">Contact</a>
      </div>
      <a href="#lw-contact" class="lw-btn-gold">Consultation</a>
    </div>
  </nav>

  <section class="lw-section lw-hero">
    <div class="lw-container lw-hero-grid">
      <div>
        <div>
          <span class="lw-hero-rule"></span>
          <span class="lw-eyebrow" style="color:var(--lw-secondary-fixed)">Justice, Expertise, Results</span>
        </div>
        <h1 class="lw-hero-title">${esc(portfolio.headline || portfolio.title)}</h1>
        ${portfolio.aboutMe ? `<p class="lw-hero-body">${esc(portfolio.aboutMe)}</p>` : ''}
        <div class="lw-hero-actions">
          ${hasSkills ? '<a href="#lw-expertise" class="lw-btn-gold">Explore Expertise</a>' : ''}
          <a href="#lw-contact" class="lw-btn-outline">Contact Now</a>
        </div>
      </div>
      <div class="lw-hero-photo-wrap">
        <div class="lw-hero-photo">
          ${portfolio.photoUrl
            ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" />`
            : `<div class="lw-hero-photo-fallback">${esc(initials)}</div>`}
        </div>
        ${yearsExperience ? `<div class="lw-hero-stat"><div class="lw-hero-stat-value">${yearsExperience}+</div><div class="lw-hero-stat-label">Years Experience</div></div>` : ''}
      </div>
    </div>
  </section>

  <section class="lw-stats-bar">
    <div class="lw-stats-grid">
      ${yearsExperience ? `<div><div class="lw-stat-value">${yearsExperience}+</div><p class="lw-stat-label">Years of Experience</p></div>` : ''}
      ${hasSkills ? `<div><div class="lw-stat-value">${portfolio.skills.length}</div><p class="lw-stat-label">Areas of Expertise</p></div>` : ''}
      ${portfolio.projects?.length > 0 ? `<div><div class="lw-stat-value">${portfolio.projects.length}</div><p class="lw-stat-label">Case Studies</p></div>` : ''}
      <div><div class="lw-stat-value">${portfolio.viewCount}</div><p class="lw-stat-label">Profile Views</p></div>
    </div>
  </section>

  ${portfolio.aboutMe ? `
  <section class="lw-section">
    <div class="lw-container lw-intro-grid">
      <div><h2 class="lw-intro-heading">Your advocate. Your voice. Your legal ally.</h2></div>
      <div>
        <p class="lw-intro-body">${esc(portfolio.aboutMe)}</p>
        <div class="lw-checklist">
          <div class="lw-checklist-item">&#10003;<span>Personalized legal support</span></div>
          <div class="lw-checklist-item">&#10003;<span>No-cost initial consultation</span></div>
          <div class="lw-checklist-item">&#10003;<span>Transparent, fair fees</span></div>
          <div class="lw-checklist-item">&#10003;<span>Client-first representation</span></div>
        </div>
      </div>
    </div>
  </section>` : ''}

  ${hasSkills ? `
  <section class="lw-section" id="lw-expertise" style="background:var(--lw-surface-container-low)">
    <div class="lw-container">
      <div class="lw-expertise-header">
        <span class="lw-eyebrow">Our Services</span>
        <h2 style="font-size:36px;margin-top:8px">Areas of Expertise</h2>
      </div>
      <div class="lw-expertise-grid">
        ${portfolio.skills.map((s, i) => `
          <div class="lw-expertise-card">
            <div style="font-size:28px">${expertiseIcons[i % expertiseIcons.length]}</div>
            <h3>${esc(s.skillName)}</h3>
            <p>Proficiency: ${esc(s.proficiencyLevel)}</p>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasExperience ? `
  <section class="lw-section lw-section-dark" id="lw-experience">
    <div class="lw-container">
      <span class="lw-eyebrow" style="color:var(--lw-secondary-fixed)">Case History</span>
      <h2 style="font-size:36px;margin-top:8px;margin-bottom:40px">Professional Experience</h2>
      <div>
        ${portfolio.experiences.map(e => `
          <div class="lw-case-item">
            <div>
              <h4 class="lw-case-role">${esc(e.jobTitle)}</h4>
              <p class="lw-case-company">${esc(e.companyName)}${e.location ? ` — ${esc(e.location)}` : ''}</p>
              ${e.description ? `<p class="lw-case-desc">${esc(e.description)}</p>` : ''}
            </div>
            <div class="lw-case-date">${formatDate(e.startDate)} – ${e.isCurrent ? 'Present' : formatDate(e.endDate)}</div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <section class="lw-section lw-cta" id="lw-contact">
    <blockquote>"${esc(portfolio.headline || 'Justice, Expertise, Results.')}"</blockquote>
    <p class="lw-eyebrow" style="color:var(--lw-on-surface-variant)">${portfolio.viewCount} profile views &middot; Built with PortfolioX</p>
  </section>

  <footer class="lw-footer">
    <span class="lw-footer-brand">${esc(portfolio.title)}</span>
    <span class="lw-footer-meta">&#128065; © ${new Date().getFullYear()} ${esc(portfolio.title)}. All rights reserved.</span>
  </footer>`

  return pageShell({ title: portfolio.title, css: lawyerCss, bodyClass: 'lawyer-template', bodyContent: body })
}

function buildMusicianHtml(portfolio) {
  const initials = getInitials(portfolio.title)
  const hasReleases = portfolio.projects?.length > 0
  const hasGallery = portfolio.galleryPhotos?.length > 0
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0

  const body = `
  <nav class="ms-nav">
    <div class="ms-nav-inner">
      <span class="ms-brand">${esc(portfolio.title)}</span>
      <div class="ms-nav-links">
        ${hasReleases ? '<a href="#ms-releases">Releases</a>' : ''}
        ${hasGallery ? '<a href="#ms-gallery">Gallery</a>' : ''}
        ${hasExperience ? '<a href="#ms-tour">Tour History</a>' : ''}
      </div>
    </div>
  </nav>

  <section class="ms-hero">
    <div class="ms-hero-photo">
      ${portfolio.photoUrl
        ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" />`
        : `<div class="ms-hero-photo-fallback">${esc(initials)}</div>`}
      <div class="ms-hero-scrim"></div>
    </div>
    <div class="ms-hero-content">
      ${portfolio.template?.category ? `<span class="ms-eyebrow">${esc(portfolio.template.category)}</span>` : ''}
      <h1 class="ms-hero-title">${esc(portfolio.headline || portfolio.title)}</h1>
      ${portfolio.aboutMe ? `<p class="ms-hero-blurb">${esc(portfolio.aboutMe)}</p>` : ''}
      <div class="ms-hero-actions">
        ${hasReleases ? '<a href="#ms-releases" class="ms-btn ms-btn-solid">Listen Now</a>' : ''}
        <a href="#ms-contact" class="ms-btn ms-btn-ghost">Book Me</a>
      </div>
    </div>
  </section>

  ${hasReleases ? `
  <section class="ms-section" id="ms-releases">
    <div class="ms-container">
      <span class="ms-eyebrow">Discography</span>
      <h2>Releases &amp; Tracks</h2>
      <div class="ms-releases-grid">
        ${portfolio.projects.map(p => `
          <div class="ms-release-card">
            <div class="ms-release-art">${p.imageUrl ? `<img src="${esc(resolveAssetUrl(p.imageUrl))}" alt="${esc(p.title)}" />` : '&#127925;'}</div>
            <h3>${esc(p.title)}</h3>
            ${p.description ? `<p>${esc(p.description)}</p>` : ''}
            ${p.technologies ? `<div class="ms-tag-row">${p.technologies.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="ms-tag">${esc(t)}</span>`).join('')}</div>` : ''}
            ${(p.projectUrl || p.githubUrl) ? `<a href="${esc(p.projectUrl || p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="ms-release-link">Listen &#8594;</a>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasGallery ? `
  <section class="ms-section ms-section-dark" id="ms-gallery">
    <div class="ms-container">
      <span class="ms-eyebrow">On Stage</span>
      <h2>Live Performance Gallery</h2>
      <div class="ms-gallery-grid">
        ${portfolio.galleryPhotos.map(g => `
          <div class="ms-gallery-card">
            <img src="${esc(resolveAssetUrl(g.imageUrl))}" alt="${esc(g.caption || portfolio.title)}" />
            ${g.caption ? `<div class="ms-gallery-caption">${esc(g.caption)}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasSkills ? `
  <section class="ms-section">
    <div class="ms-container">
      <span class="ms-eyebrow">Craft</span>
      <h2>Instruments &amp; Techniques</h2>
      <div class="ms-skills-grid">
        ${portfolio.skills.map(s => `<div class="ms-skill-chip"><span class="ms-skill-dot"></span>${esc(s.skillName)} — ${esc(s.proficiencyLevel)}</div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasExperience ? `
  <section class="ms-section ms-section-dark" id="ms-tour">
    <div class="ms-container">
      <span class="ms-eyebrow">On the Road</span>
      <h2>Tour &amp; Residency History</h2>
      <div class="ms-timeline">
        ${portfolio.experiences.map(e => `
          <div class="ms-timeline-item">
            <div class="ms-timeline-date">${formatDate(e.startDate)} – ${e.isCurrent ? 'Present' : formatDate(e.endDate)}</div>
            <div>
              <h4>${esc(e.jobTitle)}</h4>
              <p class="ms-timeline-role">${esc(e.companyName)}${e.location ? ` — ${esc(e.location)}` : ''}</p>
              ${e.description ? `<p class="ms-timeline-desc">${esc(e.description)}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasEducation ? `
  <section class="ms-section">
    <div class="ms-container">
      <span class="ms-eyebrow">Training</span>
      <h2>Musical Education</h2>
      <div class="ms-timeline">
        ${portfolio.educations.map(ed => `
          <div class="ms-timeline-item">
            <div class="ms-timeline-date">${ed.graduationDate ? formatDate(ed.graduationDate) : ''}</div>
            <div>
              <h4>${esc(ed.institutionName)}</h4>
              <p class="ms-timeline-role">${esc([ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in '))}</p>
              ${ed.description ? `<p class="ms-timeline-desc">${esc(ed.description)}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <footer class="ms-footer" id="ms-contact">
    <span class="ms-footer-brand">${esc(portfolio.title)}</span>
    <span class="ms-footer-meta">${portfolio.viewCount} profile views &middot; Built with PortfolioX</span>
  </footer>`

  return pageShell({ title: portfolio.title, css: musicianCss, bodyClass: 'musician-template', bodyContent: body })
}

function buildArchitectHtml(portfolio) {
  const initials = getInitials(portfolio.title)
  const hasProjects = portfolio.projects?.length > 0
  const hasGallery = portfolio.galleryPhotos?.length > 0
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0

  const body = `
  <nav class="ac-nav">
    <div class="ac-nav-inner">
      <span class="ac-brand">${esc(portfolio.title)}</span>
      <div class="ac-nav-links">
        ${hasProjects ? '<a href="#ac-projects">Projects</a>' : ''}
        ${hasGallery ? '<a href="#ac-gallery">Gallery</a>' : ''}
        ${hasExperience ? '<a href="#ac-experience">Experience</a>' : ''}
      </div>
    </div>
  </nav>

  <section class="ac-hero">
    <div class="ac-container ac-hero-grid">
      <div>
        ${portfolio.template?.category ? `<span class="ac-eyebrow">${esc(portfolio.template.category)}</span>` : ''}
        <h1 class="ac-hero-title">${esc(portfolio.headline || portfolio.title)}</h1>
        ${portfolio.aboutMe ? `<p class="ac-hero-blurb">${esc(portfolio.aboutMe)}</p>` : ''}
      </div>
      <div class="ac-hero-photo">
        ${portfolio.photoUrl
          ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" />`
          : `<div class="ac-hero-photo-fallback">${esc(initials)}</div>`}
      </div>
    </div>
  </section>

  ${hasProjects ? `
  <section class="ac-section" id="ac-projects">
    <div class="ac-container">
      <span class="ac-eyebrow">Selected Work</span>
      <h2>Featured Projects</h2>
      <div class="ac-projects-grid">
        ${portfolio.projects.map(p => `
          <div class="ac-project-card">
            <div class="ac-project-media">${p.imageUrl ? `<img src="${esc(resolveAssetUrl(p.imageUrl))}" alt="${esc(p.title)}" />` : '&#127970;'}</div>
            <div class="ac-project-body">
              <h3>${esc(p.title)}</h3>
              ${p.description ? `<p>${esc(p.description)}</p>` : ''}
              ${p.technologies ? `<div class="ac-tag-row">${p.technologies.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="ac-tag">${esc(t)}</span>`).join('')}</div>` : ''}
              ${(p.projectUrl || p.githubUrl) ? `<a href="${esc(p.projectUrl || p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="ac-project-link">View Case Study &#8594;</a>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasGallery ? `
  <section class="ac-section ac-section-tint" id="ac-gallery">
    <div class="ac-container">
      <span class="ac-eyebrow">Visual Archive</span>
      <h2>Portfolio Gallery</h2>
      <div class="ac-gallery-grid">
        ${portfolio.galleryPhotos.map(g => `
          <div class="ac-gallery-card">
            <img src="${esc(resolveAssetUrl(g.imageUrl))}" alt="${esc(g.caption || portfolio.title)}" />
            ${g.caption ? `<div class="ac-gallery-caption">${esc(g.caption)}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasSkills ? `
  <section class="ac-section">
    <div class="ac-container">
      <span class="ac-eyebrow">Capabilities</span>
      <h2>Design Disciplines</h2>
      <div class="ac-skills-grid">
        ${portfolio.skills.map(s => `<div class="ac-skill-card"><h4>${esc(s.skillName)}</h4><p>${esc(s.proficiencyLevel)}</p></div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasExperience ? `
  <section class="ac-section ac-section-tint" id="ac-experience">
    <div class="ac-container">
      <span class="ac-eyebrow">Practice</span>
      <h2>Firm History</h2>
      <div class="ac-timeline">
        ${portfolio.experiences.map(e => `
          <div class="ac-timeline-item">
            <div class="ac-timeline-date">${formatDate(e.startDate)} – ${e.isCurrent ? 'Present' : formatDate(e.endDate)}</div>
            <div>
              <h4>${esc(e.jobTitle)}</h4>
              <p class="ac-timeline-role">${esc(e.companyName)}${e.location ? ` — ${esc(e.location)}` : ''}</p>
              ${e.description ? `<p class="ac-timeline-desc">${esc(e.description)}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasEducation ? `
  <section class="ac-section">
    <div class="ac-container">
      <span class="ac-eyebrow">Foundation</span>
      <h2>Education</h2>
      <div class="ac-timeline">
        ${portfolio.educations.map(ed => `
          <div class="ac-timeline-item">
            <div class="ac-timeline-date">${ed.graduationDate ? formatDate(ed.graduationDate) : ''}</div>
            <div>
              <h4>${esc(ed.institutionName)}</h4>
              <p class="ac-timeline-role">${esc([ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in '))}</p>
              ${ed.description ? `<p class="ac-timeline-desc">${esc(ed.description)}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <footer class="ac-footer">
    <span class="ac-footer-brand">${esc(portfolio.title)}</span>
    <span class="ac-footer-meta">${portfolio.viewCount} profile views &middot; Built with PortfolioX</span>
  </footer>`

  return pageShell({ title: portfolio.title, css: architectCss, bodyClass: 'architect-template', bodyContent: body })
}

function buildFitnessTrainerHtml(portfolio) {
  const initials = getInitials(portfolio.title)
  const yearsExperience = computeYearsExperience(portfolio.experiences)
  const hasPrograms = portfolio.projects?.length > 0
  const hasGallery = portfolio.galleryPhotos?.length > 0
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0

  const body = `
  <nav class="ft-nav">
    <div class="ft-nav-inner">
      <span class="ft-brand">${esc(portfolio.title)}</span>
      <div class="ft-nav-links">
        ${hasPrograms ? '<a href="#ft-programs">Programs</a>' : ''}
        ${hasGallery ? '<a href="#ft-gallery">Results</a>' : ''}
        ${hasExperience ? '<a href="#ft-experience">Experience</a>' : ''}
      </div>
      <a href="#ft-contact" class="ft-btn-cta">Book a Session</a>
    </div>
  </nav>

  <section class="ft-hero">
    <div class="ft-container ft-hero-grid">
      <div>
        ${portfolio.template?.category ? `<span class="ft-eyebrow">${esc(portfolio.template.category)}</span>` : ''}
        <h1 class="ft-hero-title">${esc(portfolio.headline || portfolio.title)}</h1>
        ${portfolio.aboutMe ? `<p class="ft-hero-blurb">${esc(portfolio.aboutMe)}</p>` : ''}
        <div class="ft-hero-stats">
          ${yearsExperience ? `<div class="ft-stat"><span class="ft-stat-value">${yearsExperience}+</span><span class="ft-stat-label">Years Coaching</span></div>` : ''}
          ${hasSkills ? `<div class="ft-stat"><span class="ft-stat-value">${portfolio.skills.length}</span><span class="ft-stat-label">Certifications</span></div>` : ''}
          <div class="ft-stat"><span class="ft-stat-value">${portfolio.viewCount}</span><span class="ft-stat-label">Profile Views</span></div>
        </div>
        <a href="#ft-contact" class="ft-btn ft-btn-solid">Book a Session</a>
      </div>
      <div class="ft-hero-photo">
        ${portfolio.photoUrl
          ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" />`
          : `<div class="ft-hero-photo-fallback">${esc(initials)}</div>`}
      </div>
    </div>
  </section>

  ${hasPrograms ? `
  <section class="ft-section" id="ft-programs">
    <div class="ft-container">
      <span class="ft-eyebrow">Results That Speak</span>
      <h2>Programs &amp; Transformations</h2>
      <div class="ft-programs-grid">
        ${portfolio.projects.map(p => `
          <div class="ft-program-card">
            <div class="ft-program-icon">&#128170;</div>
            <h3>${esc(p.title)}</h3>
            ${p.description ? `<p>${esc(p.description)}</p>` : ''}
            ${p.technologies ? `<div class="ft-tag-row">${p.technologies.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="ft-tag">${esc(t)}</span>`).join('')}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasGallery ? `
  <section class="ft-section ft-section-dark" id="ft-gallery">
    <div class="ft-container">
      <span class="ft-eyebrow">Proof in Progress</span>
      <h2>Before &amp; After Gallery</h2>
      <div class="ft-gallery-grid">
        ${portfolio.galleryPhotos.map(g => `
          <div class="ft-gallery-card">
            <img src="${esc(resolveAssetUrl(g.imageUrl))}" alt="${esc(g.caption || portfolio.title)}" />
            ${g.caption ? `<div class="ft-gallery-caption">${esc(g.caption)}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasSkills ? `
  <section class="ft-section">
    <div class="ft-container">
      <span class="ft-eyebrow">Credentials</span>
      <h2>Certifications &amp; Specialties</h2>
      <div class="ft-skills-grid">
        ${portfolio.skills.map(s => `<div class="ft-skill-card"><h4>${esc(s.skillName)}</h4><span class="ft-skill-level">${esc(s.proficiencyLevel)}</span></div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasExperience ? `
  <section class="ft-section ft-section-dark" id="ft-experience">
    <div class="ft-container">
      <span class="ft-eyebrow">Track Record</span>
      <h2>Coaching Experience</h2>
      <div class="ft-timeline">
        ${portfolio.experiences.map(e => `
          <div class="ft-timeline-item">
            <div class="ft-timeline-date">${formatDate(e.startDate)} – ${e.isCurrent ? 'Present' : formatDate(e.endDate)}</div>
            <div>
              <h4>${esc(e.jobTitle)}</h4>
              <p class="ft-timeline-role">${esc(e.companyName)}${e.location ? ` — ${esc(e.location)}` : ''}</p>
              ${e.description ? `<p class="ft-timeline-desc">${esc(e.description)}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasEducation ? `
  <section class="ft-section">
    <div class="ft-container">
      <span class="ft-eyebrow">Foundation</span>
      <h2>Certifications &amp; Education</h2>
      <div class="ft-timeline">
        ${portfolio.educations.map(ed => `
          <div class="ft-timeline-item">
            <div class="ft-timeline-date">${ed.graduationDate ? formatDate(ed.graduationDate) : ''}</div>
            <div>
              <h4>${esc(ed.institutionName)}</h4>
              <p class="ft-timeline-role">${esc([ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in '))}</p>
              ${ed.description ? `<p class="ft-timeline-desc">${esc(ed.description)}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <footer class="ft-footer" id="ft-contact">
    <span class="ft-footer-brand">${esc(portfolio.title)}</span>
    <span class="ft-footer-meta">${portfolio.viewCount} profile views &middot; Built with PortfolioX</span>
  </footer>`

  return pageShell({ title: portfolio.title, css: fitnessCss, bodyClass: 'fitness-template', bodyContent: body })
}

function buildChefHtml(portfolio) {
  const initials = getInitials(portfolio.title)
  const hasDishes = portfolio.projects?.length > 0
  const hasGallery = portfolio.galleryPhotos?.length > 0
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0
  const hasCookbooks = portfolio.books?.length > 0

  const body = `
  <nav class="cf-nav">
    <div class="cf-nav-inner">
      <span class="cf-brand">${esc(portfolio.title)}</span>
      <div class="cf-nav-links">
        ${hasDishes ? '<a href="#cf-dishes">Signature Dishes</a>' : ''}
        ${hasGallery ? '<a href="#cf-gallery">Gallery</a>' : ''}
        ${hasExperience ? '<a href="#cf-experience">Experience</a>' : ''}
      </div>
    </div>
  </nav>

  <section class="cf-hero">
    <div class="cf-container cf-hero-grid">
      <div>
        ${portfolio.template?.category ? `<span class="cf-eyebrow">${esc(portfolio.template.category)}</span>` : ''}
        <h1 class="cf-hero-title">${esc(portfolio.headline || portfolio.title)}</h1>
        ${portfolio.aboutMe ? `<p class="cf-hero-blurb">${esc(portfolio.aboutMe)}</p>` : ''}
        ${hasDishes ? '<a href="#cf-dishes" class="cf-btn">Explore the Menu</a>' : ''}
      </div>
      <div class="cf-hero-photo">
        ${portfolio.photoUrl
          ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" />`
          : `<div class="cf-hero-photo-fallback">${esc(initials)}</div>`}
        <div class="cf-hero-frame"></div>
      </div>
    </div>
  </section>

  ${hasDishes ? `
  <section class="cf-section" id="cf-dishes">
    <div class="cf-container">
      <span class="cf-eyebrow">The Menu</span>
      <h2>Signature Dishes</h2>
      <div class="cf-dishes-grid">
        ${portfolio.projects.map(p => `
          <div class="cf-dish-card">
            <div class="cf-dish-media">${p.imageUrl ? `<img src="${esc(resolveAssetUrl(p.imageUrl))}" alt="${esc(p.title)}" />` : '&#127859;'}</div>
            <h3>${esc(p.title)}</h3>
            ${p.description ? `<p>${esc(p.description)}</p>` : ''}
            ${p.technologies ? `<div class="cf-tag-row">${p.technologies.split(',').map(t => t.trim()).filter(Boolean).map(t => `<span class="cf-tag">${esc(t)}</span>`).join('')}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasGallery ? `
  <section class="cf-section cf-section-dark" id="cf-gallery">
    <div class="cf-container">
      <span class="cf-eyebrow">From the Kitchen</span>
      <h2>Food Gallery</h2>
      <div class="cf-gallery-grid">
        ${portfolio.galleryPhotos.map(g => `
          <div class="cf-gallery-card">
            <img src="${esc(resolveAssetUrl(g.imageUrl))}" alt="${esc(g.caption || portfolio.title)}" />
            ${g.caption ? `<div class="cf-gallery-caption">${esc(g.caption)}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasSkills ? `
  <section class="cf-section">
    <div class="cf-container">
      <span class="cf-eyebrow">Craft</span>
      <h2>Culinary Techniques</h2>
      <div class="cf-skills-grid">
        ${portfolio.skills.map(s => `<div class="cf-skill-chip">${esc(s.skillName)} &middot; ${esc(s.proficiencyLevel)}</div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasExperience ? `
  <section class="cf-section cf-section-dark" id="cf-experience">
    <div class="cf-container">
      <span class="cf-eyebrow">Career</span>
      <h2>Kitchen Experience</h2>
      <div class="cf-timeline">
        ${portfolio.experiences.map(e => `
          <div class="cf-timeline-item">
            <div class="cf-timeline-date">${formatDate(e.startDate)} – ${e.isCurrent ? 'Present' : formatDate(e.endDate)}</div>
            <div>
              <h4>${esc(e.jobTitle)}</h4>
              <p class="cf-timeline-role">${esc(e.companyName)}${e.location ? ` — ${esc(e.location)}` : ''}</p>
              ${e.description ? `<p class="cf-timeline-desc">${esc(e.description)}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasEducation ? `
  <section class="cf-section">
    <div class="cf-container">
      <span class="cf-eyebrow">Training</span>
      <h2>Culinary Training</h2>
      <div class="cf-timeline">
        ${portfolio.educations.map(ed => `
          <div class="cf-timeline-item">
            <div class="cf-timeline-date">${ed.graduationDate ? formatDate(ed.graduationDate) : ''}</div>
            <div>
              <h4>${esc(ed.institutionName)}</h4>
              <p class="cf-timeline-role">${esc([ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in '))}</p>
              ${ed.description ? `<p class="cf-timeline-desc">${esc(ed.description)}</p>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  ${hasCookbooks ? `
  <section class="cf-section cf-section-dark">
    <div class="cf-container">
      <span class="cf-eyebrow">In Print</span>
      <h2>Published Cookbooks</h2>
      <div class="cf-books-grid">
        ${portfolio.books.map(b => `
          <div class="cf-book-card">
            <div class="cf-book-cover">${b.coverImageUrl ? `<img src="${esc(resolveAssetUrl(b.coverImageUrl))}" alt="${esc(b.title)}" />` : `<span>${esc(b.title?.[0]?.toUpperCase() || '?')}</span>`}</div>
            <h4>${esc(b.title)}</h4>
            ${(b.genre || b.publishedYear) ? `<span class="cf-book-meta">${esc([b.genre, b.publishedYear].filter(Boolean).join(' | '))}</span>` : ''}
            ${b.description ? `<p>${esc(b.description)}</p>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </section>` : ''}

  <footer class="cf-footer">
    <span class="cf-footer-brand">${esc(portfolio.title)}</span>
    <span class="cf-footer-meta">${portfolio.viewCount} profile views &middot; Built with PortfolioX</span>
  </footer>`

  return pageShell({ title: portfolio.title, css: chefCss, bodyClass: 'chef-template', bodyContent: body })
}

function buildGenericHtml(portfolio) {
  const photoHtml = portfolio.photoUrl
    ? `<img src="${esc(resolveAssetUrl(portfolio.photoUrl))}" alt="${esc(portfolio.title)}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:2px solid #6C8EFF;" />`
    : ''

  const skillsHtml = portfolio.skills?.length ? `
    <section style="margin-bottom:40px;">
      <h2>Skills</h2>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;">
        ${portfolio.skills.map(s => `<div class="card" style="padding:12px 16px;">${esc(s.skillName)}</div>`).join('')}
      </div>
    </section>` : ''

  const experienceHtml = portfolio.experiences?.length ? `
    <section style="margin-bottom:40px;">
      <h2>Experience</h2>
      ${portfolio.experiences.map(e => `
        <div class="card" style="margin-bottom:12px;">
          <h3>${esc(e.jobTitle)}</h3>
          <p style="color:#6C8EFF;">${esc(e.companyName)}${e.location ? ` — ${esc(e.location)}` : ''}</p>
          <p style="color:#98A2B8;font-size:14px;">${esc(e.description)}</p>
        </div>`).join('')}
    </section>` : ''

  const educationHtml = portfolio.educations?.length ? `
    <section style="margin-bottom:40px;">
      <h2>Education</h2>
      ${portfolio.educations.map(ed => `
        <div class="card" style="margin-bottom:12px;">
          <h3>${esc(ed.institutionName)}</h3>
          <p style="color:#6C8EFF;">${esc([ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in '))}</p>
          ${ed.description ? `<p style="color:#98A2B8;font-size:14px;">${esc(ed.description)}</p>` : ''}
        </div>`).join('')}
    </section>` : ''

  const projectsHtml = portfolio.projects?.length ? `
    <section style="margin-bottom:40px;">
      <h2>Projects</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;">
        ${portfolio.projects.map(p => `
          <div class="card">
            <h3>${esc(p.title)}</h3>
            <p style="color:#98A2B8;font-size:14px;">${esc(p.description)}</p>
            ${p.technologies ? `<small style="color:#6C8EFF;">${esc(p.technologies)}</small>` : ''}
          </div>`).join('')}
      </div>
    </section>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(portfolio.title)}</title>
<style>
  :root { --bg-primary:#0A0D14; --bg-card:#161B27; --accent:#6C8EFF; --accent-rgb:108,142,255; --text-secondary:#98A2B8; --border:rgba(var(--accent-rgb),.15); --radius:16px; }
  * { box-sizing: border-box; }
  body { margin:0; background: var(--bg-primary); color:#fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height:1.5; }
  .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
  .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
  h1,h2,h3 { margin: 0 0 8px; }
</style>
</head>
<body>
<div class="container">
  <header style="margin-bottom:40px;display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
    ${photoHtml}
    <div>
      <h1>${esc(portfolio.title)}</h1>
      <p style="color:var(--accent);font-size:18px;margin-bottom:12px;">${esc(portfolio.headline)}</p>
      <p style="color:var(--text-secondary);">${esc(portfolio.aboutMe)}</p>
    </div>
  </header>
  ${skillsHtml}
  ${experienceHtml}
  ${educationHtml}
  ${projectsHtml}
  <div style="text-align:center;padding-top:40px;border-top:1px solid var(--border);color:var(--text-secondary);">
    <p>Built with PortfolioX | Views: ${portfolio.viewCount}</p>
  </div>
</div>
</body>
</html>`
}

const TEMPLATE_BUILDERS = {
  '01_MED': buildDoctorHtml,
  '02_VIS': buildPhotographerHtml,
  '03_ART': buildGraphicDesignerHtml,
  '06_WRIT': buildWriterHtml,
  '05_DEV': buildDeveloperHtml,
  '04_ENG': buildLawyerHtml,
  '07_MUS': buildMusicianHtml,
  '08_ARC': buildArchitectHtml,
  '09_FIT': buildFitnessTrainerHtml,
  '10_CHF': buildChefHtml,
}

export async function exportPortfolioZip(portfolio) {
  const builder = TEMPLATE_BUILDERS[portfolio.template?.code] || buildGenericHtml
  const html = builder(portfolio)

  const zip = new JSZip()
  zip.file('index.html', html)
  zip.file('README.txt', `${portfolio.title} — exported from PortfolioX\n\nOpen index.html in a browser to view this portfolio.\n${portfolio.template?.code === '01_MED' ? 'The "Book an Appointment" section calls the live PortfolioX API, so it keeps working as long as this portfolio stays published.\n' : ''}`)

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${portfolio.slug || 'portfolio'}.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
