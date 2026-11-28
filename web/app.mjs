import {printPlan} from './print.mjs';
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
  for (const city of ['oakville', 'toronto']) {
    const guide = $(city + '-guide').href;
    const check = data.documents?.find(doc => doc.url === guide);
    if (check) $(city + '-status').textContent = 'Rate and booking rules last verified ' + check.verified + ' · ' + check.status;
  }
  options('task', [...new Set(data.services.map(row => row.task))], 'VHS tape');
  options('city', ['All locations', ...new Set(data.services.map(row => row.city).sort())]);
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
      if (r.guide !== r.booking) links.append(link('Equipment guide ↗', r.guide));
      links.append(link((r.action || 'Booking at the library') + ' ↗', r.booking));
      box.append(node('p',r.city,'minitag'),node('h3', r.facility || (r.city === 'Vancouver' ? 'Central Inspiration Lab' : 'Central Media Studio')),node('p',r.equipment),node('p',r.bring),links);
      return box;
    }));
    if (!results.length) $('services').append(node('p','This project has no verified equipment listing for your selection. Check all locations for other options.','callout'));
  }
  function printEstimate() {
    const plan = printPlan($('print-minutes').value, $('print-grams').value);
    const currency = value => value.toLocaleString('en-CA',{style:'currency',currency:'CAD'});
    $('halifax-fit').textContent = !plan ? 'Enter a positive time and weight' : plan.halifax ? 'Within the published time limit' : 'Exceeds the under-two-hour limit';
    $('oakville-fit').textContent = !plan ? 'Waiting for an estimate' : plan.oakvilleRegular ? 'Within a three-hour appointment' : 'Ask the branch about a longer appointment';
    $('oakville-price').textContent = plan ? 'Estimated CAD ' + currency(plan.oakvilleCost) + ' before HST.' : '';
    $('toronto-fit').textContent = !plan ? 'Waiting for an estimate' : plan.torontoRegular ? 'Allow time for setup within two hours' : 'Ask for a longer-print booking';
    $('toronto-price').textContent = plan ? 'Estimated CAD ' + currency(plan.torontoCost) + ' in filament charges.' : '';
    $('richmond-fit').textContent = !plan ? 'Waiting for an estimate' : plan.richmond || 'Exceeds both printer limits';
    $('richmond-price').textContent = plan?.richmond
      ? 'Estimated CAD ' + currency(plan.cost) + ' = $2 service fee + ' + currency(plan.material) + ' filament + ' + currency(plan.time) + ' printing time. Partial hours are prorated here. Confirm the actual charge with the library.'
      : 'The 2+ printers allow up to 8 hours. The S7 allows up to 16 hours. A Richmond card and training are required.';
  }
  $('print-minutes').oninput = $('print-grams').oninput = printEstimate;
  printEstimate();
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
