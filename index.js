setTimeout(
  () => console.log('Hi from the callback queue'),
  5000); // Keep the loop alive for this long

const stopTime = Date.now() + 2000;
while (Date.now() < stopTime) {} // Block the main loop

// This takes 7 secs to execute
setTimeout(() => console.log('Ran callback A'), 5000);

const fs = require('fs');
const readFileSync = async (path) => await fs.readFileSync(path);

readFileSync('readme.md').then((data) => console.log(data));
console.log('The event loop continues without blocking...');

// Loop begins, timestamps are updated
const http = require('http');

// The loop remains alive if there is code in the call stack to unwind
// Poll for I/O and execute this callback with incomming connections
const server = http.createServer((req, res) => {
  // I/O callback executes
  res.end();
});

// Keep the loop alive if there is an open connection
// If there is nothing left to do, keep loop alive and calculate timeout
server.listen(8000);

const options = {
  // Avoid a DNS lookup to stay out of the thread pool
  hostname: '127.0.0.1',
  port: 8000
};

const sendHttpRequest = () => {
  const req = http.request(options, (res) => {
    console.log('Response received from server');

    // Execute check handle callback
    setImmediate(() =>
      // Close callback executes
      server.close(() =>
        console.log('Closing the server')));
  });
  req.end();
  // The End. SPOILER ALERT! The Loop dies at the end
};

// Timer runs in 8 secs, meanwhile the loop is staying alive via a timeout
setTimeout(() => sendHttpRequest(), 8000);

const EventEmitter = require('events');

class ImpatientEmitter extends EventEmitter {
  constructor() {
    super();

    // Fire this at the end of the phase with an unwound call stack
    process.nextTick(() => this.emit('event'));
  }
}

const emitter = new ImpatientEmitter();
emitter.on('event', () => console.log('An impatient event occurred!'));
