<div align=center>

# BlogNow
  
Follow the wizard, start your blog journey right now!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFreeNowOrg%2FBlogNow&env=MONGO_URI&envDescription=MONGO_URI%3A%20Your%20MongoDB%20Atlas%20connect%20uri%20with%20username%20and%20password.%20(e.g.%20mongodb%2Bsrv%3A%2F%2Fuser%3Apassword%40yours.mongodb.net)%20%2F%20BLOGNOW_DB(optional)%3A%20Your%20blog's%20db%20name.%20(e.g.%20blog_now)&repo-name=my-blog&demo-title=BlogNow&demo-description=BlogNow%20Offical%20Demo&demo-url=https%3A%2F%2Fblog-now.vercel.app%2F&demo-image=https%3A%2F%2Fi.loli.net%2F2021%2F10%2F12%2FL38zE4oF7ITsqHO.jpg)

**BlogNow** 是一款完全免费的开源动态博客引擎。

Free dynamic blog engine with full backend support. Powered by Vercel & MongoDB Atlas. Built with :heart:
  
</div>

![A8AC1770-76BF-441D-ABAC-A7B2B7887B6E.jpeg](https://i.loli.net/2021/10/12/MB7rNJUpjARfQtw.jpg)

## 特色功能

### 完全免费且开源

一般来说，部署一个基于 BlogNow 的博客——没错，包括后端——是完全可以做到白嫖的！

在你的博客内容数据超过 500 MB 以前，均可不花一分钱地使用。

### 开箱即用

很多时候，个人博客只是极客们的玩具，因为个人博客的安装或者使用都有一定的技术门槛。

大部分人都望而却步了——服务器是什么？数据库又是什么？域名怎么注册？诶——怎么还要备案啊！

但是 BlogNow 的安装超级简单——呃，这算是安装吗？——你似乎只需要点击几个按钮，然后一路下一步就行了。

### 包括完整的后端

- 文章管理——撰写、编辑、删除博文
- 用户系统——注册、用户权限
- 媒体管理（开发中🚧）

### 动态博客系统，更新内容超级快

相当长一段时间里，白嫖博客的手段基本都是基于静态网站生成器和持续构建，例如经典的 Hexo + GitHub Actions 组合。

然而，BlogNow 敲开了白嫖博客新时代的大门，它是一款**动态博客引擎**，你可以类比传统的博客系统——例如 WordPress。

这意味着你不必在每次更新文章时重新构建——现在，你只需编辑文章，点击保存，然后眨眨眼，网页便自己刷新了，你的好点子已经汇入了互联网的川流之中，就是这么迅速。

### 支持 markdown，在文章里加点格式吧

![7F2D54A2-D68C-42AC-A3B5-9E5897B23789.jpeg](https://i.loli.net/2021/10/12/8hFVSnrCRuJwtI7.jpg)

BlogNow 采用 markdown 保存文章内容，得益于 md，你可以在文章里插入各种格式。

**粗体字** _斜体字_ ~~删除线~~ [链接](https://github.com)

- 一个
- 无序
- 列表

> 以及更多格式……

BlogNow 内置了非常强大的 markdown 编辑器，你可以点击按钮插入元素，然后实时预览你所写的内容。

### 另外，超棒的 API 接口——极客们也一定会喜欢

非常 RESTful 风格的 API 设计，请看《一篇文章的一生》：

1. 新建一篇博客
   `POST /post/create`
2. 获取博客内容
   `GET /post/uuid/foo-bar-baz`
3. 修改博客内容
   `PATCH /post/uuid/foo-bar-baz`
4. 最后再删掉它
   `DELETE /post/uuid/foo-bar-baz`

——顺便一提，[API 文档](https://blog-now.vercel.app/-/api-references)也很详尽！
