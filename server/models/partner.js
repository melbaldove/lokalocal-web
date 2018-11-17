'use strict';
// const Promise = require('bluebird');
const Rx = require('rxjs/Rx');
const SALT_WORK_FACTOR = 10;
const crypto = require('crypto');
const app = require('../server');
// bcrypt's max length is 72 bytes;
const MAX_PASSWORD_LENGTH = 72;
const bcrypt = require('bcryptjs');

module.exports = function(Partner) {
  Partner.afterRemote('find', (ctx, model, next) => {
    let { draw } = ctx.req.query;

    if (draw) {
      return Partner.count(ctx.args.filter.where)
        .then(totalCount => {
          ctx.result = {
            total: totalCount,
            data: model,
          };
        })
    }
    next();
  });

  Partner.register = (fields) => {
    let {
      username,
      password,
    } = fields;

    return Partner.create({
      partnerName: fields.partnerName,
      address: fields.address,
      location: fields.location,
      username: fields.username,
      passwd: hashPassword(fields.passwd),
    })
  }

  const hashPassword = function(plain) {
    let salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    return bcrypt.hashSync(plain, salt);
  };

  const checkPassword = (plain) => {
    return bcrypt.compare(plain, hash);
  };

  Partner.login = ({ username, password }) => {
    console.log(username, password);
    return Partner.find({ where: { username: username }})
      .then(partner => {
        //checkPassword(password, partner.passwd)
        console.log(partner[0].passwd === password, partner[0].passwd, password);
       if (partner[0].passwd === password) {
         return Promise.resolve(partner[0]);
       }

       return Promise.reject(false)
      })
  };

  Partner.buyCoffee = (partnerId, order) => {
    const Menu = app.models.Menu;
    const Balance = app.models.Balance;
    const Wallet = app.models.Wallet;
    const Transaction = app.models.Transaction;

    let {
      items,
      card
    } = order;

    return Rx.Observable.zip(
      Rx.Observable.from(items)
        .flatMap(item => {
          return Menu.find({
            where: {and: [{id: item.itemId}, {partnerId: partnerId}]}
          })
          .then(menuItems => {
            const menuItem = menuItems[0];
            return {
              id: item.itemId,
              itemCode: menuItem.itemCode,
              itemName: menuItem.itemName,
              itemPath: menuItem.itemPath,
              coffeeNeeded: menuItem.coffeeNeeded,
              price: menuItem.price,
              quantity: item.quantity,
            };
          })
        })
        .toArray(),
      Wallet.find({ where: {loftCardNumber: card}})
        .then(wallets => Balance.findById(wallets[0].id)),
      (menuItems, walletBalance) => {
        // let wallet = wallets[0];

        let totalPrice = 0;

        menuItems.forEach(item => {
          totalPrice += item.price * item.quantity;
        });

        if (totalPrice > parseFloat(walletBalance.balance)) {
          return Promise.reject({
            status: 400,
            message: 'Insufficient credit',
          })
        }

        return Transaction.create({
          description: "another sample transaction",
          amount: totalPrice,
          debit: walletBalance.accountId,
          credit: 1,
          partnerId: partnerId,
          order: order,
          createdAt: Date.now(),
        })
      }
    )
      .toPromise();
  };

  Partner.remoteMethod('buyCoffee', {
    http: {path: '/:partnerId/buy', verb: 'post'},
    accepts: [
      {arg: 'partnerId', type: 'string', required: true, http: {source: 'path'}},
      {arg: 'order', type: 'object', required: true, http: {source: 'body'}}
    ],
    returns: {root: true, type: 'object'},
  });

  Partner.menuItemsWithBestSeller = (partnerId) => {
    const Menu = app.models.Menu;
    const Transaction = app.models.Transaction;

    return Transaction.find({ where: { and: [
        {createdAt: {gt: Date.now() - (1000 * 60 * 60 * 24 * 7)}},
        {partnerId: partnerId}
      ]}
    })
    .then(transactions => {
      let items = [].concat.apply([], transactions.map(transaction => transaction.order.items));

      items = items.reduce((result, { itemId, quantity }) => {
        if (!itemId) {
          return result;
        }
        if (!result[itemId]) {
          result[itemId] = {
            itemId,
            quantity: 0,
          }
        }
        result[itemId].quantity += quantity;
        return result;
      }, {})

      let sortedItems = Object.values(items).sort((a, b) => a.quantity - b.quantity);
      return sortedItems;
    })
    .then(sortedItems => {
      return Menu.find({where: {partnerId: partnerId}})
        .then(menuItems => {
          let mostBuy = sortedItems[0];
          return menuItems.map(menuItem => {
            if (mostBuy) {
              if (mostBuy.itemId === menuItem.id) {
                menuItem.tag = ["BEST_SELLER"];
              }
            }
            return menuItem;
          })
        })
    });
  };

  Partner.remoteMethod('menuItemsWithBestSeller', {
    http: {path: '/:partnerId/menu', verb: 'get'},
    accepts: [
      {arg: 'partnerId', type: 'string', required: true, http: {source: 'path'}},
    ],
    returns: {root: true, type: 'object'},
  });
};
