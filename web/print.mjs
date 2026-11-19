export function printPlan(minutes, grams) {
  const time = Number(minutes);
  const material = Number(grams);
  if (!Number.isInteger(time) || time <= 0 || !Number.isFinite(material) || material <= 0) return null;
  return {
    halifax: time < 120,
    richmond: time <= 480 ? 'Ultimaker 2+ / 2+ Connect or S7' : time <= 960 ? 'Ultimaker S7 only' : '',
    material: material * 0.10,
    time: time / 60,
    cost: 2 + material * 0.10 + time / 60,
  };
}
