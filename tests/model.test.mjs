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
