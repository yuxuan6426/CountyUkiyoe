# 县城浮世绘人物图鉴维护指引

以 `gallery/index.json` 和人物目录为公开事实源。人物详情由 `site/character.html?card=<slug>` 打开。审核 Markdown 白名单与边界，保留原有编号和授权来源。

## 构建和验收

- `python site/build.py --platform wiki`
- `node --test tests/markdown.test.cjs`

在空目录构建，以 `release.sha256` 核对产物，并通过 HTTP 验证桌面和移动端。Pages 与 Wiki 入口分别生成本站址和站际链接。只将公开数据和列入构建规则的文件放进发布目录。许可及第三方依赖见 README。
