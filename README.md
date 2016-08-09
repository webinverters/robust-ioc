<!--
@Author: Robustly.io <m0ser>
@Date:   2016-02-27T23:29:51-05:00
@Email:  m0ser@robustly.io
@Last modified by:   m0ser
@Last modified time: 2016-02-27T23:30:28-05:00
@License: Apache-2.0
-->



## Synopsis

Update.
At the top of the file there should be a short introduction and/ or overview that explains **what** the project is. This description should match descriptions added for package managers (Gemspec, package.json, etc.)

## Code Example

Show what the library does as concisely as possible, developers should be able to figure out **how** your project solves their problem by looking at the code example. Make sure the API you are showing off is obvious, and that your code is short and concise.

## Motivation

A short description of the motivation behind the creation and maintenance of the project. This should explain **why** the project exists.

## Installation

Provide code examples and explanations of how to get the project.

## Debugging

If you want to debug this module, pass it a logger that conforms to the "A1 Logging Interface Specification" as the second parameter.

## API Reference

### Initialization

    var ioc = require('robust-ioc')({containerName: 'demo'})

### Registering Stuff

    ioc.singleton('helloMsg', "hello world!")
    ioc.register('hostess', function(helloMsg) { return { sayHello: function() { console.log(helloMsg) } } })

### Demonstration

    var hostess = ioc.get('hostess') // hostess will be injected with helloMsg
    hostess.sayHello()

## Tests

Describe and show how to run the tests with code examples.

## Contributors

Let people know how they can dive into the project, include important links to things like issue trackers, irc, twitter accounts if applicable.

## License

A short snippet describing the license (MIT, Apache, etc.)



# Features

- Conditional module registering (to register one svc for one module, and another svc2 for module2)
ioc.register('dal', require('dal'))
ioc.condition('dal', 'dal2', 'module2')
ioc.register('dal2', require('dal2')).condition({module: 'module2', alias: 'dal'})
