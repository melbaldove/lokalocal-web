'use strict';
const Rx = require('rxjs/Rx');

module.exports = function(Transaction) {
  Transaction.getSalesVolumeByYear = (year) => {
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
    ],
    returns: {root: true, type: 'object'},
  });
};
