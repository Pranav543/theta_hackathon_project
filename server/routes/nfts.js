const express = require("express")
const router = express.Router()
const Nft = require('../models/Nfts')
const {verifyAccessToken} = require("../helpers/ApiAccess")


// Create new NFT 

router.post("/add", verifyAccessToken, async(req, res,next) => {
    try {
        const nft = await new Nft(req.body).save()
        res.send(nft);
      } catch (ex) {
        next(ex);
      }
})



// Get all user owned NFTs 

router.get("/all/:userId", verifyAccessToken, async(req, res,next) => {
    try {
        const nft = await Nft.find({owners : {
          $elemMatch: {
            userId: req.params.userId
          }
        }}).populate({path : 'videoId',select: '-videoPath', populate : {path : 'creator'}}).sort({ createdAt: -1 })
        res.send(nft);
      } catch (ex) {
        next(ex);
      }
})


// Get all user created NFTs 

router.get("/user/:userId", verifyAccessToken, async(req, res,next) => {
    try {
        const nft = await Nft.find({creator : req.params.userId}).populate({path : 'videoId',select: '-videoPath', populate : {path : 'creator'}}).sort({ createdAt: -1 })
        res.send(nft);
      } catch (ex) {
        next(ex);
      }
})


// edit NFT data 

router.put("/edit/:contract", verifyAccessToken,  async(req,res) => {
    try {
        const nft = await Nft.findOneAndUpdate({contract : req.params.contract}, req.body)
            if(nft) {
                res.send(nft)
            }
        
    } catch (error) {
        res.send(error)
    }
})


module.exports = router