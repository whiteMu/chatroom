var ws = require("nodejs-websocket");
var roomConnetctonList = []
var allUser = []

var userIndex = 0

class ConnHandler {
    userId = 0
    
    constructor(server, conn) {
        this.server = server;
        this.conn = conn;
    }

    onEnter(msg) {
        let userId = msg.userId
        if(userId === null) {
            index ++;
            let name = "user"+ index
            this.userId = index
            this.name = name
            // 发消息给conn, 
            let param = {
                type: "register",
                data:{
                    userId: this.index,
                    userIcon: '',
                    userName: this.name,
                }
            }
            this.sendMessage(param)
        } else {
            this.userId = userId
            this.name = "user"+ index
        }
        // 发广播
        let param = {
            type: 'notify',
            data: {
                content: this.name + '加入了群聊'
            }
        }
        this.sendGroupMessage()
    }

    onMsg(msg) {
        
        this.sendGroupMessage()
    }

    sendMessage(msg) {
        this.conn.sendText(JSON.stringify(msg))
    }

    sendGroupMessage(msg) {
        this.server.connections.forEach(function (conn) {
            conn.sendText(JSON.stringify(msg))
        })
    }
}



var server = ws.createServer(function(conn){
    roomConnetctonList.push(conn)
    var handler = new ConnHandler(server, conn)
    conn.on("text", function (response) {
        const message = JSON.parse(response)
        if(message.type == 'enter') {
             return handler.onEnter(message)
        }
        if(message.type == 'msg') {
            return handler.onMsg(message)
        }
    })
    conn.on("close", function (code, reason) {
        let index = -1;
        for(let i = 0; i<roomConnetctonList.length; i++) {
            if(conn == roomConnetctonList[i]) {
                index = i;
                break;
            }
        }
        if(index != -1) {
            roomConnetctonList.splice(index, 1)
        }
        console.log("关闭连接")
    });
    conn.on("error", function (code, reason) {
        console.log("异常关闭")
    });
}).listen(8001)


console.log("WebSocket建立完毕")