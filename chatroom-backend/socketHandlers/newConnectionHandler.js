const serverStore = require('../serverStore');
const friendsUpdate = require('../socketHandlers/updates/friends');
const roomsUpdate = require('./updates/rooms');


const newConnectionHandler = async (socket, io) => {
    const userDetails = socket.user;

    serverStore.addNewConnectedUser({
        socketId: socket.id,
        userId: userDetails.userId
    });

    // get pending friends invitation list
    friendsUpdate.updateFriendsPendingInvitations(userDetails.userId);
    // get friends list
    friendsUpdate.updateFriends(userDetails.userId);

    setTimeout(() => { //update room after setup 
        roomsUpdate.updateRooms(socket.id);
    }, [200]); 
}

module.exports = newConnectionHandler