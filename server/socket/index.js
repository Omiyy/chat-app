const express = require('express')
const { Server } = require('socket.io')
const http = require('http')
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
const UserModel = require('../models/UserModel')
const { ConversationModel, MessageModel } = require('../models/ConversationModel')
const getConversation = require('../helpers/getConversation')

const app = express()

// ✅ Add CORS middleware to Express
const cors = require('cors')
app.use(cors({
    origin: process.env.FRONTEND_URL?.replace(/\/+$/, ''),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}))

/***socket connection */
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL?.replace(/\/+$/, ''),
        credentials: true,
        methods: ["GET", "POST"]
    }
})

/***
 * socket running at http://localhost:8080/
 */

//online user
const onlineUser = new Set()

io.on('connection',async(socket)=>{
    console.log("connect User ", socket.id)

    let token = socket.handshake.auth?.token;
    
    // Parse cookies if auth.token is not provided
    if (!token && socket.handshake.headers.cookie) {
        const cookie = require('cookie');
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies.accessToken || cookies.token;
    }

    //current user details 
    const user = await getUserDetailsFromToken(token)

    // disconnect if token invalid
    if(!user || user.logout){
        socket.disconnect()
        return
    }

    //create a room
    socket.join(user?._id.toString())
    onlineUser.add(user?._id?.toString())

    io.emit('onlineUser',Array.from(onlineUser))

    socket.on('message-page',async(userId)=>{
        // userId could be a User ID (1:1) or Conversation ID (Group)
        let userDetails = await UserModel.findById(userId).select("-password")
        
        let payload = {};
        let getConversationMessage = null;

        if (userDetails) {
            // It's a 1-on-1 chat
            payload = {
                _id : userDetails?._id,
                name : userDetails?.name,
                email : userDetails?.email,
                profile_pic : userDetails?.profile_pic,
                online : onlineUser.has(userId),
                last_seen : userDetails?.last_seen,
                isGroup: false
            }

            getConversationMessage = await ConversationModel.findOne({
                "$or" : [
                    { sender : user?._id, receiver : userId },
                    { sender : userId, receiver :  user?._id}
                ]
            }).slice('messages', -30).populate({ path: 'messages', populate: { path: 'msgByUserId', select: 'name profile_pic' } }).sort({ updatedAt : -1 })
        } else {
            // It might be a group chat
            const groupDetails = await ConversationModel.findById(userId).populate('participants');
            if (groupDetails && groupDetails.isGroup) {
                payload = {
                    _id: groupDetails._id,
                    name: groupDetails.groupName,
                    isGroup: true,
                    participants: groupDetails.participants,
                    online: false // groups themselves don't have online status
                }
                getConversationMessage = await ConversationModel.findById(userId).slice('messages', -30).populate({ path: 'messages', populate: { path: 'msgByUserId', select: 'name profile_pic' } }).sort({ updatedAt: -1 })
            }
        }
        
        socket.emit('message-user',payload)
        socket.emit('message', { userId: userId, messages: getConversationMessage?.messages || [] })
    })


    //new-message
    socket.on('new-message',async(data)=>{
        let conversation;
        
        if (data.isGroup && data.conversationId) {
            conversation = await ConversationModel.findById(data.conversationId);
        } else {
            conversation = await ConversationModel.findOne({
                "$or" : [
                    { sender : data?.sender, receiver : data?.receiver },
                    { sender : data?.receiver, receiver :  data?.sender}
                ]
            })
            //if conversation is not available
            if(!conversation){
                const createConversation = await ConversationModel({
                    sender : data?.sender,
                    receiver : data?.receiver
                })
                conversation = await createConversation.save()
            }
        }
        
        const message = new MessageModel({
          text : data.text,
          imageUrl : data.imageUrl,
          videoUrl : data.videoUrl,
          msgByUserId :  data?.msgByUserId,
        })
        const saveMessage = await message.save()

        const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
            "$push" : { messages : saveMessage?._id }
        })

        if (conversation) {
            // Populate just the single new message to save massive database and network time
            const populatedMessage = await MessageModel.findById(saveMessage._id).populate('msgByUserId', 'name profile_pic')

            if (conversation.isGroup) {
                conversation.participants.forEach(async (participantId) => {
                    io.to(participantId.toString()).emit('new-message', { userId: conversation._id.toString(), message: populatedMessage })
                    const conversationSender = await getConversation(participantId.toString())
                    io.to(participantId.toString()).emit('conversation', conversationSender)
                })
            } else {
                io.to(data?.sender).emit('new-message', { userId: data?.receiver, message: populatedMessage })
                io.to(data?.receiver).emit('new-message', { userId: data?.sender, message: populatedMessage })

                //send conversation
                const conversationSender = await getConversation(data?.sender)
                const conversationReceiver = await getConversation(data?.receiver)

                io.to(data?.sender).emit('conversation',conversationSender)
                io.to(data?.receiver).emit('conversation',conversationReceiver)
            }
        }
    })

    // create group
    socket.on('create-group', async(data) => {
        // data: { groupName, participants: [user_id_1, user_id_2, ...] }
        const { groupName, participants } = data;
        // ensure current user is in participants
        const participantIds = [...new Set([...participants, user._id.toString()])];
        
        const createConversation = await ConversationModel.create({
            isGroup: true,
            groupName: groupName,
            groupAdmin: user._id,
            participants: participantIds
        });
        
        // notify all participants
        participantIds.forEach(async (participantId) => {
            const conversationSender = await getConversation(participantId.toString());
            io.to(participantId.toString()).emit('conversation', conversationSender);
        });
    })


    //sidebar
    socket.on('sidebar',async(currentUserId)=>{
        console.log("current user",currentUserId)

        const conversation = await getConversation(currentUserId)

        socket.emit('conversation',conversation)
        
    })

    socket.on('seen',async(msgByUserId)=>{
        // msgByUserId could be a User ID (1:1) or Conversation ID (Group)
        let conversation = await ConversationModel.findById(msgByUserId);
        
        if (conversation && conversation.isGroup) {
            const conversationMessageId = conversation?.messages || []

            const updateMessages  = await MessageModel.updateMany(
                { _id : { "$in" : conversationMessageId }, msgByUserId : { "$ne": user._id } },
                { "$set" : { seen : true }}
            )

            // Emit to all participants
            conversation.participants.forEach(async (participantId) => {
                const conversationSender = await getConversation(participantId.toString())
                io.to(participantId.toString()).emit('conversation', conversationSender)
                
                const getConversationMessage = await ConversationModel.findById(conversation._id).slice('messages', -30).populate({ path: 'messages', populate: { path: 'msgByUserId', select: 'name profile_pic' } }).sort({ updatedAt : -1 })
                io.to(participantId.toString()).emit('message', { userId: conversation._id.toString(), messages: getConversationMessage?.messages || [] })
            })
        } else {
            conversation = await ConversationModel.findOne({
                "$or" : [
                    { sender : user?._id, receiver : msgByUserId },
                    { sender : msgByUserId, receiver :  user?._id}
                ]
            })

            const conversationMessageId = conversation?.messages || []

            const updateMessages  = await MessageModel.updateMany(
                { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
                { "$set" : { seen : true }}
            )

            //send conversation
            const conversationSender = await getConversation(user?._id?.toString())
            const conversationReceiver = await getConversation(msgByUserId)

            io.to(user?._id?.toString()).emit('conversation',conversationSender)
            io.to(msgByUserId).emit('conversation',conversationReceiver)
            
            const getConversationMessage = await ConversationModel.findOne({
                "$or" : [
                    { sender : user?._id, receiver : msgByUserId },
                    { sender : msgByUserId, receiver :  user?._id}
                ]
            }).slice('messages', -30).populate({ path: 'messages', populate: { path: 'msgByUserId', select: 'name profile_pic' } }).sort({ updatedAt : -1 })

            io.to(user?._id?.toString()).emit('message', { userId: msgByUserId, messages: getConversationMessage?.messages || [] })
            io.to(msgByUserId).emit('message', { userId: user?._id?.toString(), messages: getConversationMessage?.messages || [] })
        }
    })

    //disconnect
    socket.on('disconnect', async ()=>{
        onlineUser.delete(user?._id?.toString())
        console.log('disconnect user ',socket.id)
        
        await UserModel.updateOne({ _id: user?._id }, { last_seen: new Date() })
        
        // Broadcast new online user list so others know they went offline
        io.emit('onlineUser',Array.from(onlineUser))
    })
})

module.exports = {
    app,
    server
}

