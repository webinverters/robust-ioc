## Synopsis

Explanation.

## Code Example

Show what the library does as concisely as possible, developers should be able to figure out **how** your project solves their problem by looking at the code example. Make sure the API you are showing off is obvious, and that your code is short and concise.

## Motivation

A short description of the motivation behind the creation and maintenance of the project. This should explain **why** the project exists.

## Installation

Provide code examples and explanations of how to get the project.

## API Reference

### Initialization

    var ioc = require('robust-ioc')({containerName: 'demo'})

### Registering Stuff

    ioc.register('helloMsg', function() { return "hello world!" })
    ioc.register('hostess', function(helloMsg) { return { sayHello: function() { console.log(helloMsg) } } })

### Demonstration

    var hostess = ioc.get('hostess')
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
