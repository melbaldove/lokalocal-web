'use strict';
const app = require('../server');

module.exports = function(Customer) {
  Customer.registration = (fields) => {
    const Wallet = app.models.Wallet;

    return Wallet.create()
      .then(wallet => {
        return Customer.create({
          lastName: fields.lastName,
          firstName: fields.firstName,
          username: fields.username,
          passwd: fields.password,
          qrId: wallet.loftCardNumber,
        })
        .catch(err => {
          return Wallet.destroyById(wallet.id)
            .then(ignore => {
              return Promise.reject({
                status: 500,
                message: err,
              })
            })
        })
      })
  };

  Customer.remoteMethod('registration', {
    http: {path: '/register', verb: 'post'},
    accepts: [
      {arg: 'fields', type: 'object', required: true, http: {source: 'body'}},
    ],
    returns: {root: true, type: 'object'},
  });

  Customer.byQRid = (qrId) => {
    const Customer = app.models.Customer;

    return Customer.find({ where: {qrId: qrId}})
      .then(customers => {
        if (customers.length == 1) {
          return customers[0];
        }

        return {
          lastName: "unregistered",
        }
      })
  };

  Customer.remoteMethod('byQRid', {
    http: {path: '/byQrid', verb: 'get'},
    accepts: [
      {arg: 'qrId', type: 'string', required: true, http: {source: 'query'}},
    ],
    returns: {root: true, type: 'object'},
  });
};
