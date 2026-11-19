import {$, node, link, options, table, load} from './ui.mjs';
import {servicesFor, labRows, surveyComparison} from './model.mjs';
const fmt = value => value == null ? 'Unreported' : value.toLocaleString('en-CA');
load(data => {
  $('metadata').textContent = data.coverage + ' · Provincial survey retrieved ' + data.retrieved;
  for (const [id, url] of [['vplstatus', data.vplSource], ['hplstatus', data.hplSource]]) {
    const record = data.documents?.find(doc => doc.url === url.split('#')[0]);
    if (record) $(id).textContent = 'Report last verified ' + record.verified + ' · ' + record.status;
  }
  options('task', [...new Set(data.services.map(row => row.task))], 'VHS tape');
  options('city', ['Both cities','Halifax','Vancouver']);
  options('lab', ['Central','Bud Osborn']);
  options('measure', ['Hours of use','Sessions']);
  const regions = [...new Set(data.survey.map(row => row.region))].sort();
  options('region', regions, 'Halifax Public Libraries');
  $('vplsrc').href = data.vplSource; $('hplsrc').href = data.hplSource; $('nssrc').href = data.nsSource;
  function tasks() {
    const results = servicesFor(data.services, $('task').value, $('city').value);
    $('services').replaceChildren(...results.map(r => {
      const box = node('article', undefined, 'card');
      const links = node('div', undefined, 'links');
      links.append(link('Equipment guide ↗', r.guide), link('Booking at the library ↗', r.booking));
      box.append(node('p',r.city,'minitag'),node('h3', r.city === 'Vancouver' ? 'Central Inspiration Lab' : 'Central Media Studio'),node('p',r.equipment),node('p',r.bring),links);
      return box;
    }));
    if (!results.length) $('services').append(node('p','This project has no verified equipment listing for your selection. Check both cities for other options.','callout'));
  }
  function lab() {
    const measure = $('measure').value === 'Sessions' ? 'sessions' : 'hours';
    const rows = labRows(data.labs,$('lab').value,measure);
    table('labtable', ['Facility','2023','2024','Change'], rows.map(r => [r.activity,fmt(r.earlier),fmt(r.later),(r.change > 0 ? '+' : '')+fmt(r.change)]));
    $('labnote').textContent = $('lab').value === 'Central' ? 'Central’s recording studios were closed to the public throughout 2023. The zero reflects that closure.' : 'VPL reports recording studios and digitization/creation stations separately at Bud Osborn.';
  }
  function survey() {
    const {survey:r,annual:a} = surveyComparison(data,$('region').value,$('year').value);
    const fields = [['Opening hours','hours_open'],['Programs / events','programs'],['Program attendances / participants','program_attendance']];
    if (!a) fields.push(['In-person visits','annual_in_person_visits']);
    table('nstable',a ? ['Measure','Provincial survey','Halifax annual report'] : ['Measure','Provincial survey'],fields.map(([label,key]) => a ? [label,fmt(r[key]),fmt(a[key])] : [label,fmt(r[key])]));
    $('comparison').textContent = a ? (r.hours_open === a.hours_open ? 'Both sources report '+fmt(a.hours_open)+' opening hours. ' : 'The published opening-hour figures differ. ')+'The provincial survey includes self-directed, virtual and in-person programming. The publications do not reconcile their program or attendance totals.' : 'Totals apply to the entire selected library system over the fiscal year. Program attendance counts participations, so someone attending several programs can appear several times.';
  }
  function years() {
    const available = data.survey.filter(r => r.region === $('region').value).map(r => r.year).sort().reverse();
    options('year', available, $('year').value || data.hpl.year);
    survey();
  }
  for (const id of ['task','city']) $(id).onchange = tasks;
  for (const id of ['lab','measure']) $(id).onchange = lab;
  $('region').onchange = years; $('year').onchange = survey;
  tasks(); lab(); years();
});
