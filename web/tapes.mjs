// Equipment summaries manually checked against the VPL Central equipment inventory on 2026-11-19.
export const formats = {
  'VHS': {station: 'VHS station', standards: ['NTSC'], note: 'Bring a full-size VHS cassette.'},
  'VHS-C': {station: 'VHS station with VHS-C adapter', standards: ['NTSC'], note: 'The library lists a VHS-C adapter for the smaller cassette.'},
  'MiniDV / DV / DVCAM': {station: 'MiniDV / DV station', standards: ['NTSC'], note: 'The DV deck accepts these three digital cassette formats.'},
  'Video8 / Hi8 / Digital8': {station: '8 mm camcorder station', standards: ['NTSC', 'PAL'], note: 'The library’s Digital8 camcorder plays all three listed tape formats.'},
  'Other or unidentified cassette': {station: 'A/V hook-up station', standards: [], note: 'VPL offers an input for your own compatible camcorder. Ask staff about your player, cables and tape before booking.'}
};

export function equipmentFor(format, standard) {
  const item = formats[format];
  if (!item || !item.standards.length) return {heading: 'Identify the tape and player', detail: formats['Other or unidentified cassette'].note};
  if (standard === 'Unknown' && item.standards.length === 1) {
    return {heading: 'Check the video standard', detail: item.station + ' supports NTSC for this format. Look for the standard on the tape or original player and ask staff if unsure.'};
  }
  if (standard !== 'Unknown' && !item.standards.includes(standard)) {
    return {heading: 'Ask about an alternative player', detail: 'VPL lists ' + item.standards.join(' and ') + ' for its ' + item.station + '. Ask whether a compatible player can use the A/V hook-up for your ' + standard + ' tape.'};
  }
  return {heading: item.station, detail: item.note + ' Listed video standards: ' + item.standards.join(' and ') + '.'};
}

// Each entry is either an integer minute count or hours:minutes.
export function tapeEstimate(input) {
  if (!input.trim()) return null;
  const durations = input.split(',').map(part => {
    const token = part.trim();
    if (/^\d+$/.test(token)) return Number(token);
    const time = /^(\d+):([0-5]\d)$/.exec(token);
    return time ? Number(time[1]) * 60 + Number(time[2]) : NaN;
  });
  const total = durations.reduce((sum, n) => sum + n, 0);
  if (durations.some(n => n <= 0 || !Number.isSafeInteger(n)) || !Number.isSafeInteger(total)) return null;
  return {count: durations.length, total, gb: total / 60 * 4, longest: Math.max(...durations)};
}
