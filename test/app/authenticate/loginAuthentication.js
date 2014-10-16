describe('TTKD homepage correct authentication', function() {

  beforeEach(function() {
    browser.get('http://localhost:9000/admin/login');
  });

  it('should login successfully', function() {
    var username = element(by.model('username'));
    var pass = element(by.model('password'));
    var login = element(by.buttonText('Login'));
    username.sendKeys('administrator');
    pass.sendKeys('password');
    login.click();

    expect(browser.getCurrentUrl()).toEqual('http://localhost:9000/admin/dashboard');
  });
  
  // it('should fail to login', function() {
  //   var username = element(by.model('username'));
  //   var pass = element(by.model('password'));
  //   var login = element(by.buttonText('Login'));
  //   username.sendKeys('afafdadfa');
  //   pass.sendKeys('adfasdf');
  //   login.click();

  //   expect(browser.getCurrentUrl()).toEqual('http://localhost:9000/admin/login');
  // });
});