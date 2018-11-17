'use strict';

module.exports = function(app) {
  var router = app.loopback.Router();

  router.get('/overview', function(req, res) {
    res.render('overview');
  });

  router.get('/partners', function(req, res) {
    res.render('partners');
  });

  router.get('/partners/new', function(req, res) {
    res.render('partners-new');
  });

  router.post('/partners/new', function(req, res) {
    const Partner = app.models.Partner;

    return Partner.create(req.body)
      .then(ignore => res.redirect('/partners'));
  });

  app.use(router);
};
