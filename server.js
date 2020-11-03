const express = require('express');
const app = express();
const server = require('http').Server(app);
const socket = require('socket.io');
const ConfigViewEngine = require('./config/viewEngine');
const initSocket = require('./src/socket/index');
const bodyParser = require('body-parser');
const {
  attachmentFileMessageUploadFileFunc,
} = require('./src/controller/chatMessageController');
require('dotenv').config();

// Init port
const port = 3000 || process.env.PORT;
ConfigViewEngine(app);

let io = socket(server);
initSocket(io);

app.use(bodyParser.json());

// GET
app.get('/', (req, res) => {
  res.render('home.ejs');
});

app.post('/image', (req, res) => {
  const attachmentFileMessageUpLoad = attachmentFileMessageUploadFileFunc(
    'my-attach-image'
  );
  attachmentFileMessageUpLoad(req, res, (error) => {
    if (error) {
      if (error.message) {
        return res.status(500).send('Loi file');
      }
      return res.status(500).send(error);
    }

    res.status(200).send(req.file);
  });
});

server.listen(port, () => {
  console.log(`Run successfully at ${port}`);
});
