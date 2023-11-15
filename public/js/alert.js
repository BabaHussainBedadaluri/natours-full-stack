export const hideAlert = () => {
  const ele = document.querySelector('.alert');
  if (ele) ele.parentElement.removeChild(ele);
};

export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};
