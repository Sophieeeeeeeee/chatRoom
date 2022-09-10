const authSocket = require('./middleware/authSocket');
const newConnectionHandler = require('./socketHandlers/newConnectionHandler');
const diconnectHandler = require('./socketHandlers/disconnectHandler');
const directMessageHandler = require('./socketHandlers/directMessageHandler');
const directChatHistoryHandler = require('./socketHandlers/directChatHistoryHandler');
const roomCreateHandler = require('./socketHandlers/roomCreateHandler');
const roomJoinHandler = require('./socketHandlers/roomJoinHandler');
const roomLeaveHandler = require('./socketHandlers/roomLeaveHandler');
const roomInitializeConnectionHandler = require('./socketHandlers/roomInitializeConnectionHandler');
const roomSignalingDataHandler = require('./socketHandlers/roomSignalingDataHandler');

const serverStore = require('./serverStore');


const registerSocketServer = (server) => { // create socket server to connect to express server
    
    const io = require('socket.io')(server, { // pass http (express) server we created + config
        cors: {
            origin: '*', // receive from all
            methods: ['GET', 'POST']
        }
    })

    serverStore.setSocketServerInstance(io);

    io.use((socket, nextFunction) => { // before listening, verify token
        authSocket(socket, nextFunction);
    })

    const emitOnlineUsers = () => {
        const onlineUsers = serverStore.getOnlineUsers();
        io.emit(
            'online-users', { onlineUsers}
        ) // broadcast to all online users online users, so not emit to
    }

    io.on('connection', (socket) => { // listen for any client connection, socket object gives client info
        console.log('user connected');
        console.log(socket.id);

        // new connection handler : save connected user
        newConnectionHandler(socket, io); // pass socket and io? object (connection?)
        emitOnlineUsers(); // emit once when first connected

        socket.on('direct-message', (data) => {
            directMessageHandler(socket, data);
        })

        socket.on('direct-chat-history', (data) => {
            directChatHistoryHandler(socket, data);
        })

        socket.on('room-create', () => {
            roomCreateHandler(socket);
        })

        socket.on('room-join', (data) => {  // data is roomid
            roomJoinHandler(socket, data);
        }) 

        socket.on('room-leave', (data) => {
            roomLeaveHandler(socket, data);
        })

        socket.on('conn-init', (data) => { // data = initiator id
            roomInitializeConnectionHandler(socket, data);
        })

        socket.on('conn-signal', (data) => {
            roomSignalingDataHandler(socket, data);
        })

        socket.on('disconnect', () => {
            diconnectHandler(socket);
        })
    })

    setInterval(() => {
        emitOnlineUsers();
    }, [8000])

}

module.exports = {
    registerSocketServer
}