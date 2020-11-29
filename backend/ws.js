const ws = require("nodejs-websocket");
const fs = require("fs")
var allUser = [{
    userName: '周瑜',
    userIcon: './assets/0.jpg'
},{
    userName: '小乔',
    userIcon: './assets/1.jpg'
},{
    userName: '大乔',
    userIcon: ''
},{
    userName: '武大郎',
    userIcon: ''
},{
    userName: '西门庆',
    userIcon: ''
},{
    userName: '武松',
    userIcon: ''
},{
    userName: '嫦娥',
    userIcon: ''
},{
    userName: '猪八戒',
    userIcon: ''
},{
    userName: '扫地僧',
    userIcon: ''
},{
    userName: '唐僧',
    userIcon: ''
},{
    userName: '孙悟空',
    userIcon: ''
}]

var nearMsgList = []

var userIndex = 0

readUserIndexFile()

class ConnHandler {
    userId = 0
    constructor(server, conn) {
        this.server = server;
        this.conn = conn;
    }

    onEnter(msg) {
        let userId = msg.userId
        if(userId === null) {
            userIndex ++;
            this.userId = userIndex
            this.userName = allUser[userIndex - 1].userName
            //储存id
            writeIndex(this.userId.toString())
            // 发消息给conn, 
            let param = {
                type: "register",
                data:{
                    userId: this.userId,
                    userIcon: allUser[userIndex - 1].userIcon,
                    userName: this.userName,
                }
            }
            this.sendMessage(param)
        } else {
            this.userId = userId
            this.userName = allUser[this.userId - 1].userName
        }
        //下发近10条消息
        let nearParam = {
            type: 'msgList',
            data: nearMsgList
        }
        if(nearMsgList.length>0) {
            this.sendMessage(nearParam)
        }
        // 发广播
        let param = {
            type: 'notify',
            data: {
                content: this.userName + '加入了群聊'
            }
        }
        this.sendGroupMessage(param)
    }

    onClose() {
        // 发广播
        let param = {
            type: 'notify',
            data: {
                content: this.userName + '离开了群聊'
            }
        }
        this.sendGroupMessage(param)
    }

    onMsg(msg) {
        let senderId = msg.senderId
        let param = {
            type: 'msg',
            data: {
                senderId,
                senderName: allUser[senderId - 1].userName,
                senderIcon: allUser[senderId - 1].userIcon,
                content: msg.content,
                time: msg.time
            }
        }
        //存储近10条消息
        cacheNearMsg(param)
        this.sendGroupMessage(param)
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

function cacheNearMsg(msg) {
    if(nearMsgList.length === 10) {
        nearMsgList.shift()
    }
    nearMsgList.push(msg)
}

function writeIndex(index) {
    fs.writeFile('userIndex.txt', index, 'utf8', function(error){
        if(error){
            console.log(error);
            return false;
        }
        console.log('写入成功');
    })
    
}

function readUserIndexFile() {
    fs.readFile('userIndex.txt',function(error,data){
        if(error){
            console.log(error);
            return false;
        }
        //console.log(data);  //data是读取的十六进制的数据。  也可以在参数中加入编码格式"utf8"来解决十六进制的问题;
        console.log(data.toString());  //读取出所有行的信息 
        if(data.toString()) {
            userIndex = data.toString()
        }
        console.log(userIndex)
    })
}

var server = ws.createServer(function(conn){
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
        handler.onClose()
        console.log("关闭连接")
    });
    conn.on("error", function (code, reason) {
        handler.onClose()
        console.log("异常关闭")
    });
}).listen(8001)