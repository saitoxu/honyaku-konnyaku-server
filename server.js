const http = require('http');
const fs = require('fs');
const phantom = require('phantom');
const cheerio = require('cheerio');
const urlPrefix = 'https://translate.google.co.jp/?hl=ja#ja/en/';

http.createServer(function(request, response) {
  const headers = request.headers;
  const method = request.method;
  const url = request.url;
  const text = url.split('?')[1].replace('text=','');
  const address = `${urlPrefix}${text}`;

  request.on('error', function(err) {
    console.error(err);
  }).on('data', function(chunk) {
  }).on('end', function() {
    let phInstance, sitepage;

    response.on('error', function(err) {
      console.error(err);
    });

    phantom.create()
    .then(instance => {
      phInstance = instance;
      return instance.createPage();
    })
    .then(page => {
        sitepage = page;
        return page.open(address);
    })
    .then(status => {
        console.log(status);
        return sitepage.property('content');
    })
    .then(content => {
        const $ = cheerio.load(content);
        const result = $('span#result_box').html().replace(/<span>|<br>|<\/span>/g,' ').trim();
        response.statusCode = 200;
        response.end(result);
        sitepage.close();
        phInstance.exit();
    });
  });
}).listen(1337);
console.log('server start');
