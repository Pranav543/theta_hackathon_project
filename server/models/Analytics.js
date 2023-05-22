const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AnalyticSchema = new Schema({
    videoCreator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
    videoId: {
        type: Schema.Types.ObjectId,
        ref: 'Video'
    },
    viewerId: {
        type: String
    },
    watchtime: {
        type: String
    },

},{timestamps : true});

const Analytics = mongoose.model('Analytics',AnalyticSchema);
module.exports = Analytics;