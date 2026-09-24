export type CalibrationPoint = { setting: number; distance: number };

// Bracket a user's measured cm/360. Bisection needs monotonic response, not a
// guessed game yaw coefficient or an assumption that the slider is linear.
export function calibrationStep(a: CalibrationPoint, b: CalibrationPoint, target: number) {
  if (
    ![a.setting, a.distance, b.setting, b.distance, target].every(
      (n) => Number.isFinite(n) && n > 0,
    )
  )
    return { error: 'Enter positive settings and measured distances for both samples.' };
  if (a.setting === b.setting || a.distance === b.distance)
    return { error: 'Use two different sensitivities with different measured distances.' };
  if ((a.setting - b.setting) * (a.distance - b.distance) >= 0)
    return {
      error:
        'Higher sensitivity should need less mouse travel. Check your measurements and keep DPI, zoom, and acceleration unchanged.',
    };
  if (target < Math.min(a.distance, b.distance) || target > Math.max(a.distance, b.distance))
    return {
      error:
        'Your target distance must sit between the two measured distances. Take a wider pair of samples.',
    };
  if (target === a.distance) return { setting: a.setting, measured: true };
  if (target === b.distance) return { setting: b.setting, measured: true };
  return { setting: (a.setting + b.setting) / 2, measured: false };
}
