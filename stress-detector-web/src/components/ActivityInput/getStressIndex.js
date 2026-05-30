import getNumericValue from "./getNumericValue";

function getStressIndex(form) {
  const deadline = getNumericValue(form.deadlinePressure) * 4;
  const fatigue = getNumericValue(form.fatigueLevel) * 3;
  const assignment = getNumericValue(form.assignmentLoad) * 3;
  const screenTime = getNumericValue(form.screenTimeHours) * 2;
  const sleepPenalty = Math.max(0, 8 - getNumericValue(form.sleepHours)) * 4;
  const activityRelief = getNumericValue(form.physicalActivityMinutes) / 6;

  const score = Math.round(deadline + fatigue + assignment + screenTime + sleepPenalty - activityRelief);

  return Math.min(100, Math.max(0, score));
}

export default getStressIndex;
