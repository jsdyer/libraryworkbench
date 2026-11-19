import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {labRows,servicesFor,surveyComparison} from '../web/model.mjs';
const data = JSON.parse(readFileSync(new URL('../web/data/edition.json',import.meta.url)));
test('Source counts and closure are preserved',()=>{
  assert.deepEqual(labRows(data.labs,'Central','sessions')[0],{activity:'Recording studios',earlier:0,later:4483,change:4483});
  const {survey,annual}=surveyComparison(data,'Halifax Public Libraries','2024-2025');
  assert.equal(annual.hours_open,37227); assert.equal(survey.hours_open,annual.hours_open);
  assert.equal(annual.program_attendance,229035);
  assert.equal(surveyComparison(data,'Halifax Public Libraries','2023-2024').annual,null);
});
test('City and equipment filters combine',()=>{
  assert.equal(servicesFor(data.services,'VHS tape','Both cities').length,2);
  assert.equal(servicesFor(data.services,'Camcorder tape','Halifax').length,0);
});

import {equipmentFor, tapeEstimate} from '../web/tapes.mjs';
test('Tape compatibility follows the deck, cassette and television standard', () => {
  assert.equal(equipmentFor('VHS-C', 'PAL').heading, 'Ask about an alternative player');
  assert.equal(equipmentFor('VHS', 'Unknown').heading, 'Check the video standard');
  assert.equal(equipmentFor('Video8 / Hi8 / Digital8', 'PAL').heading, '8 mm camcorder station');
  assert.equal(equipmentFor('Video8 / Hi8 / Digital8', 'Unknown').heading, '8 mm camcorder station');
  assert.equal(equipmentFor('Other or unidentified cassette', 'NTSC').heading, 'Identify the tape and player');
});
test('Batch runtime and approximate storage reject partial or malformed durations', () => {
  assert.deepEqual(tapeEstimate('60, 1:30, 45'), {count: 3, total: 195, gb: 13, longest: 90});
  for (const input of ['', '60,', '1:99', '-1', '0,1', '7abc', '1:5', '99999999999999999999'])
    assert.equal(tapeEstimate(input), null);
});
test('Closed facilities have an undefined average, other rows use hours over sessions', () => {
  const studios = labRows(data.labs, 'Central', 'minutes')[0];
  assert.equal(studios.earlier, null);
  assert.equal(studios.change, null);
  assert.equal(studios.later, 60 * 10499 / 4483);
  assert.equal(servicesFor(data.services, 'Regular 8 or Super 8 film', 'Vancouver').length, 1);
});

import {printPlan} from '../web/print.mjs';
test('Richmond estimates and the Halifax strict time limit', () => {
  assert.equal(printPlan(90,30).cost, 6.50);
  assert.equal(printPlan(119,30).halifax,true);
  assert.equal(printPlan(120,30).halifax,false);
  assert.equal(printPlan(481,30).richmond,'Ultimaker S7 only');
  assert.equal(printPlan(961,30).richmond,'');
  assert.equal(printPlan(-1,30),null);
});
