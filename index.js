

const run = {
  state: {
    rdy: "Ready for input"
  }
}




const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
try {
  const port = new SerialPort('/dev/ttyACM0', { baudRate: 9600 });
  const parser = port.pipe(new Readline({ delimiter: '\n' }));
  // Read the port data
  port.on("error", (e) => {
    console.log("Unable to open Serial port. Try: \"sudo chmod 666 /dev/ttyACM0\"")
    console.log("Stack: ")
    console.log(e)
  })
  port.on("open", () => {
    console.log('Connection established');
  });
  parser.on('data', rawData => {
    let data
    try {
      data = JSON.parse(rawData)
    }
    catch(e) {
      console.log("Raw: " + rawData)
    }

    function parseRun(data, run, path) {
      for (const key in data) {
        const val = data[key]
        const runVal = run[key]
        if (runVal !== undefined) {
          if (runVal instanceof Function) {
            const r = runVal(val)
            if (r !== undefined) console.log(r)
          }
          else if (typeof runVal === "object") {
            if (typeof val === "object") parseRun(val, runVal, [...path, key])
            else {
              const runValDeep = runVal[val]
              if (runValDeep !== undefined) {
                if (runValDeep instanceof Function) {
                  const r = runVal(val)
                  if (r !== undefined) console.log(r)
                }
                else if (typeof runValDeep === "object") {
                  const p = path.join("/")
                  console.log((p === "" ? "" : p + "/") + key + ": " + val)
                }
                else console.log(runValDeep)
              }
              else {
                const p = path.join("/")
                console.log((p === "" ? "" : p + "/") + key + ": " + val)
              }
            }
          }
          else console.log(runVal)
        }
        else {
          function parseDeep(data, path) {
            for (const key in data) {
              const val = data[key]
              if (typeof val === "object") parseDeep(data, [...path, key])
              else {
                const p = path.join("/")
                console.log((p === "" ? "" : p + "/") + key + ": " + val)
              }
            }
          }
          parseDeep(data, path)
        }
      }
    }
    parseRun(data, run, [])
  });
}
catch(e) {
  console.log("Unknown error occured")
  throw e
}

