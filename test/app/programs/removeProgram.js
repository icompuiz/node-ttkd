describe('Removing a program', function() {

  it('should select program and click to remove from the list', function() {
    browser.get('http://localhost:9000/admin/programs');
    
    var rows = element.all(by.repeater('row in renderedRows'));
    
    expect(rows.count()).toEqual(1);
    
    var pro = element(by.repeater('row in renderedRows').row(0));
    pro.click();

    var remove = element(by.buttonText('Remove Selected'));
    remove.click();

    var yes = element(by.buttonText('Yes'));
    yes.click();

    browser.sleep(1000);
    expect(rows.count()).toEqual(0);
  });

});