export function servicesFor(services, task, city) {
  return services.filter(row => row.task === task && (city === 'Both cities' || row.city === city));
}
export function labRows(labs, lab, measure) {
  const selected = labs.filter(row => row.lab === lab);
  return [...new Set(selected.map(row => row.activity))].map(activity => {
    const records = selected.filter(row => row.activity === activity);
    const earlier = records.find(row => row.year === 2023)[measure];
    const later = records.find(row => row.year === 2024)[measure];
    return {activity, earlier, later, change: later - earlier};
  });
}
export function surveyComparison(data, region, year) {
  const survey = data.survey.find(row => row.region === region && row.year === year);
  const annual = region === 'Halifax Public Libraries' && year === data.hpl.year ? data.hpl : null;
  return {survey, annual};
}
