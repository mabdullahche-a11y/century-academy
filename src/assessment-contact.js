const escapeHTML=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

const { courses, levelDefs } = document.body.dataset.course || document.querySelector('#enquiry-form')
  ? await loadCourses()
  : { courses: [], levelDefs: {} };
const course=courses.find(c=>c.code===document.body.dataset.course);
if(course){
 const yearControl=document.querySelector('#exam-year'),routeControl=document.querySelector('#assessment-route');
 function renderAssessment(){
  const year=yearControl.value,route=routeControl.value,a=course.assessment(year,route);
  document.querySelector('#assessment-output').innerHTML=`<div class="assessment-context"><span>EXAMINATION YEAR <strong>${year}</strong></span><span>ROUTE <strong>${escapeHTML(route)}</strong></span></div><div class="paper-table-wrap"><table class="paper-table"><caption>Assessment components · ${course.code} · ${year} · ${escapeHTML(route)}</caption><thead><tr><th scope="col">Component</th><th scope="col">Duration</th><th scope="col">Marks</th><th scope="col">Weighting</th></tr></thead><tbody>${a.papers.map(p=>`<tr><th scope="row"><span class="paper-id">${p.id==='5'||p.name.includes('Coursework')?'COMPONENT':'PAPER'} ${p.id}</span><strong>${p.name}</strong></th><td>${p.time}</td><td>${p.marks}</td><td><strong class="weight">${p.weight}%</strong></td></tr>`).join('')}</tbody></table></div><p class="assessment-note">${a.note}</p><div class="paper-details">${a.papers.map(p=>`<details><summary><span>${p.name} <small>— component ${p.id}</small></span><span aria-hidden="true">+</span></summary><p>${p.detail}</p></details>`).join('')}</div>`;
  const source=course.sources[year],link=document.querySelector('#official-source');link.href=source.url;link.innerHTML=`Cambridge ${course.code} · ${source.years} syllabus (PDF) <span aria-hidden="true">↗</span>`;
 }
 yearControl.addEventListener('change',()=>{const previous=routeControl.value;routeControl.replaceChildren(...course.options[yearControl.value].map(r=>{const option=document.createElement('option');option.value=r;option.textContent=r;return option;}));if(course.options[yearControl.value].includes(previous))routeControl.value=previous;renderAssessment();});
 routeControl.addEventListener('change',renderAssessment);
 const linkedYear = new URLSearchParams(location.search).get('year');
 if (course.options[linkedYear]) {
   yearControl.value = linkedYear;
   yearControl.dispatchEvent(new Event('change'));
 }
}
const enquiry=document.querySelector('#enquiry-form');
if(enquiry){
 const selected=new URLSearchParams(location.search).get('course'),select=document.querySelector('#contact-course');
 if(courses.some(c=>c.code===selected))select.value=selected;
 const year = new URLSearchParams(location.search).get('year');
 if (year === '2027' || year === '2028') document.querySelector('#contact-year').value = year;
 enquiry.addEventListener('submit',event=>{event.preventDefault();const c=courses.find(c=>c.code===select.value);const message=`Hello Century Academy, I’d like to discuss a free trial. Course: ${c?`${levelDefs[c.level].name} ${c.name} (${c.code})`:'please help me choose'}. Examination year: ${document.querySelector('#contact-year').value}. Preferred format: ${document.querySelector('#contact-format').value}. Please let me know suitable times.`;document.querySelector('#message-text').value=message;document.querySelector('#prepared-message').hidden=false;document.querySelector('#copy-status').textContent='Your message is ready. Nothing has been sent.';});
 document.querySelector('#copy-message').addEventListener('click',async()=>{const text=document.querySelector('#message-text');try{await navigator.clipboard.writeText(text.value);document.querySelector('#copy-status').textContent='Copied. Open Instagram and paste your message to the academy.';}catch{text.focus();text.select();document.querySelector('#copy-status').textContent='Select and copy the message above.';}});
}
