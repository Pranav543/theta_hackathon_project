const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SavedStreamChatSchema = new Schema({
    streamId: {
        type: String,
        required: true
    }, 
    content: [{
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }, 
        liveId: {
            type: Schema.Types.ObjectId,
            ref: 'Live'
        },
        content: {
            type: String
        },
        createdAt    : { type: Date }
}],



},{timestamps : true});

const SavedStreamChat = mongoose.model('SavedStreamChat',SavedStreamChatSchema);
module.exports = SavedStreamChat;