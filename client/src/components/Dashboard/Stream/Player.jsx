import React from 'react'
import "plyr-react/plyr.css";
import Hls from "hls.js";
import Plyr from "plyr-react";

const LivePlayer = React.memo(({videoUrl}) => {
  const ref = React.useRef();
  const playerRef = React.useRef()

  const loadVideo = async () => {
      const video = document.getElementById("plyr");
      var hls = new Hls();
      hls.loadSource(
        videoUrl
      );
      hls.attachMedia(video);
      // @ts-ignore
      ref.current.plyr.media = video;

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        ref.current.plyr.play();
      });
    };
  React.useEffect(() => {
    loadVideo();
  },[]);

  return (
    <div ref={playerRef}>
        <Plyr
          id="plyr"
          options={{
            quality: {
              default: 720,
              options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
            },
            settings: [ "quality"],
            autoplay: true
          }}
          source={{}}
          ref={ref}
        />
    </div>
  );
});

export default LivePlayer