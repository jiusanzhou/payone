<div align="center">

# `payone`

**多合一收款码生成器**

*⚠️ 由于 `git.io` 服务已经下线，早期为无后端架构，`payone`服务没有存储任何信息，通过 `payone` 服务创建的二维码链接无法自动迁移，需手动重新创建。*

</div>


## ✨ 特性

- 🔴 简单高效使用
- 🌎️ 无需自己部署，拥有收款页面
- 👆 一键生成收款页面
- 🖥️ 自动识别并生成对应平台二维码
- 🛠 更多平台支持开发中...

## 🛠 平台


*当前支持以下平台，如果需要对其他平台做支持欢迎提交issue。*

|平台|图标|支持状态|自动跳转|
|:--|:--:|:--:|:--:|
|支付宝|<img width="40" height="40" src="web/public/assets/img/alipay-logo.svg" />|✅|✅|
|微信支付|<img width="40" height="40" src="web/public/assets/img/wechat-logo.svg" />|✅|❌|
|QQ支付|<img width="40" height="40" src="web/public/assets/img/qq-logo.svg" />|🚧|❌|

## 🖼️ 预览

![editor](/assets/preview-editor.png)

## 设计

```yaml
id: INT # internal ids
key: STRING # unicode for payone code
user_id: user.id # created by who
data: {} # config data for code
created_at: date
updated_at: date
```

## ❤️ 鼓励

<img width="200" src="https://payone.wencai.app/s/zoe.png" alt="鼓励一下由 https://payone.wencai.app 赞助">

*鼓励一下由 https://payone.wencai.app 赞助*
