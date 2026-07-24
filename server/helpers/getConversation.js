const { ConversationModel } = require("../models/ConversationModel")
const { MessageModel } = require("../models/ConversationModel")

const getConversation = async(currentUserId)=>{
    if(!currentUserId) return []

    const currentUserConversation = await ConversationModel.find({
        "$or" : [
            { sender : currentUserId },
            { receiver : currentUserId },
            { participants : { "$in": [currentUserId] } }
        ]
    }).sort({ updatedAt : -1 }).populate('sender').populate('receiver').populate('participants')

    // Batch-fetch all last messages in one query instead of N+1
    const lastMsgIds = currentUserConversation
        .filter(conv => conv.messages && conv.messages.length > 0)
        .map(conv => conv.messages[conv.messages.length - 1])

    const lastMsgsMap = {}
    if (lastMsgIds.length > 0) {
        const lastMsgs = await MessageModel.find({ _id: { $in: lastMsgIds } }).lean()
        lastMsgs.forEach(msg => { lastMsgsMap[msg._id.toString()] = msg })
    }

    // Batch-count unseen messages per conversation in one aggregation
    const allMsgIds = currentUserConversation.flatMap(conv => conv.messages || [])
    const unseenCounts = {}
    if (allMsgIds.length > 0) {
        const results = await MessageModel.aggregate([
            { $match: { _id: { $in: allMsgIds }, msgByUserId: { $ne: currentUserId }, seen: false } },
            // For each message, find which conversation it belongs to
            { $lookup: {
                from: 'conversations',
                let: { msgId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $in: ['$$msgId', '$messages'] } } },
                    { $project: { _id: 1 } }
                ],
                as: 'conv'
            }},
            { $unwind: '$conv' },
            { $group: { _id: '$conv._id', count: { $sum: 1 } } }
        ])
        results.forEach(r => { unseenCounts[r._id.toString()] = r.count })
    }

    const conversation = currentUserConversation.map(conv => {
        const lastMsgId = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null
        const lastMsg = lastMsgId ? (lastMsgsMap[lastMsgId.toString()] || null) : null

        return {
            _id : conv?._id,
            sender : conv?.sender,
            receiver : conv?.receiver,
            unseenMsg : unseenCounts[conv._id.toString()] || 0,
            lastMsg : lastMsg,
            isGroup : conv?.isGroup,
            groupName : conv?.groupName,
            participants : conv?.participants
        }
    })

    return conversation
}

module.exports = getConversation