import React, { useEffect } from "react";
import Clappr from "clappr";
import PlaybackRatePlugin from "clappr-playback-rate-plugin";
import {Box} from "@chakra-ui/react"
import clapprStats from "clappr-stats"
import {CreateDocAnalytics} from '../../../services/analyticService'
import { editUser } from "../../../services/usersService";


export var duration = 0;
const VideoPlayer = ({ id, source, poster,videoCreator,videoId,viewerId,reward }) => {
  let clappr_player = null;
  
  useEffect(() => {
    clappr_player = new Clappr.Player({
      parentId: `#${id}`,
      source: source,
      poster: poster,
      width: '100%',
      height: '100%',
      plugins: [PlaybackRatePlugin,clapprStats],
      playbackRateConfig: {
        defaultValue: 1,
        options: [
          { value: 0.5, label: "0.5x" },
          { value: 1, label: "1x" },
          { value: 2, label: "2x" }
        ]
      },
      clapprStats: {

        onReport: (metrics) => {
          
          duration = metrics.timers.watch/1000
        },

      }
    });

    // var counter = 0;
    // var seek =0;
    // clappr_player.on(Clappr.Events.PLAYER_PAUSE, () => {
    //   console.log("player is stopped")
    // })
    

    // clappr_player.on(Clappr.Events.PLAYER_TIMEUPDATE, (progress) => {
    //   counter =  progress.current;
    //   console.log(counter)
    // })

    // clappr_player.on(Clappr.Events.PLAYER_PLAY, () => {
      
    //   console.log("player is resumed")
    // })

    clappr_player.on(Clappr.Events.PLAYER_ENDED, async() => {
      await saveDocAnalytics()
    })
    // clappr_player.on(Clappr.Events.CONTAINER_PROGRESS, (test) => {
    //   console.log("test",test)
    // })

    
    // clappr_player.on(Clappr.Events.PLAYER_SEEK, (progress) => {
    //   seek = progress
    //   console.log("player seek is changed", seek)
    // })


    return () => {
      clappr_player.destroy();
      clappr_player = null;
    };
  }, []);

  const saveDocAnalytics = async() => {
    try{
      await CreateDocAnalytics({
        videoCreator : videoCreator,
        videoId:videoId,
        viewerId : viewerId,
        watchtime : duration
      })
      let amount = duration / 2 * 0.001
      if(amount > 5 ) {await editUser(viewerId,{rewards : reward + amount})}
    }catch{}

  }




  return (
    <Box id={id} w="100%" h="100%">
     
    </Box>
  );
};

export default VideoPlayer;
