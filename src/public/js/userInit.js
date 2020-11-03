let contactSocketID;
const result = document.querySelector('.contact__list');
const contactWrapper = document.querySelector('.section__contact--wrapper');
const chatWrapper = document.querySelector('.section__chat--wrapper');
const userName = document.querySelector('.user__input');
const contactName = document.querySelector('.contact__input');
const btnSearch = document.querySelector('.contact__submit');
const btnSendMessage = document.querySelector('.send__message');
const chatSection = document.querySelector('.chat__display--inner');
const contactResult = document.querySelector('.contact__result');
const navbar = document.querySelector('nav');
const main = document.querySelector('main');
const contactUserName = document.querySelector('.contact__name');
const logOffBtn = document.querySelector('.member__logoff');
const imageSendInput = document.querySelector('.send__image--input');

function bufferToBase64(buffer) {
  //Vì class Buffer là một class API Built in của Nodejs, nó không hỗ trợ dùng trong file JS phía client cho nên chúng ta sữ dụng
  // một build in method của Window xử lý dữ liệu buffer chuyển đổi thành base64
  return btoa(
    new Uint8Array(buffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  );
}

document.addEventListener('click', function (e) {
  if (e.target && e.target.className == 'chat__active') {
    const {contactid} = e.target.dataset;

    socket.emit('send-request-chat', {
      senderName: userName.value,
      receiverID: contactid,
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  userName.addEventListener('blur', (event) => {
    socket.emit('initial__user', event.target.value);
  });

  btnSearch.addEventListener('click', () => {
    if (contactName.value === '' || userName.value === '')
      bootbox.alert('Bạn không được để trống các trường');
    else socket.emit('find__contact', contactName.value);
  });

  btnSendMessage.addEventListener('click', () => {
    socket.emit('send-message', {
      receiverID: contactSocketID,
      message: document.querySelector('.emojionearea-editor').innerHTML,
    });
    const content = document.querySelector('.emojionearea-editor').innerHTML;

    chatSection.insertAdjacentHTML(
      'beforeend',
      `
      <div style='width:100%; display:flex; justify-content: flex-end'>
          <div class='message__content--sender'>${content}<div>
      </div>
      `
    );

    document.querySelector('.emojionearea-editor').innerHTML = '';

    let newestElement = document.querySelectorAll('.chat__display--inner>div');
    newestElement = newestElement[newestElement.length - 1];
    newestElement.scrollIntoView();
  });

  imageSendInput.addEventListener('change', (event) => {
    const imageFile = event.target.files[0];
    const imageType = imageFile.type.split('/')[0];

    // Detect image type
    if (imageType !== 'image') {
      bootbox.alert('Bạn đã chọn sai kiểu tập tin. Chỉ chấp nhận file ảnh');
      return;
    }

    let formDataAttachmentFile = new FormData();
    formDataAttachmentFile.append('my-attach-image', imageFile);
    formDataAttachmentFile.append('receiverID', contactSocketID);

    $.ajax({
      url: '/image',
      type: 'post',
      cache: false,
      contentType: false,
      processData: false,
      data: formDataAttachmentFile,
      success: function (data) {
        chatSection.insertAdjacentHTML(
          'beforeend',
          `
          <div style='width:100%; display:flex; justify-content: flex-end'>
            <img src="data:${data.mimetype}; base64, ${bufferToBase64(
            data.buffer.data
          )}" style='width:20rem;height:20rem;border-radius:none'/>
          </div>
          `
        );

        socket.emit('send-image', {
          imageData: data,
          receiverID: contactSocketID,
        });
      },
    });
  });

  logOffBtn.addEventListener('click', () => {
    bootbox.prompt('Bạn muốn huỷ kết? Gửi tin nhắn tạm biệt', function (
      message
    ) {
      socket.emit('cancel-chat', {
        receiverID: contactSocketID,
        message: message,
      });

      contactSocketID = '';
      contactWrapper.style.display = 'flex';
      chatWrapper.style.display = 'none';
      navbar.style.display = 'none';
      main.style.height = '100%';
      main.style.borderRadius = '0';
      userName.value = '';
      contactName.value = '';
      result.innerHTML = '';
      result.display = 'none';
    });
  });
});

socket.on('response-find__contact', (data) => {
  result.innerHTML = '';
  data.forEach((item) => {
    const liElement = document.createElement('li');
    liElement.setAttribute('class', 'contact__item');
    contactResult.style.display = 'block';

    result.insertAdjacentHTML(
      'beforeend',
      `<li class="contact__item">
          <div>
            <p class="contact__item--name"><strong>Name</strong> : ${item.name}</p>
            <p><i class="contact__item--id"><strong>ID</strong> : ${item.id}</i></p>
          </div>
          <div>
            <button class='chat__active' data-contactId = ${item.id} >Chat</button>
          </div>
        </li>`
    );
  });
});

socket.on('response-send-request-chat', (data) => {
  bootbox.confirm({
    size: 'small',
    message: data.message,
    buttons: {
      cancel: {
        label: '<i class="fa fa-times"></i> Cancel',
      },
      confirm: {
        label: '<i class="fa fa-check"></i> Confirm',
      },
    },
    callback: function (result) {
      if (result) {
        contactSocketID = data.senderID;
        contactWrapper.style.display = 'none';
        chatWrapper.style.display = 'flex';

        socket.emit('accept-request-chat', {
          contactSocketID,
          receiverName: userName.value,
        });
        navbar.style.display = 'block';
        main.style.height = '90%';
        main.style.borderRadius = '3rem';
      }

      contactUserName.innerHTML = data.senderName;
    },
  });
});

socket.on('response-accept-request-chat', (data) => {
  bootbox.alert(data);
  contactSocketID = data.senderID;
  contactWrapper.style.display = 'none';
  chatWrapper.style.display = 'flex';
  navbar.style.display = 'block';
  main.style.height = '90%';
  main.style.borderRadius = '3rem';
  contactUserName.innerHTML = data.receiverName;
});

socket.on('response-send-message', (data) => {
  chatSection.insertAdjacentHTML(
    'beforeend',
    `
    <div style='width:100%; display:flex; justify-content: flex-start'>
          <div class='message__content--receiver'>${data}<div>
      </div>
  `
  );

  let newestElement = document.querySelectorAll('.chat__display--inner>div');
  newestElement = newestElement[newestElement.length - 1];
  newestElement.scrollIntoView();
});

socket.on('response-send-image', (data) => {
  console.log(data);
  chatSection.insertAdjacentHTML(
    'beforeend',
    `
          <div style='width:100%; display:flex; justify-content: flex-start'>
            <img src="data:${data.mimetype}; base64, ${bufferToBase64(
      data.buffer.data
    )}" style='width:20rem;height:20rem;border-radius:none'/>
          </div>
          `
  );
});

socket.on('response-cancel-chat', (message) => {
  bootbox.alert(`Người dùng đã ngắt kết nối với tin nhắn '${message}'`);
  contactSocketID = '';
  contactWrapper.style.display = 'flex';
  chatWrapper.style.display = 'none';
  navbar.style.display = 'none';
  main.style.height = '100%';
  main.style.borderRadius = '0';
  userName.value = '';
  contactName.value = '';
  result.innerHTML = '';
});
