const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SavedLiveSchema = new Schema({
    creator : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    streamId : {type: String, required:true},
    title: {type : String, required : true},
    description : {type : String, default : ''},
    category : String,
    thumbnail : {type : String, default : 'https://i.stack.imgur.com/XZDsP.jpg'},
    tags : [String],
    visibility : {type : Number, default : 1},
    streamUrl : String,
    numOfmessages : {type : Number, default : 1},
    likes : {type: Number, default : 0},
    views : {type: Number , default : 0},
    duration : {type : String}
    
},{timestamps : true});
const SavedLive = mongoose.model('SavedLive',SavedLiveSchema);
module.exports = SavedLive;