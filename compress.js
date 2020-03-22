const fs = require("fs");

function compressFiles(fileList) {
  for (let fileName of fileList) {
    let rawData = fs.readFileSync(`${filename}.json`);
    let parsedData = JSON.parse(rawData);
    let fl32Array = Float32Array.from(parsedData);

    fs.open(`${filename}.bin`, "wx", (e, fd) => {
      fs.writeSync(fd, fl32Array);
    });
  }
}
// file reading for consumption in client code
// var reader = new FileReader();

// reader.onload = function () {
// console.log(reader.result);
// };

// reader.readAsArrayBuffer(sourceFile);
