# Whim Toolkit

小工具集合网站：纯静态、无框架、无构建步骤。`index.html` 只放页面骨架与各视图 HTML，每个工具的逻辑独立放在 `js/` 下的一个文件里。

| 工具 | 介绍 |
| --- | --- |
| 摩斯电码圆环 | 把一段文字的摩斯电码按时间比例铺满整个圆周，可调参数并导出 PNG |
| 猪圈密码字体 | Pigpen Cipher TTF：在线试用、字符映射表、字体文件下载 |
| ASCII 二进制字体 | Vertical ASCII（方角 / 圆角两版）：在线试用，TTF / WOFF 下载 |
| 时钟指针角度 | 输入时分秒，给出三针在钟面（12 点 = 0° 顺时针）与数学（3 点 = 0° 逆时针）两种约定下的角度，附钟面示意 |

## 使用

用浏览器访问站点即可；本地使用时也可以直接双击 `index.html`，无需服务器。页面通过 hash 路由切换视图：`#/` 主页、`#/morse`、`#/pigpen`、`#/ascii`、`#/clock`，顶栏导航仅在工具页显示。

## 部署

纯静态站点，没有构建步骤，发布目录就是仓库根目录，可部署到 Netlify、GitHub Pages 等任意静态托管。仓库已带 `netlify.toml`，Netlify 导入后零配置；hash 路由不产生服务器端路径，无需重定向规则，无效路径由 `404.html` 引回首页。

## 目录结构

```text
index.html            页面骨架：顶栏与全部视图的 HTML，按顺序引入样式与脚本
css/
  base.css            共用样式：变量、顶栏、首页、面板与控件、工具页展示区
  morse.css           摩斯圆环专属样式
  clock.css           时钟页专属样式
js/
  fonts.js            FONT_B64 字体内嵌数据与 @font-face 注入
  common.js           共用函数：escHtml、downloadFont、bindSize、bindBg
  router.js           hash 路由（自动识别 view-<名称> 的视图区块）
  morse.js            摩斯电码圆环
  pigpen.js           猪圈密码字体
  ascii.js            ASCII 二进制字体
  clock.js            时钟指针角度
404.html              无效路径跳回首页
netlify.toml          Netlify 发布配置（根目录发布、无构建）
fonts/                js/fonts.js 内嵌字体的源文件，两者内容一致
scripts/
  embed_fonts.py      把 fonts/ 重新写入 js/fonts.js 的 FONT_B64
```

## 字体的内嵌方式

两款字体共 5 个文件（TTF / WOFF）以 base64 形式写在 `js/fonts.js` 的 `FONT_B64` 常量中，首页卡片图标、在线试用与下载都直接使用内嵌数据。字体更新后，替换 `fonts/` 中的对应文件，然后执行：

```sh
python scripts/embed_fonts.py
```

脚本按 `FONT_B64` 的键名定位替换，需要 Python 3，无第三方依赖。

## 添加新工具

以新增工具 `xxx` 为例，按以下四步：

1. **视图区块**：在 `index.html` 中新增。路由会自动识别 `view-` 前缀的区块，无需登记：

   ```html
   <section id="view-xxx" class="view">
     <div class="tool">
       <aside class="panel">…控制面板…</aside>
       <main class="tmain">…展示区…</main>
     </div>
   </section>
   ```

2. **工具逻辑**：新建 `js/xxx.js`，沿用现有工具的 IIFE 写法，直接绑定视图内元素；需要时可用 `common.js` 的共用函数（`escHtml`、`downloadFont`、`bindSize`、`bindBg`）。最小骨架：

   ```js
   "use strict";

   (function xxxLab(){
     const $ = id => document.getElementById(id);
     // …绑定 #view-xxx 内的控件并渲染…
   })();
   ```

   写好后在 `index.html` 底部现有脚本之后追加一行：

   ```html
   <script src="js/xxx.js"></script>
   ```

3. **入口**：在顶栏 `<nav>` 与首页 `.cards` 中各加一个，链接指向 `#/xxx`：

   ```html
   <a href="#/xxx" data-nav="xxx">工具名</a>
   ```

4. **样式**：优先复用现有类——`panel`（左侧控制面板）、`seg`（分段按钮）、`btn` / `btn ghost`（按钮）、`row`（滑块 + 数字框）、`sample`（展示底板）、`hint` / `tip`（说明文字）等；确有专属样式时新建 `css/xxx.css`，并在 `index.html` 中排在 `css/base.css` 之后引入。

