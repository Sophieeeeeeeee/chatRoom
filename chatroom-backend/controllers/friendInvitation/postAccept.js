const User = require("../../models/user");
const FriendInvitation = require('../../models/friendInvitation');
const friendsUpdate = require('../../socketHandlers/updates/friends');

const postAccept = async(req, res) => {

    try{
        const {id} = req.body;

        // remove this invitation from friend invitation collection
        const invitation = await FriendInvitation.findById(id);

        if (!invitation){
            return res.status(401).send('Error occured, try again.')
        } 

        // add friends to both users
        const {senderId, receiverId} = invitation;
        const user1 = await User.findById(senderId);
        user1.friends = [...user1.friends, receiverId];
        const user2 = await User.findById(receiverId);
        user2.friends = [...user2.friends, senderId];

        await user1.save(); // save to actual db
        await user2.save();

        // delete invitation
        await FriendInvitation.findByIdAndDelete(id);

        // update pending invitations (online users get it right away)
        friendsUpdate.updateFriendsPendingInvitations(receiverId.toString());
        // update friends list
        friendsUpdate.updateFriends(senderId.toString());
        friendsUpdate.updateFriends(receiverId.toString());

        return res.status(200).send('Invitation accepted, friend successfully added!');

    } catch(error) {
        console.log(error);
        return res.status(500).send('Sth went wrong, try again.')
    }

}

module.exports = postAccept;