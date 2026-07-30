export function calculateFare(vehicle) {
  const base = vehicle.baseFare;
  const driverAllowance = vehicle.driverAllowance;
  const toll = vehicle.toll ?? 150;
  const gst = vehicle.gst ?? Math.round((base + driverAllowance + toll) * 0.05);
  const total = vehicle.totalFare ?? base + driverAllowance + toll + gst;
  return { base, driverAllowance, toll, gst, total };
}
