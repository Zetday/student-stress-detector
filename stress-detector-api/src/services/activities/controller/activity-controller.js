import response from '../../../utils/response.js';
import {
  AuthorizationError,
  InvariantError,
  NotFoundError,
} from '../../../exceptions/index.js';
import ActivityRepositories from '../repositories/activity-repositories.js';

export const createActivity = async (req, res, next) => {
  const {
    studyHours,
    sleepHours,
    classAttendance,
    examFrequency,
    assignmentLoad,
    socialActivity,
    caffeineIntake,
    physicalExercise,
    socialMediaUsage,
    screenTime,
    familyIncomeLevel,
    peerPresure,
    familySupport,
    anxietyLevel,
    fatigueLevel,
    mood,
    workHours,
    exerciseMinutes,
    date,
  } = req.validated;
  const { userId } = req.user;
  const activity = await ActivityRepositories.createActivity({
    userId,
    studyHours,
    sleepHours,
    classAttendance,
    examFrequency,
    assignmentLoad,
    socialActivity,
    caffeineIntake,
    physicalExercise,
    socialMediaUsage,
    screenTime,
    familyIncomeLevel,
    peerPresure,
    familySupport,
    anxietyLevel,
    fatigueLevel,
    mood,
    workHours,
    exerciseMinutes,
    date,
  });

  if (!activity) {
    return next(new InvariantError('Gagal menambahkan aktivitas'));
  }

  return response(res, 201, 'Aktivitas berhasil ditambahkan', { activity });
};

export const getActivities = async (req, res) => {
  const { userId } = req.user;

  const activities = await ActivityRepositories.getActivitiesByUser(userId);

  return response(res, 200, 'Aktivitas berhasil ditampilkan', { activities });
};

export const getActivityById = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const activity = await ActivityRepositories.getActivityById(id);

  if (!activity) {
    return next(new NotFoundError('Aktivitas tidak ditemukan'));
  }

  const isOwner = await ActivityRepositories.verifyActivityAccess(id, userId);

  if (!isOwner) {
    return next(
      new AuthorizationError('Anda tidak berhak mengakses resource ini'),
    );
  }

  return response(res, 200, 'Aktivitas berhasil ditampilkan', { activity });
};

export const deleteActivity = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const isOwner = await ActivityRepositories.verifyActivityOwner(id, userId);

  if (!isOwner) {
    return next(
      new AuthorizationError('Anda tidak berhak menghapus aktivitas ini'),
    );
  }

  const deletedActivity = await ActivityRepositories.deleteActivity(id);

  if (!deletedActivity) {
    return next(new NotFoundError('Aktivitas tidak ditemukan'));
  }

  return response(res, 200, 'Aktivitas berhasil dihapus', { deletedActivity });
};
