const serverStore = require('../serverStore');
const roomsUpdate = require('./updates/rooms');

const roomCreateHandler = (socket) => {
    console.log('handling room create event');

    const socketId = socket.id;

    const userId = socket.user.userId;

    const roomDetails = serverStore.addNewActiveRoom(userId, socketId);


    const io = serverStore.getSocketServerInstance();
    io.to(socketId).emit('room-create', {
        roomDetails
    });

    roomsUpdate.updateRooms();
}

module.exports = roomCreateHandler;