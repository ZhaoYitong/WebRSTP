# 基于 jsmpeg ffmpeg websocket 实现 web端播放video

## 环境配置
  - Windows
    - Node
    - ffmpeg 官方压缩包

## 运行环境
  - Web
    - 修改 rtspData.url
    - 修改 rtspData.port
  - Server
    - node app.js

  - 访问 index.html

## 执行失败
  - Windows
    - node 服务报错
      ```bash
        Error: spawn ffmpeg ENOENT
      ```
      - ffmpeg 环境变量未配置
      - 系统环境变量未配置
        ```bash
          %SystemRoot%\system32
        ```
    