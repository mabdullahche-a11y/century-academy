import { pricing } from './pricing-data.mjs';
import { levelDefs, entryCombinationNote } from './course-data.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const heading = (eyebrow, title) => '<p class="eyebrow muted">' + eyebrow + '</p><h2>' + title + '</h2>';
const trial = '<a class="button green" href="/contact/">Discuss a free trial ' + arrow + '</a>';
const levels = { igcse_olevel: 'IGCSE & O Level', as_a_level: 'AS & A Level' };
const formats = { one_to_one: 'One-to-one', group: 'Group' };

export const finder = `
<details class="finder">
  <summary>Not sure? Find my course in 3 steps <span aria-hidden="true">+</span></summary>
  <div class="disclosure-body">
    <p>Your exam centre confirms which syllabus code you are entered for. ${entryCombinationNote}</p>
    <form id="course-finder" hidden>
      <p id="finder-progress">Step 1 of 3</p>
      <fieldset data-step="1"><legend>Choose your qualification</legend>
        ${Object.entries(levelDefs).map(([id, level]) => `<label class="choice"><input type="radio" name="level" value="${id}" required> ${level.name}</label>`).join('')}
      </fieldset>
      <fieldset data-step="2" hidden disabled><legend>Choose your subject</legend>
        <label class="choice"><input type="radio" name="subject" value="English Language" required> English Language</label>
        <label class="choice"><input type="radio" name="subject" value="English Literature" required> English Literature</label>
      </fieldset>
      <fieldset data-step="3" hidden disabled><legend>Choose your examination year</legend>
        <label class="choice"><input type="radio" name="year" value="2027" required> 2027</label>
        <label class="choice"><input type="radio" name="year" value="2028" required> 2028</label>
      </fieldset>
      <div class="finder-actions">
        <button type="button" class="button" id="finder-back" hidden>Back</button>
        <button type="submit" class="button green" id="finder-next">Continue</button>
      </div>
    </form>
    <div id="finder-result" hidden tabindex="-1"></div>
    <p id="finder-status" role="status"></p>
  </div>
</details>`;

const steps = [
  ['A conversation first.', 'Tell us your course, exam year and where you want support. Your first online trial is free.'],
  ['A plan for your course.', 'We map the syllabus, route and set texts to your exam year, then agree one-to-one or group lessons.'],
  ['Lessons that build understanding.', 'Read, discuss and write in each lesson. A quotation is a beginning. What matters is how you explain it.'],
  ['Practice, then the exam room.', 'Practise writing, discuss your work and develop your exam technique and timing. Your exam centre handles entries.'],
];

export const journey = `<section class="section soft" id="teaching-steps"><div class="wrap">
  ${heading('HOW WE TEACH A COURSE','From first conversation<br><em>to exam day.</em>')}
  <ol class="journey-grid">${steps.map(([title, detail], index) => `<li data-reveal><span class="roman" aria-hidden="true">${['I.','II.','III.','IV.'][index]}</span><h3>${title}</h3><p>${detail}</p></li>`).join('')}</ol>
</div></section>`;

function feeCard(level, format, rate, period, detail = '') {
  const hasRate = Number.isFinite(rate);
  return `<article class="fee-card"><p class="label">${escape(level)}</p><h3>${escape(format)}</h3>
    ${hasRate ? `<p class="fee-rate"${pricing.demo ? ' data-assumed="demo rate"' : ''}>${rate.toLocaleString('en-GB')} <small>/ ${period}</small></p>` : '<p>Fees on request. Message us.</p><!-- TODO(owner): confirm this rate -->'}
    ${detail ? '<p>' + escape(detail) + '</p>' : ''}</article>`;
}

const hourly = Object.entries(levels).flatMap(([key, level]) =>
  Object.entries(formats).map(([format, label]) => feeCard(level, label, pricing.hourly[format][key], 'hour',
    format === 'group' && pricing.hourly.group.max_group_size ? 'Up to ' + pricing.hourly.group.max_group_size + ' students' : ''))).join('');
const monthly = pricing.monthly_plans.map(plan => feeCard(plan.levels.map(key => levels[key]).join(' · '), plan.name,
  plan.price, 'month', plan.lessons_per_month ? plan.lessons_per_month + ' lessons per month' : '')).join('');

export const fees = `<section class="section" id="fees"><div class="wrap">
  ${heading('FEES','Simple fees.<br><em>Flexible ways to learn.</em>')}
  <p class="fee-disclosure">${pricing.demo ? 'Illustrative GCC rates in ' + escape(pricing.currency) + '. Ask the academy for confirmed fees.' : pricing.currency ? 'All fees in ' + escape(pricing.currency) + '.' : 'Fees on request. Message us.'}</p>
  <!-- TODO(owner): confirm currency, hourly rates, monthly plans, lesson counts and maximum group size -->
  <fieldset class="fee-switch" hidden><legend class="visually-hidden">Billing period</legend>
    <label><input type="radio" name="billing" value="hourly" checked><span>Pay by the hour</span></label>
    <label><input type="radio" name="billing" value="monthly"><span>Monthly plans</span></label>
  </fieldset>
  <div id="fees-hourly" class="fee-panel"><h3 class="fee-period">Pay by the hour</h3><div class="fee-grid">${hourly}</div></div>
  <div id="fees-monthly" class="fee-panel"><h3 class="fee-period">Monthly plans</h3><div class="fee-grid">${monthly || '<p>Fees on request. Message us.</p><!-- TODO(owner): monthly plans -->'}</div></div>
  ${pricing.payment_notes ? '<p>' + escape(pricing.payment_notes) + '</p>' : '<!-- TODO(owner): payment, cancellation and rescheduling details -->'}
  <div class="fee-close"><p>Your first online trial is free.</p>${trial}</div>
</div></section>`;

export const incentives = `<section class="section soft" id="incentives"><div class="wrap encouragement">
  <div>${heading('WITH THE ACADEMY','Thoughtful<br><em>encouragements.</em>')}</div>
  <ol>${pricing.incentives.filter(item => item.confirmed).map(item => `<li><span class="roman" aria-hidden="true">I.</span><div><h3>${escape(item.title)}</h3><p>${escape(item.detail)}</p></div></li>`).join('')}</ol>
  <!-- TODO(owner): confirm any further incentives -->
</div></section>`;

const questions = [
  ['How do I know which syllabus is right?', 'Your school or exam centre confirms your syllabus code. You’ll find the code on every course card.'],
  ['Do you enter students for the exams?', 'Century Academy provides tuition. Your registered exam centre handles entry and coursework administration.'],
  ['Are lessons one-to-one or group?', 'Both formats are available online. We discuss which would suit the student.'],
  ['How does the free trial work?', 'Tell us your course and where you want support. Your first online trial is free.'],
  ['How are fees charged?', 'Tuition can be arranged hourly or monthly. Message us to discuss the fees for your course and lesson format.'],
  ['Can you help students outside the GCC?', 'Yes. We teach online across the GCC and worldwide.'],
];
export const faq = `<section class="section" id="faq"><div class="wrap faq-layout">
  <h2>Questions <em>parents ask.</em></h2>
  <div class="faq-list">${questions.map(([question, answer]) => `<details><summary>${question}<span aria-hidden="true">+</span></summary><p>${answer}</p></details>`).join('')}</div>
</div></section>`;
export const faqSchema = {
  '@type': 'FAQPage',
  mainEntity: questions.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
};
