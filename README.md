# 县城浮世绘 · CountyUkiyoe

《县城浮世绘》是一部可以翻阅的人物图鉴。427 张人物卡收录县城日常中的具名角色和复合群像，配有原创肖像、人物故事与档案。档案按出处列出相关抖音作品。[打开人物图鉴](https://xian.yuxuan.wiki/) · [AI 领卡处](https://card.yuxuan.wiki/) · [隐藏属性测试](https://quiz.yuxuan.wiki/)

- 按人名、别名或关键词搜索，按人物类型筛选，也可按故事数量排序。
- 打开人物卡可阅读故事与档案。部分角色配有两张艺术设定变体。
- 收藏保存在当前浏览器，方便回看。

## 本地预览

安装 Python 3.13 后，在项目根目录运行以下命令。

```sh
python site/preview.py
```

打开 [本地图鉴](http://127.0.0.1:8102/)。预览构建在临时目录，退出服务器时清理。用 `python site/build.py --output dist` 生成一份可发布的静态网站，再构建时指定一个空的输出目录。GitHub Actions 使用同一构建入口部署 GitHub Pages。

## 内容与许可

公开档案以独立编号组织角色及其不同叙述版本。`gallery/` 保存发布版图鉴数据、肖像与档案，`site/` 保存前端与构建源码。

项目自有代码采用 [AGPL-3.0-only](LICENSE)。可再授权的原创图鉴图文采用 [CC BY-NC-ND 4.0](ASSET-LICENSE.md)，允许署名后以原样作非商业分享。第三方软件许可见 [Marked](THIRD-PARTY-NOTICES.md)。

## 部署入口

| 站点 | GitHub Pages | 独立域名 |
| --- | --- | --- |
| 县城浮世绘人物图鉴 | [Pages](https://yuxuan6426.github.io/CountyUkiyoe/) | [Wiki](https://xian.yuxuan.wiki/) |
| 县城隐藏属性测试 | [Pages](https://yuxuan6426.github.io/CountyUkiyoe-Quiz/) | [Wiki](https://quiz.yuxuan.wiki/) |
| 县城浮世绘 AI 领卡处 | [Pages](https://yuxuan6426.github.io/CountyUkiyoe-Play/) | [Wiki](https://card.yuxuan.wiki/) |

## 目录与维护

```text
gallery/          公开人物索引、档案与原肖像
site/             页面模板、构建器与浏览器代码
tests/            Markdown 规则回归
docs/             面向用户和 AI 的使用指引
dist/             构建输出
```

```sh
python site/build.py --platform wiki
node --test tests/markdown.test.cjs
```

生成目录为本次构建产物。代码遵循 [代码许可](LICENSE)，图鉴原创资产适用[图文许可](ASSET-LICENSE.md)。另见 [维护代理指引](AGENTS.md)、[AI 使用指引](docs/agent-guide.md)及[安全政策](SECURITY.md)。

## English overview

A static reference gallery of fictional county characters. Start with the gallery, open a profile by slug, and use the published source links for context.
