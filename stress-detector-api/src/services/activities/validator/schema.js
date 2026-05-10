import Joi from 'joi';

export const createActivitySchema = Joi.object({
  studyHours: Joi.number().required(),
  sleepHours: Joi.number().required(),
  classAttendance: Joi.number().required(),
  examFrequency: Joi.number().required(),
  assignmentLoad: Joi.number().required(),
  socialActivity: Joi.number().required(),
  caffeineIntake: Joi.number().required(),
  physicalExercise: Joi.number().required(),
  socialMediaUsage: Joi.number().required(),
  screenTime: Joi.number().required(),
  familyIncomeLevel: Joi.string().required(),
  peerPresure: Joi.number().required(),
  familySupport: Joi.number().required(),
  anxietyLevel: Joi.number().required(),
  fatigueLevel: Joi.number().required(),
  mood: Joi.number().required(),
  workHours: Joi.number().required(),
  exerciseMinutes: Joi.number().required(),
  date: Joi.date().required(),
});
