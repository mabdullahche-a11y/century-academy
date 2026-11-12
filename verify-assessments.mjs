import {courses} from './course-data.mjs';
let count=0;
for (const c of courses) for(const year of ['2027','2028']) for(const route of c.options[year]) {
 const a=c.assessment(year,route);
 if(a.papers.reduce((sum,p)=>sum+p.weight,0)!==100)throw Error(`Incorrect total: ${c.code}, ${year}, ${route}`);
 if(c.level==='a-level'&&route==='AS Level only'&&a.papers.length!==2)throw Error('Incorrect AS components');
 count++;
}
const lit=courses.find(c=>c.code==='0475');
if(lit.assessment('2028','Exam route').papers[1].time!=='2h')throw Error('2028 literature timing incorrect');
if(lit.assessment('2027','Drama + unseen route').papers.length!==3)throw Error('2027 literature route incorrect');
if(courses.find(c=>c.code==='0500').assessment('2027','Exam route').papers[0].marks!==80)throw Error('2027 0500 marks incorrect');
console.log(`Verified ${count} year/route combinations; all weightings total 100%; key syllabus changes checked.`);
