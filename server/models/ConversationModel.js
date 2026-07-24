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
        required : function() { return !this.isGroup; },
        ref : 'User'
    },
    receiver : {
        type : mongoose.Schema.ObjectId,
        required : function() { return !this.isGroup; },
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

// ── Performance indexes ────────────────────────────────────
messageSchema.index({ msgByUserId: 1, createdAt: -1 })
messageSchema.index({ seen: 1, msgByUserId: 1 })

conversationSchema.index({ sender: 1, receiver: 1 })
conversationSchema.index({ participants: 1, updatedAt: -1 })
conversationSchema.index({ updatedAt: -1 })

const MessageModel = mongoose.model('Message',messageSchema)
const ConversationModel = mongoose.model('Conversation',conversationSchema)

module.exports = {
    MessageModel,
    ConversationModel
}