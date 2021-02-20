const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const open = require("open")
const fs = require("fs")
const playlist = JSON.parse(fs.readFileSync("./playlist.json"))
for (const songId in playlist) {
  if (typeof playlist[songId] !== "string") {
    if (typeof playlist[songId] === "object") {
      if (playlist[songId].name === undefined || playlist[songId].url === undefined) throw new Error('Songs must be an url as string or a object of {"name": "Happy birthday", "url": "https://www.youtube.com/watch?v=fTbEpGZyseA"}')
    }
    else throw new Error('Songs must be an url as string or a object of {"name": "Happy birthday", "url": "https://www.youtube.com/watch?v=fTbEpGZyseA"}')
  }
}



const run = {
  state: {
    rdy: "Ready for input"
  },
  UID(id) {
    console.log("read card id: \"" + id + "\"")
    const song = playlist[id]
    if (song !== undefined) {
      if (typeof song === "string") {
        console.log("Opening song url: " + song)
        open(song)
      }
      else {
        console.log("Opening song " + song.name)
        open(song.url)
      }
      
      
    }
    else console.log("")
  }
}





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

