const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const backdrop = document.querySelector('.menu-backdrop');
const narrow = matchMedia('(max-width: 900px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('.header-shell');
const trialBar = document.querySelector('.mobile-trial');
document.documentElement.classList.add('enhanced');
menu.hidden = false;

function setMenu(open, restoreFocus = false) {
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  backdrop.hidden = !open;
  if (!open && restoreFocus) menu.focus({ preventScroll: true });
}
menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
backdrop.addEventListener('click', () => setMenu(false, true));
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false, narrow.matches));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true);
});
narrow.addEventListener('change', () => setMenu(false, nav.contains(document.activeElement) && narrow.matches));

if ('IntersectionObserver' in window) {
  const headerObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle('condensed', entry.boundingClientRect.bottom <= 0);
  });
  headerObserver.observe(document.querySelector('#header-sentinel'));

  if (trialBar) {
    let passed = false;
    const lowerSections = new Set();
    const updateTrial = () => {
      trialBar.hidden = !narrow.matches || !passed || lowerSections.size > 0;
    };
    const hero = document.querySelector('.hero, .course-hero, .editorial-hero, .level-intro');
    new IntersectionObserver(([entry]) => {
      passed = entry.boundingClientRect.bottom < 72;
      updateTrial();
    }, { rootMargin: '-72px 0px 0px' }).observe(hero);
    const endObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) lowerSections.add(entry.target);
        else lowerSections.delete(entry.target);
      }
      updateTrial();
    }, { rootMargin: '0px 0px 72px' });
    document.querySelectorAll('.conversation, footer').forEach(element => endObserver.observe(element));
    narrow.addEventListener('change', updateTrial);
  }

  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      revealObserver.unobserve(entry.target);
      if (reduced.matches) continue;
      entry.target.classList.add('is-visible');
      const count = entry.target.querySelector('[data-count]');
      if (!count) continue;
      const target = Number(count.dataset.count);
      const start = performance.now();
      function tick(now) {
        const progress = Math.min(1, (now - start) / 900);
        count.textContent = reduced.matches ? target : Math.round(target * (1 - (1 - progress) ** 3));
        if (progress < 1 && !reduced.matches) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }, { threshold: .15 });
  document.querySelectorAll('[data-reveal], .experience-panel').forEach(element => revealObserver.observe(element));
}

const feeSwitch = document.querySelector('.fee-switch');
if (feeSwitch) {
  feeSwitch.hidden = false;
  const updateFees = () => {
    const period = feeSwitch.querySelector(':checked').value;
    feeSwitch.dataset.period = period;
    for (const panel of document.querySelectorAll('.fee-panel')) {
      panel.hidden = panel.id !== 'fees-' + period;
    }
  };
  feeSwitch.addEventListener('change', updateFees);
  updateFees();
}

let courseModule;
export function loadCourses() {
  courseModule ??= import('/course-data.mjs').catch(error => {
    courseModule = undefined;
    throw error;
  });
  return courseModule;
}

const finder = document.querySelector('.finder');
if (finder) {
  const form = finder.querySelector('form');
  const result = finder.querySelector('#finder-result');
  const status = finder.querySelector('#finder-status');
  const back = finder.querySelector('#finder-back');
  const next = finder.querySelector('#finder-next');
  const fields = [...form.querySelectorAll('fieldset')];
  let data;
  let step = 0;

  finder.addEventListener('toggle', async () => {
    if (!finder.open || data) return;
    status.textContent = 'Loading course information.';
    try {
      data = await loadCourses();
      form.hidden = false;
      status.textContent = '';
    } catch {
      status.textContent = 'Course information could not load. Close and reopen the finder to retry, or use the course cards above.';
    }
  });
  function showStep(index) {
    step = index;
    fields.forEach((field, position) => {
      field.hidden = position !== step;
      field.disabled = position !== step;
    });
    back.hidden = step === 0;
    next.textContent = step === 2 ? 'Show my course' : 'Continue';
    finder.querySelector('#finder-progress').textContent = 'Step ' + (step + 1) + ' of 3';
    fields[step].querySelector('input:checked, input').focus();
  }
  back.addEventListener('click', () => showStep(step - 1));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (step < 2) {
      showStep(step + 1);
      return;
    }
    const value = name => form.querySelector('input[name="' + name + '"]:checked').value;
    const course = data.courses.find(item => item.level === value('level') && item.name === value('subject'));
    const year = value('year');
    if (!course || !course.options[year]) {
      status.textContent = 'Use the course cards above to find your syllabus.';
      return;
    }
    const routes = course.options[year];
    const routeOptions = routes.map(route => '<option>' + route + '</option>').join('');
    result.innerHTML = '<p class="syllabus-code">' + course.code + '</p><h3>' + course.official +
      '</h3><p>Examination year ' + year + '</p><label for="finder-route">Assessment route</label>' +
      '<select id="finder-route">' + routeOptions + '</select><p class="finder-paper-label">Papers at a glance</p>' +
      '<ul id="finder-papers" aria-live="polite"></ul><div class="finder-actions">' +
      '<a class="button green" href="/courses/' + course.level + '/' + course.slug + '/?year=' + year +
      '">View course guide <span aria-hidden="true">↗</span></a>' +
      '<a class="underlink dark" href="/contact/?course=' + course.code + '&amp;year=' + year +
      '">Book a free trial for this course <span aria-hidden="true">↗</span></a>' +
      '<button type="button" class="button" id="finder-edit">Change my choices</button></div>';
    const route = result.querySelector('#finder-route');
    function showPapers() {
      const papers = course.assessment(year, route.value).papers;
      result.querySelector('#finder-papers').innerHTML = papers.map(paper =>
        '<li>' + paper.name + ' <strong>' + paper.weight + '%</strong></li>').join('');
    }
    route.addEventListener('change', showPapers);
    result.querySelector('#finder-edit').addEventListener('click', () => {
      result.hidden = true;
      form.hidden = false;
      showStep(0);
    });
    showPapers();
    form.hidden = true;
    result.hidden = false;
    result.focus();
  });
}

