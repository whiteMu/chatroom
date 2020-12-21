const ws = require("nodejs-websocket");
const fs = require("fs")
const baseUrl = ''
var allUser = [{
    userName: '可达鸭',
    userIcon: './assets/14.jpg'
},{
    userName: '哆啦A梦',
    userIcon: './assets/0.jpg'
},{
    userName: '樱桃小丸子',
    userIcon: './assets/1.jpg'
},{
    userName: '蜡笔小新',
    userIcon: './assets/2.jpg'
},{
    userName: '蒙奇·D·路飞',
    userIcon: './assets/3.jpg'
},{
    userName: '夏目贵志',
    userIcon: './assets/4.jpg'
},{
    userName: '柯南',
    userIcon: './assets/5.jpg'
},{
    userName: '樱田妮妮',
    userIcon: './assets/6.jpg'
},{
    userName: '风间彻',
    userIcon: './assets/7.jpeg'
},{
    userName: '猫咪老师',
    userIcon: './assets/8.jpeg'
},{
    userName: '小起',
    userIcon: './assets/9.jpg'
},{
    userName: '犬夜叉',
    userIcon: './assets/10.jpg'
},{
    userName: '阿呆',
    userIcon: './assets/11.jpg'
},{
    userName: '大雄',
    userIcon: './assets/12.jpg'
},{
    userName: '小刘鸭',
    userIcon: './assets/13.jpg'
},{
    userName: '托尼托尼·乔巴',
    userIcon: './assets/15.jpg'
},{
    userName: '罗罗诺亚·索隆',
    userIcon: './assets/16.jpg'
},{
    userName: '杀生丸',
    userIcon: './assets/17.jpg'
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
                content: '"' + this.userName + '"' + '加入了群聊'
            }
        }
        this.sendGroupMessage(param)
    }

    onClose() {
        // 发广播
        let param = {
            type: 'notify',
            data: {
                content: '"' + this.userName + '"' + '离开了群聊'
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