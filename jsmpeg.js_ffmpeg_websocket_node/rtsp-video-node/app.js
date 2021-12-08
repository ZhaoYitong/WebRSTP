// express资源
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// jsmpeg moment child_process脚本所需
const Stream = require('node-rtsp-stream-jsmpeg');
const moment = require('moment');
const callfile = require('child_process');
moment.locale('zh-cn');

// 静态服务器
app.listen(8088, () => {
  console.log(`App listening at port 8088`);
});
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

// 设置允许跨域访问该服务.
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

// 接口

const subtype = 1; //大华码流设置 主码流0，子码流1
const sub = 'sub' //海康码流设置 主码流main ，子码流 sub
const restart = false; //防视频流断开，建议先测试断流时间
const restartTime = 10 * 60000; //防崩溃时间

let playList = {}
let ipcList = [] //当前正在播放的视频数据
let diffList = [] //ipcList中不存在的视频数据

app.post('/startRtspVideo', function (req, res) { // 每次请求都会重新加载
  let data = JSON.parse(req.body.urls)
  let diff = [] //ipcList中不存在的视频数据
  data.forEach(item => {
    let res = ipcList.filter(item1 => {
      return item1.url === item.url && item1.port === item.port
    })
    if(res.length === 0){
      diff.push(item)
    }
  })
  diffList = diff.map((item, index) => {
    return {
      ...item,
      rtsp: item.type !== 'dh' ? (item.url)
      : (item.url + '/cam/realmonitor?channel=' + 32 + '&subtype=' + subtype), // parseInt(index + 32)
    }
  })

  // 播放新加入的视频
  // 关闭相同的websocker端口
  for (let i = 0; i < diffList.length; i++) {
    playList[diffList[i].port] && playList[diffList[i].port].stop()
  }
  // 重启
  for (let i = 0; i < diffList.length; i++) {
    const options = {
      name: 'streamName' + diffList[i].port,
      url: diffList[i].rtsp,
      wsPort: diffList[i].port
    }

    playList[diffList[i].port] = new Stream(options)
    playList[diffList[i].port].start()

    let portIndex = -1
    let res = ipcList.filter((item, index) => {
      if(item.port === diffList[i].port){
        portIndex = index
        return true
      }else{
        return false
      }
    })
    if(res.length === 0){
      ipcList.push(diffList[i])
    }else{
      ipcList[portIndex] = diffList[i]
    }
  }

  // 实时播放任务轮询
  if (restart === true) {
    setInterval(() => {
      // 定时kill ffmpeg
      restartStream()
      console.log(moment().format('MMMM Do YYYY, h:mm:ss a'))
      console.log(restartTime + '执行了')
    }, restartTime)
  }
  res.send({
    resultValue: '开启成功！',
    status: 0,
    errorCode: "",
    message: 'success'
  })
})


// 重启
function restartStream(){
  callfile.exec('sh stop.sh', null, function (err, stdout, stderr) {
    console.log('---------------', err);
    // 关闭websocker端口
    for (let i = 0; i < ipcList.length; i++) {
      playList[ipcList[i].port] && playList[ipcList[i].port].stop()
    }
    // 重启
    for (let i = 0; i < ipcList.length; i++) {
      const options = {
        name: 'streamName' + ipcList[i].port,
        url: ipcList[i].rtsp,
        wsPort: ipcList[i].port
      }

      playList[ipcList[i].port] = new Stream(options)
      playList[ipcList[i].port].start()
    }
  })
}
