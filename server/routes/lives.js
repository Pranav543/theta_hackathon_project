const express = require("express")
const router = express.Router()
const Live = require('../models/Live')
const SavedLive = require('../models/SavedLive')
const StreamChat = require('../models/StreamChat')
const SavedStreamChat = require('../models/SavedStreamChat')
const {verifyAccessToken} = require('../helpers/ApiAccess')
const io = require("../socket")


// Get homePage lives
router.get("/home/lives/:number",verifyAccessToken, async(req, res) => {
    try {
        let num = req.params.number >= 8 ? 8 : 4;
        const lives =  await Live.find({isActive:true}).limit(num).populate('creator','userId username ProfileAvatar isVerified isOnline followers')
                                .sort({ currentlyWatching: -1 })     
        res.send(lives)

    }
    catch(error) {
        res.send(error)
    }
})

// Get all lives
router.get("/all/:skip/:limit",verifyAccessToken, async(req, res) => {
    try {
        const skip = req.params.skip
        const limit = req.params.limit
        const lives =  await Live.find({isActive:true}).skip(skip * limit).limit(limit).populate('creator','userId username ProfileAvatar isVerified isOnline followers')
                                .sort({ currentlyWatching: -1 })
        res.send(lives)

    }
    catch(error) {
        res.send(error)
    }
})


// Get user live

router.get("/user/:id",verifyAccessToken, async(req, res) => {
    try {
        const lives =  await Live.findOne({creator : req.params.id}).sort({ createdAt: -1 })
        if(lives == null)
        res.send({status : 'not found'});
        else {
            res.send(lives)
        }
    }
    catch(error) {
        res.send({status : 'not found'});
    }
})


// get user Profile live

router.get("/profile/user/:id",verifyAccessToken, async(req, res) => {
    try {
        const lives =  await Live.findOne({creator : req.params.id},{streamKey : 0}).sort({ createdAt: -1 })
        if(lives == null)
        res.send({status : 'not found'});
        else {
            res.send(lives)
        }
    }
    catch(error) {
        res.send({status : 'not found'});
    }
})

// Get all user saved lives

router.get("/user/saved/:id",verifyAccessToken, async(req, res) => {
    try {
        const lives =  await SavedLive.find({creator : req.params.id}).sort({ createdAt: -1 })
        if(lives == null || lives.length ==0)
        res.send({status : 'not found'});
        else {
            res.send(lives)
        }
    }
    catch(error) {
        res.send({status : 'not found'});
    }
})


// Get all saved lives

router.get("/sessions/all",verifyAccessToken, async(req, res) => {
    try {
        const lives =  await SavedLive.find({}).populate("creator","userId username ProfileAvatar isVerified").sort({ createdAt: -1 })
        if(lives == null || lives.length == 0)
        res.send({status : 'not found'});
        else {
            res.send(lives)
        }
    }
    catch(error) {
        res.send({status : 'not found'});
    }
})



// Get all user saved lives (Public)

router.get("/user/saved/public/:id",verifyAccessToken, async(req, res) => {
    try {
        const lives =  await SavedLive.find({creator : req.params.id, visibility: {$ne: 2}}).sort({ createdAt: -1 })
        if(lives == null || lives.length ==0)
        res.send({status : 'not found'});
        else {
            res.send(lives)
        }
    }
    catch(error) {
        res.send({status : 'not found'});
    }
})


// get all stream chats
router.get("/chat/:id",verifyAccessToken, async(req, res) => {
    try {
        const chat =  await StreamChat.find({liveId : req.params.id}).populate('creator', 'userId username ProfileAvatar')
      
            res.send(chat)
        }
    catch(error) {
        res.send({status : 'not found'});
    }
})


// get all savedLive stream chats
router.get("/chat/saved/:id",verifyAccessToken, async(req, res) => {
    try {
        const chat =  await SavedStreamChat.findOne({streamId : req.params.id}).populate('content.creator', 'userId username ProfileAvatar')
        if(chat == null) {
            res.send({status : 'not found'})
        }else {
            res.send(chat)
        }
            
        }
    catch(error) {
        res.send({status : 'not found'});
    }
})



// post message to live chat
router.post("/chat",verifyAccessToken, async(req, res) => {
    try {
        let {userData,creator,liveId,content} = req.body
        const chat =   await new StreamChat({creator : creator,liveId : liveId,content : content}).save()
        io.getIO().emit('live-chat-sent', {
          creator : userData,
          liveId : liveId,
          content : content
        })
            res.send(chat)
        }
    catch(error) {
        res.send({status : 'not found'});
    }
})





// get specific live

router.get("/:id",verifyAccessToken, async(req, res) => {
    try {
        const live =  await Live.findOne({streamUrl : req.params.id}).populate('creator','userId username rewards ProfileAvatar isVerified isOnline followers')
        if(live == null)
        res.send({status : 'not found'});
        else {
            res.send(live)
        }
    }
    catch(error) {
        res.send({status : 'not found'});
    }
})



// Get user saved lives

router.get("/saved/:id",verifyAccessToken, async(req, res) => {
    try {
        const live =  await SavedLive.findOne({streamId : req.params.id}).populate('creator','userId username rewards ProfileAvatar isVerified isOnline followers')
        if(live == null)
        res.send({status : 'not found'});
        else {
            res.send(live)
        }
    }
    catch(error) {
        res.send({status : 'not found'});
    }
})


// create new live

router.post("/new",verifyAccessToken, async(req, res) => {
    try {
        const live = await new Live(req.body).save()
        res.send(live)
    }
    catch(error) {
        res.send(error)
    }
})


// edit liveStream
router.put("/:id", verifyAccessToken, async(req,res) => {
    try {
        const live = await Live.findOneAndUpdate({_id : req.params.id}, req.body,{ new: true })
        res.send(live)
        
    } catch (error) {
        res.send(error)
    }
})


// edit Saved liveStream
router.put("/saved/:id", verifyAccessToken, async(req,res) => {
    try {
        const live = await SavedLive.findOneAndUpdate({streamId : req.params.id}, req.body,{ new: true })
        res.send(live)
        
    } catch (error) {
        res.send(error)
    }
})


module.exports = router