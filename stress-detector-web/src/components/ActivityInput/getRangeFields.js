import getRangeStatus from "./getRangeStatus";

function getRangeFields(t, form) {
  const assignmentStatus = getRangeStatus(form.assignmentLoad, t);
  const deadlineStatus = getRangeStatus(form.deadlinePressure, t);
  const fatigueStatus = getRangeStatus(form.fatigueLevel, t);

  return [
    {
      name: "assignmentLoad",
      type: "range",
      min: "0",
      max: "10",
      step: "1",
      label: t.ActivityAssignmentLoadTitle,
      minLabel: t.ActivityLowLabel,
      maxLabel: t.ActivityExtremeLabel,
      status: assignmentStatus.label,
      statusColor: assignmentStatus.color,
    },
    {
      name: "deadlinePressure",
      type: "range",
      min: "0",
      max: "10",
      step: "1",
      label: t.DeadlinePressureTitle,
      minLabel: t.ActivityRelaxedLabel,
      maxLabel: t.ActivityUrgentLabel,
      status: deadlineStatus.label,
      statusColor: deadlineStatus.color,
    },
    {
      name: "fatigueLevel",
      type: "range",
      min: "0",
      max: "10",
      step: "1",
      label: t.FatigueLevelTitle,
      minLabel: t.ActivityFreshLabel,
      maxLabel: t.ActivityExhaustedLabel,
      status: fatigueStatus.label,
      statusColor: fatigueStatus.color,
    },
    {
      name: "moodScore",
      type: "range",
      min: "0",
      max: "10",
      step: "1",
      label: t.MoodScoreTitle,
      minLabel: t.ActivityBadLabel,
      maxLabel: t.ActivityVeryGoodLabel,
      status: `${form.moodScore}/10`,
      statusColor: "text-emerald-400",
    },
  ];
}

export default getRangeFields;
