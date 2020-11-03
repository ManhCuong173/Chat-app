let findContact = (io) => {
  let clients = {};

  io.on('connection', (socket) => {
    clients[socket.id] = {
      id: socket.id,
      name: '',
    };

    socket.on('initial__user', (data) => {
      clients[socket.id].name = data;
    });

    socket.on('find__contact', (data) => {
      let result = [];
      for (let key in clients) {
        if (
          clients[key].id !== socket.id &&
          clients[key].name.toLowerCase().includes(data.toLowerCase())
        ) {
          result.push(clients[key]);
        }
      }

      socket.emit('response-find__contact', result);
    });

    socket.on('send-request-chat', (data) => {
      socket.to(data.receiverID).emit('response-send-request-chat', {
        senderID: socket.id,
        senderName: data.senderName,
        message: `Người dùng ${data.senderName} muốn mở một cuộc hội thoại với bạn`,
      });
    });

    socket.on('accept-request-chat', (data) => {
      socket.to(data.contactSocketID).emit('response-accept-request-chat', {
        senderID: socket.id,
        message: `Người dùng ${data.receiverName} chấp nhận yêu cầu kết nối`,
        receiverName: data.receiverName,
      });
    });

    socket.on('send-message', (data) => {
      socket.to(data.receiverID).emit('response-send-message', data.message);
    });

    socket.on('send-image', (data) => {
      socket.to(data.receiverID).emit('response-send-image', data.imageData);
    });

    socket.on('cancel-chat', (data) => {
      socket.to(data.receiverID).emit('response-cancel-chat', data.message);
    });

    socket.on('disconnect', () => {
      delete clients[socket.id];
    });
  });
};

module.exports = findContact;
