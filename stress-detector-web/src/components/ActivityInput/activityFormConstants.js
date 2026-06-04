const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getYesterdayDateString = (date = new Date()) => {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);

  return getLocalDateString(yesterday);
};

const getPastActivityDateOptions = (date = new Date(), dayCount = 4) =>
  Array.from({ length: dayCount }, (_, index) => {
    const optionDate = new Date(date);
    optionDate.setDate(optionDate.getDate() - (index + 1));

    return {
      value: getLocalDateString(optionDate),
      date: optionDate,
    };
  });

const createInitialActivityForm = () => ({
  activityDate: getYesterdayDateString(),
  sleepHours: "",
  studyHours: "",
  screenTimeHours: "",
  socialMediaHours: "",
  physicalActivityMinutes: "",
  dailyNote: "",
  moodScore: "0",
  fatigueLevel: "0",
  assignmentLoad: "0",
  deadlinePressure: "0",
});

const initialActivityForm = createInitialActivityForm();

const activityNumberFields = [
  "sleepHours",
  "studyHours",
  "screenTimeHours",
  "socialMediaHours",
  "physicalActivityMinutes",
  "moodScore",
  "fatigueLevel",
  "assignmentLoad",
  "deadlinePressure",
];

export {
  activityNumberFields,
  createInitialActivityForm,
  getLocalDateString,
  getPastActivityDateOptions,
  getYesterdayDateString,
  initialActivityForm,
};
