require('./connection')
const NodeMediaServer = require('node-media-server');
const Live = require("./models/Live")
const StreamChat = require("./models/StreamChat")
const SavedLive = require("./models/SavedLive")
const SavedStreamChat = require("./models/SavedStreamChat")
var {nanoid} = require('nanoid');
const shell = require('child_process').execSync ; 
const cron = require('node-cron');
const ffmpeg = require('fluent-ffmpeg');
const helpers = require("./helpers/helper")
const request = require("request");
const { Web3Storage }  = require('web3.storage')


const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*',
    mediaroot: './media'
  },
  auth: {
    api : true,
    api_user: `${process.env.ADMIN_USER}`,
    api_pass: `${process.env.ADMIN_PASS}`,
    play: false,
    publish: false,
  },
  trans: {
    ffmpeg: '/opt/homebrew/bin/ffmpeg',
      tasks: [
        {
          app: 'live',
          hls: true,
          hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
          mp4: true,
          mp4Flags: '[movflags=frag_keyframe+empty_moov]',
          dash: true,
          dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
          
        }
      
      ]
  },
  relay: {
    ffmpeg: '/opt/homebrew/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        mode : 'push',
        edge : 'rtmp://localhost:1936'
        
      },
      {
        app: 'live',
        mode : 'push',
        edge : 'rtmp://localhost:1937'
        
      },
    ]
  }
};

var nms = new NodeMediaServer(config)


nms.on('prePublish', async (id, StreamPath, args) => {
  let stream_key = getStreamKeyFromStreamPath(StreamPath);
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  Live.findOne({streamKey: stream_key}, async(err, user) => {
    if (!err) {
        if (!user) {
            let session = nms.getSession(id);
            session.reject();
        } else {
	try {
	    await helpers.generateStreamThumbnail(stream_key);
            const live = await Live.findOneAndUpdate({streamKey: stream_key}, {isActive : true,thumbnail : `https://live.cratch.io/live/${stream_key}/image.png`});
	    const chat = await StreamChat.deleteMany({liveId: live._id});
	}catch(e){
   	    console.log(e);
	}
        }
    }
});
});


nms.on('donePublish', async(id, StreamPath, args) => {
  let stream_key = getStreamKeyFromStreamPath(StreamPath);
  var ID = nanoid();
  const currentPath= `/home/sites/rtmp/media/live/${stream_key}/video.mp4`;
  const newPath= `/home/sites/rtmp/media/live/${stream_key}/${ID}.mp4`;
  shell(`mv ${currentPath} ${newPath}`);
  try {
	const live = await Live.findOneAndUpdate({streamKey: stream_key}, {isActive : false});
	var content = []
	const livechat = await StreamChat.find({liveId : live._id}).then((data) => {
 		if(data && data.length > 0){
                	data.map(chats => {
                                content.push({
                                                creator : chats.creator,
                                                liveId : chats.liveId,
                                                content : chats.content,
						createdAt: chats.createdAt
                                        })
                                })
        }
	}).catch(e =>console.log(e));
	
	const saved = await new SavedStreamChat({streamId : ID, content : content}).save();
	
	const savedLive = await new SavedLive({
		creator : live.creator,
		streamId : ID,
    		title: live.title,
    		description : live.description,
    		category : live.category,
    		thumbnail : live.thumbnail,
    		tags : live.tags,
    		visibility : live.visibility,
    		streamUrl : `https://live.cratch.io/live/${stream_key}/${ID}.mp4`,
    		numOfmessages : live.numOfmessages,
    		likes : live.likes,
    		views : live.views,
	}).save()
        await ffmpeg.ffprobe(`./media/live/${stream_key}/${ID}.mp4`, 
		async (error, metadata) =>{
                	const totalSeconds = Math.floor(metadata.format.duration);
                	const duration = Math.floor(totalSeconds / 60) + ':' + ('0' + Math.floor(totalSeconds % 60)).slice(-2);
                	const live =  await SavedLive.findOneAndUpdate({streamId : ID} , {duration : duration});

                });

	}
  catch(e){
	console.log(e);
	}
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

const getStreamKeyFromStreamPath = (path) => {
  let parts = path.split('/');
  return parts[parts.length - 1];
};

nms.run();

function makeStorageClient() {  
  return new Web3Storage({ token: process.env.IPFS_KEY })
}

async function storeVideo(file) {

  // Check file size to ensure it is less than 1gb.

  if ( size / 100024 / 100024 < 1000) {
      try {
          const client = makeStorageClient();
          const newFile = new File([file], file.name, {type: file.type});
          const cid = await client.put([newFile], {
              name: file.name,
          });
          const res = await client.get(cid);
          const videoUrl = `https://${cid}.ipfs.dweb.link/${file.name}`;
          if(res.status === 200) {
              return videoUrl

          }else {
              return ""
          }
      
      }catch(e) {
          return ""
      }
      
  }else {
      return ""
  }
}


cron.schedule('*/10 * * * * *', () => {
  request
       .get('http://127.0.0.1:8000/api/streams', (error, response, body)=> {
         if(body !== undefined && body !== 'undefined' && body !== 'Unauthorized'){
   let streams = JSON.parse(body);
               if (typeof (streams['live'] !== undefined)) {
                   let live_streams = streams['live'];
                   for (let stream in live_streams) {
                         if (!live_streams.hasOwnProperty(stream)) continue;
           console.log(stream)
                           helpers.generateStreamThumbnail(stream);
               }
           }
 }
       });
}).start();


cron.schedule('* * 12 * *', async() => {
  const liveChat = await StreamChat.deleteMany({ "createdAt": { $gt: new Date(Date.now() - 12*60*60 * 1000) } });
}).start();

cron.schedule('* * 24 * *', async() => {
  try {
    const savedLivesIpfsStore = await SavedLive.find({ ipfsUrl: { $exists: false } }).then((data) => {
      if(data?.length > 0) {
          data?.map(async(item) => {
            const response = await fetch(item.streamUrl);
            const blob = await response.blob();
            const file = new File([blob], "videp.mp4", { type: "video/mp4" });
            const url = await storeVideo(file)
            await SavedLive.updateOne({streamId : item.streamId}, { $set: { ipfsUrl: url}},{upsert:true})
        })
      }
        
    })
  }catch(e) {
    console.log(e)
  }
  
}).start();



