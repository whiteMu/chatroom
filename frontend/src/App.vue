<template>
  <div id="app">
    <div id="mess">{{statusTips}}</div>
    <div class="chat-wrapper">
      <!-- message list -->
      
      <div class="list-wrap">
        <div class="list" v-for="(item, index) in messageList" :key="index">
          <div class="send">
            {{item}}
            <div class="arrow"></div>
          </div>
        </div>
      </div>
      <!-- messge input -->
      <div class="footer">
        <input id="mes-input" v-model="inputText"/>
        <button @click="sendMsg">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      statusTips: '聊天室正在连接221....',
      inputText: '',
      messageList: []
    }
  },
  created() {
    const _this = this
    _this.userInfo = window.localStorage.getItem("userInfo") || null
    _this.createWS()
  },
  beforeDestroy() {
    const _this = this
    _this.ws.close()
  },
  methods: {
    createWS() {
      const _this = this
      if (window.WebSocket) {
        _this.ws = new WebSocket(`ws://${window.location.hostname}:8001`)
        _this.ws.onopen = function () {
          console.log('连接服务器成功');
          _this.statusTips = '连接成功';
          //登入消息
          let param
          try {
            param = {
              type: 'self',
              userid: _this.userInfo.userid,
              photo: _this.userInfo.photo,
              username: _this.userInfo.username
            }
          } catch {
            param = {
              type: 'self'
            }
          }
          _this.ws.send(JSON.stringify(param))
        }
        _this.ws.onclose = function () {
          console.log('服务器关闭');
        }
        _this.ws.onerror = function () {
          console.log('连接出错');
        }
        _this.ws.onmessage = function (e) {
          // 接收信息
          let resData = e.data
          console.log("接受数据e", resData)
          //分配的个人信息写入本地
          if(resData.type === 'self') {
            _this.userInfo = resData
            window.localStorage.setItem('userInfo', _this.userInfo)
          } else if(resData.type === 'user') {//别人登入消息
            
          } else {//消息
            _this.messageList.push(resData)
          }
          
          
        }
      }
    },
    sendMsg() {
      const _this = this;
      let msg = _this.inputText
      let param = {
        type: 'message',
        msg,
        userid: _this.userInfo.userid,
        username: _this.userInfo.username
      }
      _this.ws && _this.ws.send(param)
    }
  }
}
</script>

<style lang="less">
*{
  box-sizing: border-box;
  margin: 0; 
  padding: 0;
}
html,body{
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background:#4D4948;
}
body {
  margin: 0;
}
.chat-wrapper {
  flex: 1;
  border: 1px solid slategrey;
  display: flex;
  flex-direction: column;
}
.list-wrap {
  flex: 1;
}
.footer {
  width: 100vw;
  display: flex;
}
.footer input {
  width: 100%;
  height: 40px;
  border: 1px solid slategrey;
}

.send {
  position:relative;
  width:150px;
  height:35px;
  padding: 6px;
  background:#F8C301;
  border-radius:5px; /* 圆角 */
  margin:20px auto 0;
}

.send .arrow {
  position:absolute;
  top:5px;
  right:-16px; /* 圆角的位置需要细心调试哦 */
  width:0;
  height:0;
  font-size:0;
  border:solid 8px;
  border-color:#4D4948 #4D4948 #4D4948 #F8C301;
}
</style>
