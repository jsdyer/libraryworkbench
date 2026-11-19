export function servicesFor(services, task, city) {
  return services.filter(row => row.task === task && (city === 'Both cities' || row.city === city));
}
export function labRows(labs, lab, measure) {
  const selected = labs.filter(row => row.lab === lab);
  return [...new Set(selected.map(row => row.activity))].map(activity => {
    const records = selected.filter(row => row.activity === activity);
    function value(year) {
      const row = records.find(row => row.year === year);
      if (!row) return null;
      if (measure === 'minutes') return row.sessions > 0 ? 60 * row.hours / row.sessions : null;
      return row[measure];
    }
    const earlier = value(2023);
    const later = value(2024);
    return {activity, earlier, later, change: earlier == null || later == null ? null : later - earlier};
  });
}
export function surveyComparison(data, region, year) {
  const survey = data.survey.find(row => row.region === region && row.year === year);
  const annual = region === 'Halifax Public Libraries' && year === data.hpl.year ? data.hpl : null;
  return {survey, annual};
}
