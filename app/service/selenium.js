'use strict';

const { Builder } = require('selenium-webdriver');
const Service = require('egg').Service;
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options().excludeSwitches('enable-automation');
class SeleniumService extends Service {
  async init() {
    const { ctx } = this;
    const startTime = new Date('2020-5-29 10:34:30');
    const endTime = new Date('2020-6-29 10:50:00');
    const browser = new Builder().forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    await browser.get('https://item.taobao.com/item.htm?spm=a230r.1.14.40.24db2126CbfTFZ&id=588998832288&ns=1&abbucket=10#detail');
    // 登录模组
    const code = await ctx.service.login(browser, startTime, endTime);
    // this.ctx.logger.info('code', code);
    if (code === 0) {
      this.ctx.logger.info('验证成功');
      await ctx.service.loginVerify(browser);
    } else if (code === 500) {
      this.ctx.logger.error('验证失败，请重新登录');
    }
  }
}

module.exports = SeleniumService;
