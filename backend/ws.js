var ws = require("nodejs-websocket");
console.log("开始建立连接...")
var roomConnetctonList = []

var server = ws.createServer(function(conn){
    console.log(conn)
    roomConnetctonList.push(conn)
    conn.on("text", function (str) {
        roomConnetctonList.forEach((item, index)=>{
            item.sendText(str)
        })
        
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