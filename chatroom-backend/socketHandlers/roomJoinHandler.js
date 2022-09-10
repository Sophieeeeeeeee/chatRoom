const serverStore = require('../serverStore');
const roomsUpdates = require('./updates/rooms');
const getActiveRoom = require('./updates/rooms');

const roomJoinHandler = (socket, data) => {
    const {roomId} = data;
    const participantsDetails = {
        userId: socket.user.userId,
        socketId: socket.id
    }

    const roomDetails = serverStore.getActiveRoom(roomId);

    serverStore.joinActiveRoom(roomId, participantsDetails);

    // send info to users int this room that they should prepare for incoming conneciton
    roomDetails.participants.forEach((participant) => {
        if(participant.socketId !== participantsDetails.socketId){
            socket.to(participant.socketId).emit('conn-prepare', {
                connUserSocketId: participantsDetails.socketId
            });

        }
    })
    roomsUpdates.updateRooms();
}

module.exports = roomJoinHandler;