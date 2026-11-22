# 县城浮世绘 · CountyUkiyoe

《县城浮世绘》是一部可以翻阅的人物图鉴。427 张人物卡收录县城日常中的具名角色和复合群像，配有原创肖像、人物故事与档案。档案按出处列出相关抖音作品。[打开人物图鉴](https://yuxuan6426.github.io/CountyUkiyoe/)

- 按人名、别名或关键词搜索，按人物类型筛选，也可按故事数量排序。
- 打开人物卡可阅读故事与档案。部分角色配有两张艺术设定变体。
- 收藏保存在当前浏览器，方便回看。

## 本地预览

安装 Python 3.13 后，在项目根目录运行以下命令。

```sh
python site/preview.py
```

打开 [本地图鉴](http://127.0.0.1:8102/)。Codex 中可运行同名项目的「启动图鉴预览」动作。用 `python site/build.py --output dist` 生成一份静态网站。GitHub Actions 使用同一构建入口部署 GitHub Pages。

## 内容与许可

公开档案以独立编号组织角色及其不同叙述版本。`gallery/` 保存发布版图鉴数据、肖像与档案，`site/` 保存前端与构建源码。

项目自有代码采用 [AGPL-3.0-only](LICENSE)。可再授权的原创图鉴图文采用 [CC BY-NC-ND 4.0](ASSET-LICENSE.md)，允许署名后以原样作非商业分享。第三方软件许可见 [Marked](THIRD-PARTY-NOTICES.md)。
