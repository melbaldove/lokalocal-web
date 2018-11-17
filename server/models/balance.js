'use strict';
const app = require('../server');

module.exports = function(Balance) {
  Balance.getBalanceByCardNumber = (qrId) => {
    const Wallet = app.models.Wallet;

    return Wallet.find({ where: {loftCardNumber: qrId}})
      .then(wallets => Balance.findById(wallets[0].id))
  };

  Balance.remoteMethod('getBalanceByCardNumber', {
    http: {path: '/byCardNumber', verb: 'get'},
    accepts: [
      {arg: 'qrId', type: 'string', required: true, http: {source: 'query'}},
    ],
    returns: {root: true, type: 'object'},
  });
};
