const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text : {
        type : String,
        default : ""
    },
    imageUrl : {
        type : String,
        default : ""
    },
    videoUrl : {
        type : String,
        default : ""
    },
    seen : {
        type : Boolean,
        default : false
    },
    msgByUserId : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User'
    }
},{
    timestamps : true
})

const conversationSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User'
    },
    receiver : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User'
    },
    messages : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'Message'
        }
    ],
    // Group Chat Fields
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        default: ""
    },
    groupAdmin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    participants: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    // Store the last read message for each participant to manage O(1) read receipts
    readReceipts: {
        type: Map,
        of: mongoose.Schema.ObjectId, // participantId -> messageId
        default: {}
    }
},{
    timestamps : true
})

// MongoDB inherently indexes _id so no explicit index is needed

const MessageModel = mongoose.model('Message',messageSchema)
const ConversationModel = mongoose.model('Conversation',conversationSchema)

module.exports = {
    MessageModel,
    ConversationModel
}