setTimeout(
  () => console.log('Hi from the callback queue'),
  5000); // Keep the loop alive for this long

const stopTime = Date.now() + 2000;
while (Date.now() < stopTime) {} // Block the main loop

//<---------------------------------------------------

// This takes 7 secs to execute
setTimeout(() => console.log('Ran callback A'), 5000);

const fs = require('fs');
const readFileSync = async (path) => await fs.readFileSync(path);

readFileSync('readme.md').then((data) => console.log(data));
console.log('The event loop continues without blocking...');

//<---------------------------------------------------

// 1. Loop begins, timestamps are updated
const http = require('http');

// 2. The loop remains alive if there is code in the call stack to unwind
// 8. Poll for I/O and execute this callback with incoming connections
const server = http.createServer((req, res) => {
  // Network I/O callback executes immediately after poll
  res.end();
});

// Keep the loop alive if there is an open connection
// 7. If there is nothing left to do, calculate timeout
server.listen(8000);

const options = {
  // Avoid a DNS lookup to stay out of the thread pool
  hostname: '127.0.0.1',
  port: 8000
};

const sendHttpRequest = () => {
  const req = http.request(options, (res) => {
    // Network I/O callbacks run in phase 8
    // File I/O callbacks run in phase 4
    console.log('Response received from the server');

    // 9. Execute check handle callback
    setImmediate(() =>
      // 10. Close callback executes
      server.close(() =>
        // The End. SPOILER ALERT! The Loop dies at the end
        console.log('Closing the server')));
  });
  req.end();
};

// 3. Timer runs in 8 secs, meanwhile the loop is staying alive via a timeout
setTimeout(() => sendHttpRequest(), 8000);

// 11. Iteration ends

//<---------------------------------------------------

fs.readFile('readme.md', () => {
  setTimeout(() => console.log('File I/O callback via setTimeout()'), 0);
  // This callback executes first
  setImmediate(() => console.log('File I/O callback via setImmediate()'));
});

//<---------------------------------------------------

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
