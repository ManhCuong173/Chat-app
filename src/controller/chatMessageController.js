const multer = require('multer');

const attachmentFileMessageUploadFileFunc = (nameField) => {
  let attachmentFileMessageUploadFile = multer().single(nameField);

  return attachmentFileMessageUploadFile;
};

module.exports = {
  attachmentFileMessageUploadFileFunc,
};
