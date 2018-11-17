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

  router.get('/partners/:partnerId', function(req, res) {
    const Partner = app.models.Partner;

    return Partner.findById(req.params.partnerId)
      .then(partner => res.render('partners-edit', { partner, }))
  });

  router.post('/partners/:partnerId', function(req, res) {
    const Partner = app.models.Partner;

    return Partner.findById(req.params.partnerId)
      .then(currentPartner => {
        return Partner.upsert({
          id: currentPartner.id,
          ...req.body,
        })
      })
      .then(ignore => res.redirect(`/partners/${req.params.partnerId}`))
  });

  app.use(router);
};
