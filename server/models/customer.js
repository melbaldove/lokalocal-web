'use strict';
const app = require('../server');

module.exports = function(Customer) {
  Customer.byQRid = (qrId) => {
    const Customer = app.models.Customer;

    return Customer.find({ where: {qrId: qrId}})
      .then(customers => {
        if (customers.length == 1) {
          return customers[0];
        }
      })
  };

  Customer.remoteMethod('byQRid', {
    http: {path: '/byQrid', verb: 'get'},
    accepts: [
      {arg: 'qrId', type: 'string', required: true, http: {source: 'path'}},
    ],
    returns: {root: true, type: 'object'},
  });
};
