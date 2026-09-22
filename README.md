# Whim Toolkit

小工具集合网站：一个 `index.html` 装下全部页面、样式与逻辑，无框架、无构建步骤。

| 工具 | 介绍 |
| --- | --- |
| 摩斯电码圆环 | 把一段文字的摩斯电码按时间比例铺满整个圆周，可调参数并导出 PNG |
| 猪圈密码字体 | Pigpen Cipher TTF：在线试用、字符映射表、字体文件下载 |
| ASCII 二进制字体 | Vertical ASCII（方角 / 圆角两版）：在线试用，TTF / WOFF 下载 |

## 使用

用浏览器访问站点即可；本地使用时也可以直接双击 `index.html`，无需服务器。页面通过 hash 路由切换视图：`#/` 主页、`#/morse`、`#/pigpen`、`#/ascii`，顶栏导航仅在工具页显示。

## 部署

纯静态站点，没有构建步骤，发布目录就是仓库根目录，可部署到 Netlify、GitHub Pages 等任意静态托管。仓库已带 `netlify.toml`，Netlify 导入后零配置；hash 路由不产生服务器端路径，无需重定向规则，无效路径由 `404.html` 引回首页。

## 目录结构

```text
index.html            页面、样式与全部逻辑（单文件应用）
404.html              无效路径跳回首页
netlify.toml          Netlify 发布配置（根目录发布、无构建）
fonts/                index.html 内嵌字体的源文件，两者内容一致
scripts/
  embed_fonts.py      把 fonts/ 重新写入 index.html 的 FONT_B64
```

## 字体的内嵌方式

两款字体共 5 个文件（TTF / WOFF）以 base64 形式写在 `index.html` 的 `FONT_B64` 常量中，因此整个网站可以单文件分发，试用与下载都直接使用内嵌数据。字体更新后，替换 `fonts/` 中的对应文件，然后执行：

```sh
python scripts/embed_fonts.py
```

脚本按 `FONT_B64` 的键名定位替换，需要 Python 3，无第三方依赖。

## 添加新工具

1. 在 `index.html` 中新增一个视图区块：

   ```html
   <section id="view-xxx" class="view">
     <div class="tool">
       <aside class="panel">…控制面板…</aside>
       <main class="tmain">…展示区…</main>
     </div>
   </section>
   ```

2. 在路由脚本的 `VIEWS` 数组中加入 `'xxx'`。
3. 在顶栏 `<nav>` 与首页 `.cards` 中各加入一个入口（`href="#/xxx"`，导航链接带 `data-nav="xxx"`）。
4. 样式复用现有类：`panel`（左侧控制面板）、`seg`（分段按钮）、`btn` / `btn ghost`（按钮）、`row`（滑块 + 数字框）、`sample`（展示底板）、`hint` / `tip`（说明文字）等。
