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
};
