const Message = require('../models/message');
const Conversation  = require('../models/conversation');
const chatUpdates = require('./updates/chat');

const directMessageHandler = async(socket, data) => {
    try {
        console.log('direct message event is being handled');

        const {userId} = socket.user; // socket.user from decoded token in authSocket
        const {receiverUserId, content} = data;

        // create new message
        const message = await Message.create({
            content: content,
            author: userId,
            date: new Date(),
            type: 'DIRECT'
        })

        // find if conversation exists between two users, if not create one
        const conversation = await Conversation.findOne({
            participants: {$all: [userId, receiverUserId]} // mangodb special function
        })

        if(conversation){
            conversation.messages.push(message._id);
            await conversation.save(); // save change

            // update receiver if online
            chatUpdates.updateChatHistory(conversation._id.toString());

        } else { 
            // no previous conversation, so create new one
            const newConversation = await Conversation.create({
                messages: [message._id],
                participants: [userId, receiverUserId]
            })

            // update receiver if online
            chatUpdates.updateChatHistory(newConversation._id.toString());
        }

    } catch (error) {
        console.log(error);
    }
}

module.exports = directMessageHandler;