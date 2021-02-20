const fs = require("fs")

const charsPerLine = 100
function formatLogTime(formattedLog) {
    const linesToFill = charsPerLine - formattedLog.length
    let fill = ""
    for (let i = 0; i < linesToFill; i++) {
        fill += " "
    }
    return formattedLog + fill + "[" + new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" }) + "]"
}
function formatLog(kind, logs) {
    return "[" + kind + "]: " + logs.join(", ").split("\n").join("\n" + " ".repeat(kind.length))
}
function writeToLogFile(log) {
    fs.appendFileSync("log", log + "\n")
}

function injectFsToLogLevel(level, logLocal = console.log.bind(console)) {
    console[level] = (...logs) => {
        let formattedLog = formatLog(level, logs)
        let formattedLogTime = formatLogTime(formattedLog)
        
        logLocal(formattedLog)
        writeToLogFile(formattedLogTime)
    }
}

module.exports = () => {
    injectFsToLogLevel("log")
    injectFsToLogLevel("warn")
    injectFsToLogLevel("error")
    // injectFsToLogLevel("throw", (e) => {throw e})
}

