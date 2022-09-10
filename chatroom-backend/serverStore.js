const {v4: uuidv4} = require('uuid'); // import package for generating ids for rooms

const connectedUsers = new Map();
let activeRooms = [];

let io = null;
const setSocketServerInstance = (ioInstance) => {
    io = ioInstance;
}

const getSocketServerInstance = () => {
    return io;
}

const addNewConnectedUser = ({socketId, userId}) => {
    connectedUsers.set(socketId, {userId});
    console.log('new connected user');
    console.log(connectedUsers);
}

const removeConnectedUser = (socketId) => {
    if(connectedUsers.has(socketId)){
        connectedUsers.delete(socketId);
        console.log('deleted an user');
        console.log(connectedUsers);
    }
}

const getActiveConnections = (userId) => {
    const activeConnections = [];
    connectedUsers.forEach((value, key) => {  //foreach function gives value then key (?)
        if (value.userId === userId){
            activeConnections.push(key); // key is socketId
        }
    });
    return activeConnections; // return all socketId of this user
}

const getOnlineUsers = () => {
    const onlineUsers = [];
    connectedUsers.forEach((value, key) => {
        onlineUsers.push({socketId: key, userId: value.userId});
    });
    return onlineUsers;
}


// rooms

const addNewActiveRoom = (userId, socketId) => {
    const newActiveRoom = {
        roomCreator:{
            userId,
            socketId
        },
        participants:[
            {
                userId,
                socketId
            }
        ],
        roomId: uuidv4()
    }

    activeRooms = [...activeRooms, newActiveRoom]; // let not constant
    console.log('new active room :', activeRooms);
    console.log('w222:', newActiveRoom.participants[0].socketId);
    return newActiveRoom;
}

const getActiveRooms = () => {
    return [...activeRooms]; // return copy
}

const getActiveRoom = (roomId) => {
    const activeRoom = activeRooms.find(
        activeRoom => activeRoom.roomId === roomId);
    if (activeRoom){
        return {...activeRoom}; 
    } else{
        return null;
    }
}

const joinActiveRoom = (roomId, newParticipant) => {
    const room = activeRooms.find(room => room.roomId === roomId);
    activeRooms = activeRooms.filter((room) => room.roomId !== roomId);

    const updateRoom = {
        ...room,
        participants: [...room.participants, newParticipant]
    }

    activeRooms.push(updateRoom);
    console.log('join', activeRooms);
}

const leaveActiveRoom = (roomId, participantSocketId) => {
    const activeRoom = activeRooms.find((room) => room.roomId === roomId);

    if(activeRoom){
        const copyOfActiveRoom = {...activeRoom};
        copyOfActiveRoom.participants = copyOfActiveRoom.participants.filter(
            (participant) => {
                return participant.socketId !== participantSocketId
            }
        );

        activeRooms = activeRooms.filter((room) => room.roomId !== roomId);

        if (copyOfActiveRoom.participants.length > 0){
            activeRooms.push(copyOfActiveRoom);
        }

    }
}
  

module.exports = {
    addNewConnectedUser,
    removeConnectedUser,
    getActiveConnections,
    setSocketServerInstance,
    getSocketServerInstance,
    getOnlineUsers,
    addNewActiveRoom,
    getActiveRooms,
    getActiveRoom,
    joinActiveRoom,
    leaveActiveRoom
}