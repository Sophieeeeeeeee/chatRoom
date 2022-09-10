const jwt = require('jsonwebtoken');

const config = process.env;

const verifyTokenSocket = (socket, nextFunction) => {
    const token = socket.handshake.auth?.token;

    try{
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        socket.user = decoded;
    } catch (err){
        const socketError = new Error('NOT AUTHORIZED');
        return nextFunction(socketError); // send error back to client
    }

    nextFunction();

}

module.exports = verifyTokenSocket;
