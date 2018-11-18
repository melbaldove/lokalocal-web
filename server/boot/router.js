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
      .then(ignore => res.redirect('/partners'))
      .catch(ignore => res.redirect('/partners'));
  });

  router.get('/partners/login', function(req, res) {
    res.render('partners/login');
  });

  router.get('/partners/overview', function(req, res) {
    const Transaction = app.models.Transaction;

    return Transaction.latestBuy(req.cookies.partner_id)
      .then(transactions => {
        res.render('partners/overview', {
          partnerId: req.cookies.partner_id,
          latestTransactions: transactions,
        });
      })
  });

  router.post('/partners/login', function(req, res) {
    const Partner = app.models.Partner;

    return Partner.login(req.body)
      .then(partner => {
        res.cookie('partner_id', partner.id);
        // res.set('X-Partner-ID', partner.id);
        return res.redirect('/partners/overview');
      })
      .catch(failed => res.redirect('/partners/login'));
  });

  router.get('/partners/logout', function(req, res) {
    res.clearCookie('partner_id');
    res.redirect('/partners/login');
  });

  router.get('/partners/menu', function(req, res) {
    res.render('partners/menu', {
      partnerId: req.cookies.partner_id,
    });
  });

  router.get('/bean', function(req, res) {
    res.render('bean');
  });

  router.get('/bean/new', function(req, res) {
    res.render('bean-new');
  });

  router.get('/bean/:beanId', function(req, res) {
    const Bean = app.models.Bean;

    return Bean.findById(req.params.beanId)
      .then(bean => res.render('bean-edit', {bean, }));
  });

  router.post('/bean/new', function(req, res) {
    const Bean = app.models.Bean;

    return Bean.create(req.body)
      .then(ignore => res.redirect('/bean'))
      .catch(ignore => res.redirect('/bean'));
  });

  router.post('/bean/:beanId', function(req, res) {
    const Bean = app.models.Bean;

    return Bean.findById(req.params.beanId)
      .then(bean => {
        console.log(req);
        if (bean) {
          bean.beanName = req.body.beanName;
          bean.beanCode = req.body.beanCode;

          return Bean.upsert(bean)
            .then(ignore => res.redirect(`/bean/${req.params.beanId}`))
        }
      });
  });

  router.get('/partners/:partnerId', function(req, res) {
    const Partner = app.models.Partner;

    return Partner.findById(req.params.partnerId)
      .then(partner => res.render('partners-edit', { partner, }))
  });


  router.post('/partners/menu', function(req, res) {
    const Menu = app.models.Menu;

    return Menu.create({
      ...req.body,
      partnerId: req.cookies.partner_id,
    })
      .then(menu => res.redirect('/partners/menu'))
      .catch(err => {
        console.log(err);
        res.redirect('/partners/menu/new')
      })
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
      .catch(err => {
        console.log(err);
        res.redirect(`/partners/${req.params.partnerId}`)
      })
  });

  router.get('/partners/menu/new', function(req, res) {
    res.render('partners/menu-new', {
      partnerId: req.cookies.partner_id,
    });
  });

  router.get('/partners/menu/:menuId', function(req, res) {
    const Menu = app.models.Menu;

    return Menu.findById(req.params.menuId)
      .then(menu => res.render('partners/menu-edit', { menu, partnerId: req.cookies.partner_id,}))
  });

  router.post('/partners/menu/:menuId', function(req, res)  {
    const Menu = app.models.Menu;

    return Menu.findById(req.params.menuId)
      .then(menu => {
        menu.itemCode = req.body.itemCode;
        menu.itemName = req.body.itemName;
        menu.itemPath = req.body.itemPath;
        menu.coffeeNeeded = req.body.coffeeNeeded;
        menu.price = req.body.price;
        menu.partnerId = req.cookies.partner_id;
        return Menu.upsert(menu)
          .then(ignore => res.redirect(`/partners/menu/${req.params.menuId}`));
      })
  });

  app.use(router);
};
