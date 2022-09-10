const FriendInvitation = require("../../models/friendInvitation");
const friendsUpdate = require('../../socketHandlers/updates/friends');

const postReject = async(req, res) => {
    try{
        const {id} = req.body;
        const{userId} = req.user;

        // remove this invitation from friend invitation collection
        const invitationExists = await FriendInvitation.exists({
            _id: id,
        })

        if (invitationExists){
            await FriendInvitation.findByIdAndDelete(id);
        }

        // update pending invitations (online users get it right away)
        friendsUpdate.updateFriendsPendingInvitations(userId);
        return res.status(200).send('Invitation successfully rejected!');

    } catch(error) {
        console.log(error);
        return res.status(500).send('Sth went wrong, try again.')
    }
}

module.exports = postReject;