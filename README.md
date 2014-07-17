ToastyCMS 
==============
A CMS for developers like their bread baked twice.

###Major Technologies Used
- NodeJS
- MongoDB
- Mongoose ODM
- AngularJS
- Twitter Bootstrap
- LoDash
- Node Async
- Grunt
- Bower
- Karma

ToastyCMS is my contribution to the world of content management systems. This version of ToastyCMS has been written completly using NodeJS using MongoDB as its core database. The client front end has been developed using AngularJS.

Out of the box Toasty provides an innovative file management system, access control mechanisms, as well at traditional content management features. 
- Defining Static Webpages using a Type, Template, Content style of content management
- Extending the CMS with custom client side and server side modules.
 - Defining client side modules using an api exposed through AngularJS.
 - Defining server side modules using an api exposed through NodeJS.
- Managing access using a Windows NT inspired style of managing permissions
 - Access permissions are handled on every resource using cascading users and groups with create, read, update, and delete permissions  
- A simple built in file system that stores files in MongoDB using GridStore rather than reading and writing files to the hard disk.   

ToastyCMS is largely a personal project and not intended to compete with other, well established CMS platforms out there. It was originally designed with the CakePHP web framework in mind. 

The previous version of ToastyCMS can be found at http://github.com/icompuiz/toastycms and documentation can be found at http://toastycms.com/content/documentation. 
- High level Architecture: https://www.dropbox.com/s/m1f6fy94wjd93na/ToastyMap.pdf
- Model Specification: https://www.dropbox.com/s/wot7ldfugwnq1k7/ModelSpec.docx

Current documentation is coming soon, but in the mean time here are some snaps of my high level architecture/class diagram for it.
- Diagram 1: https://www.dropbox.com/s/eihyoy77q439k7e/WP_20140511_00_37_09_Pro.jpg
- Diagram 2: https://www.dropbox.com/s/jy2jo8ol2zfzn2c/WP_20140510_16_38_07_Pro.jpg

##Type, Template, Content
This is an object oriented style of content managment. A Type describes the attributes of Content. When defining a Type you will be defining all the attributes Content of that Type will have and will select the `input` module that knows the way values for that attribute will be defined by users. 

After a Type has been defined, an output Template can be defined. A template describes how content can be output to viewers. In your template, attributes will be output using output modules that know how to output data of a given input format. 

For example if a particular Type has an attribute called `image` with an input format of `file`. The expectation here is when a user goes to defined a value for this attribute, they will upload a file. For this attrubute an output module called `image` can be defined that knows how to consume the data exposed by the `file` input module when the user has defined a value. Assuming this value is the path to the file, the `image` output module will output an `<image />` html element whose source is the path.

Types can inherit properties from each other. The intention of this feature is to allow for multiple output templates for a particular Type. In the previous version of ToastyCMS, the developer would define both the input and output format of a particular attribute. This version decouples this association in order to provide more flexibilility. 

From the above example, a child type can be defined that does not add any new attributes by has a unique Template. In this template instead of using the `image` output module, it uses an output module called `link`. This module takes a value and outputs an `<a></a>` element whose href is the value exposed by the `file` input module. 

I figure this flexibility will enable developers to define html templates, JSON templates, RSS feeds, and more.

##File System
One of the areas for improvement I found in content management systems I have used was in file management. Most CMS platforms rely on the host server's file system, which is sufficent for most installations. One of the benefits of using NodeJS for developing a server application is the cross-platform nature and scaleablity of the application inherited from NodeJS. Relying on the host system's file system limits both of these demensions. 

To try and earn back these core benefits provided by NodeJS, ToastyCMS uses MongoDB's GridStore as it's filesytem. An API that has the ability to add and remove files, organize file into directories, and define permissions to control access has been implemented.

I figure that developers will not have to worry about where to store files and manage their permissions in the context of a traditional file system while deploying their application anywhere. 

The tradeoff here is this increases the coupling of this ToastyCMS and MongoDB, which means the likely hood of being able to hook in a different database system may become architecturally unfeasible. 
