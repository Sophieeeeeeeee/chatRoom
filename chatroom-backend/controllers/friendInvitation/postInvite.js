const User = require('../../models/user');
const FriendInvitation = require('../../models/friendInvitation');
const friendsUpdate = require('../../socketHandlers/updates/friends');

const postInvite = async(req, res) => {
    const {targetMailAddress} = req.body;
    const {userId, mail} = req.user; // req.user from auth in which token decoded sets user

    // check if friend invited is valid user
    if(mail.toLowerCase() === targetMailAddress.toLowerCase()){
        return res.status(409).send("Sorry. You can't invite yourself.");
    }

    const targetUser = await User.findOne({
        mail: targetMailAddress.toLowerCase(),
    })
    if(!targetUser){
        return res.status(404).send(`Friend of ${targetMailAddress} is not found. Please check mail address.`);
    }

    // check if invitation has already been send
    const invitationAlreadyReceived = await FriendInvitation.findOne({
        senderId: userId,
        receiverId: targetUser._id // _id given by mangodb
    })
    if (invitationAlreadyReceived){
        return res.status(409).send('Invitation already sent.');
    }

    // check if user invited is already a friend
    const userAlreadyFriend = targetUser.friends.find((friendId) => 
        friendId.toString() === userId.toString());
    if(userAlreadyFriend){
        return res.status(409).send('Friend already added.');
    }

    //  create new invitation, save in db
    const newInvitation = await FriendInvitation.create({
        senderId: userId, 
        receiverId: targetUser._id
    })

    // if invitation successfully created, update friend invitation if other user online
    // send pending invitation update to online receivers
    friendsUpdate.updateFriendsPendingInvitations(targetUser._id.toString());
    return res.status(201).send('Invitation has been sent.');
}

module.exports = postInvite;