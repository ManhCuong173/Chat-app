const chatFeature = require('./chatFeature');

let initSocket = (io) => {
  chatFeature(io);
};

module.exports = initSocket;
