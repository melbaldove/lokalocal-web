'use strict';
const Rx = require('rxjs/Rx');
const app = require('../server');
const Promise = require('bluebird');

module.exports = function(Transaction) {
  Transaction.getSalesVolumeByYear = (year, partnerId) => {
    const months = [...Array(12).keys()];

    return Rx.Observable.from(months)
      .flatMap(month =>{
        return Transaction.find({
          where: {
            and: [
              {createdAt: {gte: new Date(year, month, 1)}},
              {createdAt: {lte: new Date(year, month + 1, 1 - 1)}},
              {partnerId: partnerId}
            ]
          }
        })
        .then(transactions => {
          return {
            month: month,
            amount: transactions.reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
          };
        })
      })
      .toArray()
      .map(monthEarnings => monthEarnings.sort((a, b) => a.month - b.month))
      .toPromise()
  };

  Transaction.remoteMethod('getSalesVolumeByYear', {
    http: {path: '/getSalesVolumeByYear', verb: 'get'},
    accepts: [
      {arg: 'year', type: 'Number', required: true, http: {source: 'query'}},
      {arg: 'partnerId', type: 'string', required: true, http: {source: 'query'}},
    ],
    returns: {root: true, type: 'object'},
  });

  Transaction.getDistributionPerYear = (year) => {
    const Menu = app.models.Menu;
    const months = [...Array(12).keys()];

    return Rx.Observable.from(months)
      .flatMap(month =>{
        return Transaction.find({
          where: {
            and: [
              {createdAt: {gte: new Date(year, month, 1)}},
              {createdAt: {lte: new Date(year, month + 1, 1 - 1)}}
            ]
          }
        })
          .then(transactions => {
            let totalItems = transactions.reduce((acc, curr) => acc.concat(curr.order.items), [])
              .reduce((result, { itemId, quantity }) => {
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
              }, {});
            return Promise.props({
              month: month,
              orders: Promise.map(Object.values(totalItems), ({itemId, quantity}) => {
                return Menu.findById(itemId)
                  .then(menu => ({ name: menu.itemName, quantity: quantity, itemId: menu.itemId }))
              }),
            });
          })
      })
      .toArray()
      .map(monthEarnings => monthEarnings.sort((a, b) => a.month - b.month))
      .toPromise();
  }

  Transaction.remoteMethod('getDistributionPerYear', {
    http: {path: '/getDistributionPerYear', verb: 'get'},
    accepts: [
      {arg: 'year', type: 'Number', required: true, http: {source: 'query'}},
    ],
    returns: {root: true, type: 'object'},
  });

  Transaction.latestBuy = (partnerId) => {
    const Menu = app.models.Menu;
    const Bean = app.models.Bean;

    return Transaction.find({
      where: { partnerId: partnerId },
      order: 'createdAt DESC',
      limit: 5,
    })
      .then(transactions => {
        let orders = transactions.filter(transaction => transaction.order && transaction.order.items)
          .map(transaction => transaction.order.items);
        let uniqueItemOrders = [].concat.apply([], orders)
          .reduce((result, order) => {
            if (!order.itemId) {
              return result;
            }

            if (!result[order.itemId]) {
              result[order.itemId] = {
                itemId: order.itemId,
                quantity: 0
              }
            }

            result[order.itemId].quantity += order.quantity;
            return result;
          }, {})

        return Object.values(uniqueItemOrders);
      })
      .then(orders => {
        return Promise.map(orders, order => {
          // console.log(order);
          return Menu.findById(order.itemId)
            .then(menuItem => {
              return Bean.find({ where:{beanCode:menuItem.bean} })
                .then(beans => {
                  if (beans[0]) {
                    return {
                      itemPath: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgk-WwOEEQKuZFwJCRusZJSzYfg6HfKOMlCrjJ9al7P7SAqr66Wg`,
                      itemName: beans[0].beanName,
                      itemCode: beans[0].beanCode,
                      totalCoffeeBeans: menuItem.coffeeNeeded * order.quantity,
                    };
                  };
                })
            })

            // .then(menuItem => {
            //   return {
            //     itemId: menuItem.itemId,
            //     itemName: menuItem.itemName,
            //     itemPath: menuItem.itemPath,
            //     totalCoffeeBeans: menuItem.coffeeNeeded * order.quantity,
            //   };
            // })
        })
          .then(beans => {
            let uniqueBeans = beans.reduce((result, bean) => {
              if (!bean.itemCode) {
                return result;
              }

              if (!result[bean.itemCode]) {
                result[bean.itemCode] = {
                  itemCode: bean.itemCode,
                  itemPath: bean.itemPath,
                  itemName: bean.itemName,
                  totalCoffeeBeans: 0,
                }
              }

              result[bean.itemCode].totalCoffeeBeans += bean.totalCoffeeBeans;
              return result;
            }, {})

            return Object.values(uniqueBeans);
          })
      })
  };

  Transaction.remoteMethod('latestBuy', {
    http: {path: '/latest-buy', verb: 'get'},
    accepts: [
      {arg: 'partnerId', type: 'string', http: {source: 'query'}},
    ],
    returns: {root: true, type: 'object'},
  });
};
