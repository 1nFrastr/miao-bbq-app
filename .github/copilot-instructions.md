# 项目介绍

这是一个基于Taro开发的微信小程序全栈项目，必须按照以下要求进行。

## 全局要求

- 尽可能使用最新的稳定版技术栈，包括依赖、框架等。
- 如果框架有CLI工具，尽可能使用CLI工具进行项目初始化。
- 除非我明确要求，你不要创建任何说明文档，包括你新写的功能/重构的功能的各种总结性说明，都不要！

## 前端

- 必须使用pnpm作为包管理器
- 必须使用typescript
- 必须使用react
- 必须使用Sass作为样式预处理器
- 必须使用Taro v4版本

## 后端

- 必须使用Python作为后端语言
- 必须使用venv作为虚拟环境
- 必须使用pip作为包管理器
- 必须使用Django作为后端框架
- 必须使用Django REST Framework作为API框架
- 所有后端项目相关的CLI，在首次打开CLI会话前，必须先进入虚拟环境再执行操作，使用命令 source ./backend/venv/Scripts/activate 

## 数据库

- 必须使用sqlite作为数据库
- 必须使用Django ORM作为数据库操作工具
- 必须使用Django migrations进行数据库迁移

## 依赖

- 后端在必要时使用微信生态相关的依赖库，以实现小程序登录等

## CLI命令规范

- 根据当前操作系统来决定使用的命令行工具
- Windows使用Git bash，Linux和Mac使用Bash
- 注意windows下的路径风格，在git bash下可以直接使用如 /d/work/my-project 这样的路径

