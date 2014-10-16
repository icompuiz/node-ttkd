describe('Creating a program', function() {

  it('should navigate to create program page', function() {
    browser.get('http://localhost:9000/admin/programs');
    var create = element(by.buttonText('Create New Program'));
    create.click();

    expect(browser.getCurrentUrl()).toEqual('http://localhost:9000/admin/programs/create');
  });
  
  it('should fill in the name of the program', function() {
  	var name = element(by.model('newProgram.name'));
  	name.sendKeys('Tae Kwon Do Test');
	
  	expect(name.getText()).toEqual('Tae Kwon Do Test');
  });

  it('should create program', function() {
  	var create = element(by.buttonText('Create Program'));
  	create.click();

  	expect(browser.getCurrentUrl()).toEqual('http://localhost:9000/admin/programs');
  });

  it('should appear in the list of programs', function() {
  	var pros = element.all(by.repeater('row in renderedRows'));

  	expect(pros.count()).toEqual(1);
  });

});