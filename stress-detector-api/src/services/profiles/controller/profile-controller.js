import ProfileRepositories from '../repositories/profile-repositories.js';
import response from '../../../utils/response.js';
import { InvariantError, AuthenticationError } from '../../../exceptions/index.js';
import bcrypt from 'bcrypt';

export const updateInfo = async (req, res, next) => {
  const { id } = req.user;
  const { fullname, email } = req.validated;

  const isEmailExist = await ProfileRepositories.verifyNewEmail(email, id);

  if (isEmailExist) {
    return next(new InvariantError('Gagal memperbarui profil. Email sudah digunakan.'));
  }

  const updatedUser = await ProfileRepositories.updateUserInfo(id, { fullname, email });

  if (!updatedUser) {
    return next(new InvariantError('Profil gagal diperbarui'));
  }

  return response(res, 200, 'Profil berhasil diperbarui', updatedUser);
};

export const updatePassword = async (req, res, next) => {
  const { id } = req.user;
  const { oldPassword, newPassword } = req.validated;

  const isMatch = await ProfileRepositories.verifyUserPasswordById(id, oldPassword);

  if (!isMatch) {
    return next(new AuthenticationError('Password lama tidak sesuai'));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedUser = await ProfileRepositories.updateUserPassword(id, hashedPassword);

  if (!updatedUser) {
    return next(new InvariantError('Password gagal diperbarui'));
  }

  return response(res, 200, 'Password berhasil diperbarui', { id: updatedUser.id });
};
