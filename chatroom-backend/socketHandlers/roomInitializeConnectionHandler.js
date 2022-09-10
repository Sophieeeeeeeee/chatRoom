const roomInitializeConnectionHandler = (socket, data) => {
    const {connUserSocketId} = data; // joiner own id

    const initData = {connUserSocketId: socket.id};
    socket.to(connUserSocketId).emit('conn-init', initData); // sends joiner other connector socketids
}

module.exports = roomInitializeConnectionHandler;