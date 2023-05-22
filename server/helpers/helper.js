const spawn = require('child_process').spawn;

const generateStreamThumbnail = (stream_key) => {
    const args = [
        '-y',
        '-i', 'http://localhost:8000/live/'+stream_key+'/index.m3u8',
        '-ss', '00:00:01',
        '-vframes', '1',
        '-vf', 'scale=-2:300',
        './media/live/'+stream_key+'/image.png',
    ];

    spawn('/opt/homebrew/bin/ffmpeg', args, {
        detached: true,
        stdio: 'ignore'
    }).unref();
};

module.exports = {
    generateStreamThumbnail : generateStreamThumbnail
};
