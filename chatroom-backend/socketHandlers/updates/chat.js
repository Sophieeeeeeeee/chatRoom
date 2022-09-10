const Conversation = require('../../models/conversation');
const serverStore = require('../../serverStore');

const updateChatHistory = async (
    conversationId, 
    toSpecifiedSocketId = null) => {
    const conversation = await Conversation.findById(conversationId).populate({
        path: 'messages',
        model: 'Message',  // nested population, replace each in messages array with Message model
        populate:{
            path: 'author', // for author field in each model, replace with model User selectiong fields name and id
            model: 'User',
            select: 'username _id'
        }
    })

    if (conversation) {
        const io = serverStore.getSocketServerInstance();

        if (toSpecifiedSocketId) {
            // initial update of chat history
            return io.to(toSpecifiedSocketId).emit('direct-chat-history', {
                messages: conversation.messages,
                participants: conversation.participants
            })
        }

        // check if users of this conversation online
        // if yes emit to them update of messages
        conversation.participants.forEach(userId => {
            const activeConnections = serverStore.getActiveConnections(userId.toString());

            activeConnections.forEach(socketId => {
                io.to(socketId).emit('direct-chat-history', {
                    messages: conversation.messages,
                    participants: conversation.participants
                });
            });
        });
    }
}

module.exports = {updateChatHistory}