const express = require('express');
const fs = require('fs');
const extract = require('extract-zip')
const path = require('path');
const fileUpload = require("express-fileupload");

const uploadDir = path.join(__dirname, '/public/obj/');
const extractDir = path.join(__dirname, '/public/obj/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(extractDir)) {
  fs.mkdirSync(extractDir);
}

const server = express();

const extractZip = (file, destination, deleteSource) => {
  extract(file, { dir: destination }, (err) => {
    if (!err) {
      if (deleteSource) fs.unlink(file);
      nestedExtract(destination, extractZip);
      console.error(file);
    } else {
      console.error(err);
    }
  }
  );
};

const nestedExtract = (dir, zipExtractor) => {
  fs.readdirSync(dir).forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isFile()) {
      if (path.extname(file) === '.zip') {
        zipExtractor(path.join(dir, file), dir, true);
      }
    } else {
      nestedExtract(path.join(dir, file), zipExtractor);
    }
  });
};

const getDirectories = (path) => {
    return fs.readdirSync(path).filter(function (file) {
      return fs.statSync(path+'/'+file).isDirectory();
    });
}

server.use(express.static('public'));
server.use(fileUpload());

server.get("/konfigurator", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.get("/konfigurator/models", (req, res) => {
  return res.status(200).send(getDirectories(__dirname + "/public/obj/"));
});

server.post("/konfigurator/upload", (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.files.myFile;
  const extensionName = path.extname(file.name);
  const allowedExtension = ['.zip'];

  if(!allowedExtension.includes(extensionName)){
      return res.status(422).send("Invalid File Format (only .zip allowed)");
  }

  const dirPath = __dirname + "/public/obj/" + file.name;

  file.mv(dirPath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect('/konfigurator');
  });

  extractZip(dirPath, dirPath + "_extract", true);
});

server.listen(8080, (err) => {
  if (err) throw err;
});
