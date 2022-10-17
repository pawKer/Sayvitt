import { confirmAlert } from 'react-confirm-alert';
export const openDeleteSavedModal = (noPosts, callback) => {
  confirmAlert({
    title: 'Confirm to submit',
    message: `Are you sure you want to unsave ${noPosts} posts?`,
    buttons: [
      {
        label: 'Yes',
        onClick: callback,
      },
      {
        label: 'No',
      },
    ],
  });
};
