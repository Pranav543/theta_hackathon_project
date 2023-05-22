const express = require("express")
const router = express.Router()
const Analytics = require('../models/Analytics')
const {verifyAccessToken} = require("../helpers/ApiAccess")


// Create new analytics doc 

router.post("/add", verifyAccessToken, async(req, res,next) => {
    try {
        const data = await new Analytics(req.body).save()
        res.send(data);
      } catch (ex) {
        next(ex);
      }
})



// Get user videoCreator lifetime analytics

router.get("/all/:videoCreator", verifyAccessToken, async(req, res,next) => {
  try {
      const data = await Analytics.find({videoCreator : req.params.videoCreator});
      res.send(data);
    } catch (ex) {
      next(ex);
    }
})


// Get user videoCreator weekly analytics

router.get("/week/:videoCreator", verifyAccessToken, async(req, res,next) => {
  try {
      const data = await Analytics.find({videoCreator : req.params.videoCreator,
        createdAt: {
            $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
        }
    });
      res.send(data);
    } catch (ex) {
      next(ex);
    }
})



// Get user videoCreator 28 days analytics

router.get("/twentyeight/:videoCreator", verifyAccessToken, async(req, res,next) => {
  try {
      const data = await Analytics.find({videoCreator : req.params.videoCreator,
        createdAt: {
            $gte: new Date(new Date() - 28 * 60 * 60 * 24 * 1000)
        }
    });
      res.send(data);
    } catch (ex) {
      next(ex);
    }
})



// Get user videoCreator 90 days analytics

router.get("/threemonth/:videoCreator", verifyAccessToken, async(req, res,next) => {
  try {
      const data = await Analytics.find({videoCreator : req.params.videoCreator,
        createdAt: {
            $gte: new Date(new Date() - 90 * 60 * 60 * 24 * 1000)
        }
    });
      res.send(data);
    } catch (ex) {
      next(ex);
    }
})


// Get user videoCreator 365 days analytics

router.get("/year/:videoCreator", verifyAccessToken, async(req, res,next) => {
  try {
      const data = await Analytics.find({videoCreator : req.params.videoCreator,
        createdAt: {
            $gte: new Date(new Date() - 365 * 60 * 60 * 24 * 1000)
        }
    });
      res.send(data);
    } catch (ex) {
      next(ex);
    }
})

module.exports = router