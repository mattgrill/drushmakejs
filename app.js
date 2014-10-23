var express         = require('express'),
    app             = express(),
    logger          = require('morgan'),
    bodyParser      = require('body-parser'),
    dustjs          = require('adaro'),
    _               = require('underscore'),
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
    res
      .set('Content-Type', 'text/plain')
      .send(output);
  });

app.listen(3000);
console.log('listening on 3000');
