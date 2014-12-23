var express         = require('express'),
    app             = express(),
    logger          = require('morgan'),
    bodyParser      = require('body-parser'),
    dustjs          = require('adaro'),
    _               = require('underscore'),
    https           = require('https'),
    exec            = require('child_process').exec;

app
  .engine('dust', dustjs.dust())
  .set('view engine', 'dust')
  .use(logger('dev'))
  .use(bodyParser.urlencoded({extended: true}))
  .use(bodyParser.json({extended: true}))
  .use(express.static(__dirname + '/public'))
  .get('/modules/:drupal_version?/:module_name', function (req, res){
    exec('`which git` ls-remote http://git.drupal.org/project/' + req.params.module_name + '.git', function(error, stdout, stderr) {
      if (error) {
        return res
                .status(500)
                .send({e:[error,stderr]});
      }
      var refs,
          tags = [];
      refs  = stdout
                .split('\n')
                .filter(function(n){ return n != undefined });
      refs.pop();
      _.each(refs, function (tag) {
        tag = tag.split('\t')[1].split('/')[2];
        if (tag != undefined) {
          if (!req.params.drupal_version || tag.lastIndexOf(req.params.drupal_version, 0) === 0) {
            tags.push(tag.split('^{}')[0]);
          }
        }
      });
      return res.json(tags);
    });
  })
  .get('/drush/:drupal_version?/:module_name', function (req, res) {
    exec('`which drush` rl --format=json ' + req.params.module_name, function (error, stdout, stderr) {
      if (error) {
        return res
                .status(500)
                .send({e:[error,stderr]});
      }

      return res.json(JSON.parse(stdout));

    })
  })
  .get('/name/:module_name', function (req, res) {
    var options = {
        hostname: 'www.drupal.org',
        port: 443,
        path: '/project/' + req.params.module_name,
        method:  'GET'
    };
    var str = '';
    var request = https.request(options, function(result) {
        if (result.statusCode == 200) {
            result.on('data', function(chunk) {
                str += chunk;
            });
            result.on('end', function() {
                var title = str.match(/<h1\b[^>]*>(.*?)<\/h1>/)[1];
                res.send(title);
            });
        }
        else {
            res.send('');
        }
    });
    request.end();
  })
  .get('/', function (req, res) {
    res
      .render('index.dust', {});
  })
  .post('/', function (req, res) {
    var formData    = req.body.makefile;
        output      = '';

    delete formData.modules['|THIS|'];

    output += 'core = ' + formData.version + '.x \n';
    output += 'api = 2 \n';
    output += 'projects[drupal][version] = "' + formData.version + '.x" \n\n'
    output += '; Modules \n\n';
    _.each(formData.modules, function (item, index) {
      output += '; ' + index + '\n';

      output += 'projects[' + index + '][subdir] = "' + formData.opts.contrib_dir + '" \n'
      output += 'projects[' + index + '][version] = "' + item.split(formData.version+'.x-')[1] + '" \n\n'
    });

    delete formData.themes['|THIS|'];
    output += '; Themes \n\n';
    _.each(formData.themes, function (item, index) {
      output += '; ' + index + '\n';

      output += 'projects[' + index + '][version] = "' + item.split(formData.version+'.x-')[1] + '" \n\n'
    });

    delete formData.libs['|THIS|'];
    output += '; Libraries \n\n';
    _.each(formData.libs, function (item, index) {
        if (item.url) {
            output += '; ' + index + '\n';

            output += 'libraries[' + index + '][type] = "' + item.type + '" \n';
            output += 'libraries[' + index + '][url] = "' + item.url + '" \n\n'
        }
    });

    res
      .set('Content-Type', 'text/plain')
      .send(output);
  });

app.listen(process.env.PORT || 3000);
