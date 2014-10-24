# Drush Make, from Node.js?

Obviously, huge thanks to [@rupl](https://github.com/rupl) for the original idea, all of the front-end, the list of modules, the css.

Actually, everything except for this Node.js code.

## Running this.

You'll need to run this from a location that has access to your `git` binary. You can alter this, by replacing `` `which git` `` with the path to your Git binary. The `/modules` route accepts a drupal version in `X.x` format, and then a module name, as it would appear on drupal.org. The Drupal version is optional; if left out, all versions of the module are returned.

* /modules/7.x/views

Each select list is populated with the versions at select time.

## Release Notes.

1.0.1 - Adding suppot for getting module information with `drush pm-releases`. Drupal version is now optional on the `/modules` route. Some semblance of error handling; check for `e` in the response object for a detailed response of what happened. Started keeping track of what I'm doing.

1.0.0 - Initial Commit
