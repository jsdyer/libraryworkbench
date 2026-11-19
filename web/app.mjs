import {$, node, link, options, table, load} from './ui.mjs';
import {servicesFor, labRows, surveyComparison} from './model.mjs';
import {formats, equipmentFor, tapeEstimate} from './tapes.mjs';
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
  options('measure', ['Hours of use','Sessions','Minutes per session']);
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
  options('tape-format', Object.keys(formats), 'VHS');
  options('video-standard', ['NTSC', 'PAL', 'Unknown'], 'NTSC');
  function planner() {
    const result = equipmentFor($('tape-format').value, $('video-standard').value);
    $('station-name').textContent = result.heading;
    $('station-detail').textContent = result.detail;
    const estimate = tapeEstimate($('durations').value);
    $('durations').setAttribute('aria-invalid', String(!estimate));
    if (!estimate) {
      $('capture-time').textContent = 'Enter a running time for each tape';
      $('capture-storage').textContent = 'Use positive whole minutes or h:mm, for example 45, 1:30.';
      $('capture-limit').textContent = '';
      return;
    }
    const hours = Math.floor(estimate.total / 60);
    const minutes = estimate.total % 60;
    const time = [hours ? hours + ' h' : '', minutes ? minutes + ' min' : ''].filter(Boolean).join(' ');
    $('capture-time').textContent = time + ' of copying time';
    const size = estimate.gb.toLocaleString('en-CA', {maximumFractionDigits: 1});
    $('capture-storage').textContent = estimate.count + (estimate.count === 1 ? ' tape' : ' tapes') +
      ' · about ' + size + ' GB in total at VPL’s rough rate of 4 GB per hour. Allow extra time for setup and saving.';
    $('capture-limit').textContent = estimate.longest >= 60
      ? 'At this rate, a tape of an hour or more may reach the 4 GB single-file limit on FAT32. VPL recommends exFAT for larger files.'
      : 'Actual file sizes depend on capture settings. Leave free space for saving your files.';
  }
  $('tape-format').onchange = planner;
  $('video-standard').onchange = planner;
  $('durations').oninput = planner;
  planner();
  function lab() {
    const measure = {'Sessions': 'sessions', 'Hours of use': 'hours', 'Minutes per session': 'minutes'}[$('measure').value];
    const display = n => n == null ? '—' : n.toLocaleString('en-CA', {maximumFractionDigits: measure === 'minutes' ? 1 : 3});
    const rows = labRows(data.labs,$('lab').value,measure);
    table('labtable', ['Facility','2023','2024','Change'], rows.map(r => [r.activity,display(r.earlier),display(r.later),(r.change > 0 ? '+' : '')+display(r.change)]));
    $('labnote').textContent = $('lab').value === 'Central' ? 'Central’s recording studios were closed to the public throughout 2023. Hours and sessions were zero that year.' : 'VPL reports recording studios and digitization/creation stations separately at Bud Osborn.';
    if (measure === 'minutes') $('labnote').textContent += ' Minutes per session divides total reported hours by sessions and multiplies by 60. A dash means no average can be calculated. The report groups creation and digitization together.';
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
