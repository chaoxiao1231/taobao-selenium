'use strict';
const { Service } = require('egg');

const { By } = require('selenium-webdriver');
class UtilService extends Service {

  // 1. 登录
  async login(browser, startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
    await browser.switchTo().frame(browser.findElement(By.id('sufei-dialog-content')));
    await browser.findElement(By.id('fm-login-id')).sendKeys('***'); // 这里***替换为淘宝账号
    await browser.findElement(By.id('fm-login-password')).sendKeys('***'); // 这里***替换为淘宝密码
    browser.sleep(1000);
    const actions = browser.actions({ async: true }); // 实例化一个action对象
    const button = await browser.findElement(By.id('nc_1_n1z'));
    try {
    // 1.1登录-滑块验证
      await actions.move({
        origin: button,
        duration: 1000,
      }).pause(100).press()
        .move({
          origin: button,
          x: 208,
          duration: 10,
        })
        .pause(300)
        .perform();
      browser.sleep(1000);
      for (let i = 0; i < 3; i++) {
        const text1 = await browser.findElement(By.id('nc_1__scale_text'));
        const text2 = await text1.findElement(By.className('nc-lang-cnt')).getText();
        if (text2 === '验证通过') {
          browser.sleep(500);
          await browser.findElement(By.className('password-login')).click(); // 登录
          await browser.switchTo().defaultContent(); // 跳出iframe
          return 0;
        }
      }
      return 500;
    } catch (error) {
      this.ctx.logger.info('验证不成功，请重试', error);
    }
  }

  // 2.验证是否登录成功site-nav-sign
  async loginVerify(browser) {
    const loginTimer = setInterval(async () => {
      try {
        // const loginContainer = await browser.findElement(By.className('J_LinkBuy')).getText();
        // this.ctx.logger.info('loginContainer', loginContainer);
        // this.ctx.logger.info('登录成功，抢货中...');
        await this.buyStart(browser);
        clearInterval(loginTimer);
      } catch (error) {
        await browser.switchTo().defaultContent(); // 跳出iframe
        // this.ctx.logger.error('登录不成功，请重试...');
      }
    }, 1000);
  }

  // 3. 开始抢货
  async buyStart(browser) {
    const initUrl = await browser.getCurrentUrl();
    const buyTimer = setInterval(async () => {
      const isAdvanceStart = this.startTime - Date.now() <= 500;
      if (Date.now() >= this.startTime || isAdvanceStart) {
      // this.ctx.logger.info('到达抢单时间，持续抢单中...');
        try {
          const submitContainer = await browser.findElement(By.className('tb-btn-buy'));
          const submitButton = await submitContainer.findElement(By.className('J_LinkBuy'));
          submitButton.click();
        } catch (error) {
          const url = await browser.getCurrentUrl();
          if (url !== initUrl) {
            this.initUrl = url;
            const time = Date.now() - this.startTime;
            this.ctx.logger.info('订单跳转中...', time);
          // this.ctx.logger.info('页面正在跳转中...');
          }
        }
      } else {
        this.ctx.logger.info('等待抢单，未到达开始时间...');
      }
      if (Date.now() > this.endTime) {
        clearInterval(buyTimer);
      // this.ctx.logger.error('抢单失败1...');
      }
    }, 10);
    // 4.抢货成功- 开始生成订单
    // this.ctx.logger.info('抢货成功- 开始生成订单...');
    const orderTimer = setInterval(async () => {
      try {
        browser.findElement(By.className('go-btn')).click();
        this.ctx.logger.info('抢单成功，努力下订单中...');
        const url = await browser.getCurrentUrl();
        if (url !== this.initUrl) {
          const time = Date.now() - this.startTime;
          this.ctx.logger.info('支付跳转中...', time);
          clearInterval(orderTimer);
        }
      } catch (error) {
      // this.ctx.logger.info('持续抢单中...');
      }
    }, 50);
  }
}
module.exports = UtilService;
