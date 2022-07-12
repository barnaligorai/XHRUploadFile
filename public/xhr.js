const sendReq = (event) => {
  const xhr = new XMLHttpRequest();
  const formElement = document.querySelector('form');
  const formData = new FormData(formElement);
  xhr.onload = () => {
    console.log('response---------', xhr.response);
  };
  xhr.open('POST', '/data');
  xhr.send(formData);
};

const main = () => {
  const submitButton = document.getElementById('submit');
  submitButton.onclick = sendReq;
};

window.onload = main;
