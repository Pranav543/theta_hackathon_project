const ioRedis = require('socket.io-redis');
let io;

module.exports ={
    init : httpServer => {
        io = require('socket.io')(httpServer,{cors: {

            origin: `${process.env.URL_ORIGIN}`
    
        }});
        
        io.adapter(ioRedis({host: process.env.REDIS_HOST, port: process.env.REDIS_PORT}));

            global.onlineUsers = new Map();

            io.on("connection", (socket) => {
                console.log("######## Socket Connection Istablished ########")

                    global.chatSocket = socket;
                        
                    socket.on("add-user", (userId) => {
                        onlineUsers.set(userId, socket.id);
                    });
            });

        return io;
    },
    getIO: () => {
        if(!io) {
            throw new Error("Socket.io not initialized")
        }
        return io;
    }
}