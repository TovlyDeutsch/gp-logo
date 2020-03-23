const fs = require("fs");

fs.readdir("./letter_data", (err, files) => {
  for (let fileName of files) {
    if (fileName.indexOf(".json") !== -1) {
      let rawData = fs.readFileSync(`./letter_data/${fileName}`);
      let parsedData = JSON.parse(rawData);
      let fl32Array = Float32Array.from(parsedData);
      let [fileNameAlone, extension] = fileName.split(".");
      fs.open(`./letter_data/${fileNameAlone}.bin`, "wx", (e, fd) => {
        if (fd) {
          fs.writeSync(fd, fl32Array);
        }
      });
    }
  }
});

// file reading for consumption in client code
// var reader = new FileReader();

// reader.onload = function () {
// console.log(reader.result);
// };

// reader.readAsArrayBuffer(sourceFile);
