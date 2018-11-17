'use strict';

module.exports = function(app) {
  var router = app.loopback.Router();

  router.get('/overview', function(req, res) {
    res.render('overview');
  });

  router.get('/partners', function(req, res) {
    res.render('partners');
  });

  // router.get('/projects', function(req, res) {
  //   res.render('projects');
  // });

  app.use(router);
};
