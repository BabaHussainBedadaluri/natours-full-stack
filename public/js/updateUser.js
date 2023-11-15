import axios from 'axios';
import { showAlert } from './alert';
export const updateUser = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? `/api/v1/users/updateMe`
        : `/api/v1/users/passwordUpdate`;
    const result = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (result.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
