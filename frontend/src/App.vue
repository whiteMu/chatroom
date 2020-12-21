<template>
  <div id="app">
    <!-- <header>聊天室({{statusTips}})</header> -->
    <div class="chat-wrapper">
      <!-- message list -->
      <div class="list-wrap">
        <div class="list" v-for="(item, index) in messageList" :key="index">
          <div class="notify" v-if="item.type=='notify'">{{item.data.content}}</div>
          <template v-else>
            <div class="list-content" v-if="item.data.senderId != userId">
              <img class="icon" :src="item.data.senderIcon" />
              <div class="list-content-msg">
                <div class="sender-name">{{item.data.senderName}}</div>
                <div class="send left">
                  {{ item.data.content }}
                  <div class="arrow"></div>
                </div>
              </div>
            </div>
            <div class="list-content right" v-else>
              <div class="list-content-msg">
                <div class="sender-name" style="text-align:right;">{{item.data.senderName}}</div>
                <div class="send right">
                  {{ item.data.content }}
                  <div class="arrow"></div>
                </div>
              </div>
              <img class="icon" :src="item.data.senderIcon" />
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- messge input -->
      <div class="footer">
        <input id="mes-input" v-model="inputText" />
        <button class="send-btn" @click="sendMsg">发送</button>
        <!-- <button @click="clear">换名称</button> -->
      </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      statusTips: "正在连接...",
      userId: "",
      inputText: "",
      messageList: [],
    };
  },
  created() {
    const _this = this;
    _this.userId = window.localStorage.getItem("userId") || null;
    _this.createWS();
  },
  beforeDestroy() {
    const _this = this;
    _this.ws.close();
  },
  methods: {
    createWS() {
      const _this = this;
      if (window.WebSocket) {
        _this.ws = new WebSocket(`wss://${window.location.host}/ws`);

        _this.ws.onopen = function () {
          _this.statusTips = "连接成功";
          //登入消息
          let param = {
            type: "enter",
            userId: _this.userId,
          };
          _this.sendRequest(param);
        };

        _this.ws.onclose = function () {
          console.log("服务器关闭");
        };

        _this.ws.onerror = function () {
          console.log("连接出错");
        };

        _this.ws.onmessage = function (e) {
          // 接收信息
          let resData = JSON.parse(e.data);
          //分配的个人信息写入本地
          if (resData.type === "register") {
            _this.userId = resData.data.userId;
            window.localStorage.setItem("userId", _this.userId);
          } else if (resData.type === "msgList") {
            _this.messageList = resData.data;
          } else {
            //消息 or 通知
            _this.messageList.push(resData);
          }
        };
      }
    },
    sendRequest(param) {
      const _this = this;
      _this.ws && _this.ws.send(JSON.stringify(param));
    },
    sendMsg() {
      const _this = this;
      let param = {
        type: "msg",
        content: _this.inputText,
        senderId: _this.userId,
        time: new Date().getTime(),
      };
      _this.sendRequest(param);
      _this.inputText = "";
    },
    clear() {
      window.localStorage.removeItem("userId");
    },
  },
};
</script>

<style lang="less">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html,
body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background: #4d4948;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #4d4948;
  padding: constant(safe-area-inset-top) constant(safe-area-inset-right)
    constant(safe-area-inset-bottom) constant(safe-area-inset-left);
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
    env(safe-area-inset-bottom) env(safe-area-inset-left);
}
body {
  margin: 0;
}
.chat-wrapper {
  height: calc(100% - 45px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.list-wrap {
  flex: 1;
  padding-top: 20px;
  .list {
    margin-bottom: 20px;
    .notify{
      color: #5e9fbb;
      font-size: 14px;
      text-align: center;
    }
    .list-content {
      display: flex;
      .list-content-msg{
        .sender-name{
          color: #ccc;
          font-size: 12px;
        }
      }
      &.right{
        justify-content: flex-end;
      }
      .send {
        position: relative;
        min-width: 10px;
        max-width: 250px;
        min-height: 35px;
        padding: 6px;
        background: #f8c301;
        border-radius: 5px;
        margin-right: 10px;
        //margin:20px auto 0;
        .arrow {
          position: absolute;
          top: 8px;
          right: -16px; /* 圆角的位置需要细心调试哦 */
          width: 0;
          height: 0;
          font-size: 0;
          border: solid 8px;
          border-color: #4d4948 #4d4948 #4d4948 #f8c301;
        }
      }
      .send.left {
        background: #ffffff;
        margin-left: 10px;
        .arrow {
          position: absolute;
          top: 8px;
          left: -16px; /* 圆角的位置需要细心调试哦 */
          width: 0;
          height: 0;
          font-size: 0;
          border: solid 8px;
          border-color: #4d4948 #ffffff #4d4948 #4d4948;
        }
      }
      .icon {
        width: 40px;
        height: 40px;
        margin: 10px;
        border-radius: 4px;
      }
    }
  }
}
.footer {
  width: 100vw;
  display: flex;
  padding: 0 10px;
  input {
    width: 100%;
    height: 45px;
    border: 1px solid slategrey;
    padding-left: 10px;
    font-size: 16px;
  }
  .send-btn{
    width: 80px;
    height: 43px;
    border: 0;
    font-size: 18px;
    border-radius: 4px;
    color: #fff;
    background: #f8c301;
  }
}
</style>
