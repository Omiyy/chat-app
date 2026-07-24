const { ConversationModel } = require("../models/ConversationModel")
const { MessageModel } = require("../models/ConversationModel")

const getConversation = async(currentUserId)=>{
    if(currentUserId){
        const currentUserConversation = await ConversationModel.find({
            "$or" : [
                { sender : currentUserId },
                { receiver : currentUserId },
                { participants : { "$in": [currentUserId] } }
            ]
        }).sort({  updatedAt : -1 }).populate('sender').populate('receiver').populate('participants')

        const conversation = await Promise.all(currentUserConversation.map(async (conv)=>{
            
            const countUnseenMsg = await MessageModel.countDocuments({
                _id: { $in: conv.messages },
                msgByUserId: { $ne: currentUserId },
                seen: false
            })
            
            let lastMsg = null;
            if (conv.messages && conv.messages.length > 0) {
                const lastMsgId = conv.messages[conv.messages.length - 1];
                lastMsg = await MessageModel.findById(lastMsgId);
            }
            
            return {
                _id : conv?._id,
                sender : conv?.sender,
                receiver : conv?.receiver,
                unseenMsg : countUnseenMsg,
                lastMsg : lastMsg,
                isGroup : conv?.isGroup,
                groupName : conv?.groupName,
                participants : conv?.participants
            }
        }))

        return conversation
    }else{
        return []
    }
}

module.exports = getConversation