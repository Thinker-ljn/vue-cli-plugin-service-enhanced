# vue-cli-plugin-service-enhanced

启动 cli-service serve-enhanced 服务后，监听以下文件，有改动的情况下，将会自动重启服务。其中\[mode] 为[当前指令运行时的模式](https://cli.vuejs.org/zh/guide/mode-and-env.html)

```
  .env
  .env.local
  .env.[mode]
  .env.[mode].local
  vue.config.js
```

也可以在项目下的 `package.json` 里添加 `cliServiceWatchFiles` 选项来手动写入需要监听的文件（字符串或字符串数组），文件的路径、要递归监视的路径或glob模式。具体写法查看[chokidar](https://github.com/paulmillr/chokidar#api)的 `watch` 方法的第一个参数的写法。

同时，本模块会为您的项目注入环境变量 `VUE_APP_CLI_SERVICE_MODE`，其值为[当前指令运行时的模式](https://cli.vuejs.org/zh/guide/mode-and-env.html)

如未指定模式，则默认 `cli-service serve` 为 `development`，`cli-service build` 为 `production`

## 使用方法

```
vue add service-enhanced
```

## 问题

本模块使用[chokidar](https://github.com/paulmillr/chokidar)监听文件，在`windows`系统下测试发现，创建新文件时可能监听不到，如上述的监听文件列表除了 `.env` 外，其他四个监听不到。怀疑是存在多个`.(点)`字符而不能工作。

已经创建的文件的改动是可以正常监听到并且重启 `vue-cli-service serve` 的。
