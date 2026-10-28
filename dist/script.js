const dialog = document.querySelector('#enquiry-dialog');
const title = document.querySelector('#dialog-title');
const description = document.querySelector('#dialog-description');
const form = document.querySelector('#trial-form');
const overview = document.querySelector('#course-overview');
const preview = document.querySelector('#preview-overview');
const level = document.querySelector('#level');
const status = document.querySelector('.form-status');
let selectedCourse = 'O Level';
function showDialog(mode, course) {
  form.hidden = mode !== 'trial'; overview.hidden = mode !== 'course'; preview.hidden = mode !== 'preview';
  status.textContent = ''; document.querySelector('#message-fallback').hidden = true;
  if (mode === 'trial') { title.innerHTML = 'Your first chapter<br><em>starts here.</em>'; description.textContent = "Tell us what you're studying. Prepare an enquiry for your free trial lesson."; description.hidden = false; if(course) level.value = course; }
  if (mode === 'course') { selectedCourse = course; title.textContent = course + ' English'; description.hidden = true; document.querySelector('#course-description').textContent = ({'O Level':'Develop your reading, writing and analytical skills with focused support for your O Level English journey.','IGCSE':'Explore language and literature with online lessons that help you read closely, communicate clearly and understand your course.','AS & A Level':'Take your understanding further through thoughtful analysis, close reading and the development of independent ideas.'})[course]; }
  if (mode === 'preview') { title.innerHTML = 'A first look at<br><em>Century Academy.</em>'; description.hidden = true; }
  if(!dialog.open) dialog.showModal(); else (mode === 'trial' ? level : document.querySelector('.dialog-close')).focus();
}
document.querySelectorAll('[data-trial]').forEach(button => button.addEventListener('click', () => showDialog('trial')));
document.querySelectorAll('[data-course]').forEach(button => button.addEventListener('click', () => showDialog('course', button.dataset.course)));
document.querySelector('#course-trial').addEventListener('click', () => showDialog('trial', selectedCourse));
document.querySelector('#preview-info').addEventListener('click', () => showDialog('preview'));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { const bounds = dialog.getBoundingClientRect(); if(event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close(); });
form.addEventListener('submit', async event => {
  event.preventDefault();
  const message = `Hello Century Academy, I would like to arrange a free trial. Qualification: ${level.value}. Subject: ${document.querySelector('#subject').value}. Preferred format: ${document.querySelector('#format').value}. Please help me find a suitable lesson.`;
  try { await navigator.clipboard.writeText(message); status.textContent = 'Enquiry copied. You can send it to the academy to discuss your trial.'; }
  catch { const fallback = document.querySelector('#message-fallback'); fallback.value = message; fallback.hidden = false; fallback.focus(); fallback.select(); status.textContent = 'Your enquiry is ready. Select and copy the message below.'; }
});
const menuButton = document.querySelector('.menu-button'); const navigation = document.querySelector('#navigation');
function closeMenu(){ navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open navigation'); }
menuButton.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation'); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event => {if(event.key === 'Escape') closeMenu();});
document.querySelector('#year').textContent = new Date().getFullYear();
