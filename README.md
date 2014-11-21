Lincoln Water System's chart
===================

### About
A chart for PBT's Lincoln Water System story.
By Steven Speicher, November 2014


### Requirements

* [Node](http://nodejs.org/)
* [Bower](http://bower.io/)
* [Grunt](http://gruntjs.com/)
* [Sass](http://sass-lang.com/)

### Installation

Install above dependencies

To install grunt tasks from package.json

  	sudo npm install

To install bower components from bower.json

  	bower install

### Usage

Run local server

    grunt serve

Build deployment to `dist` directory

    grunt

Make sure you have a copy of `secrets.json` and run

	grunt stage

to push to the staging url

Deploy the web app with

	grunt deploy

