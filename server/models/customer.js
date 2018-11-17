'use strict';
const app = require('../server');

module.exports = function(Customer) {
  Customer.registration = (fields) => {
    const Wallet = app.models.Wallet;

    return Wallet.find({ where:{ loftCardNumber: fields.qrId }})
      .then(wallets => {
        if (wallets.length == 0) {
          return Promise.reject({
            status: 400,
            message: "Invalid credit",
          })
        }
        return Customer.create({
          lastName: fields.lastName,
          firstName: fields.firstName,
          username: fields.username,
          passwd: fields.password,
          qrId: fields.qrId,
        });
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

  Customer.login = (fields) => {
    const {username, password } = fields;
    return Customer.find({ where: {and: [{username: username}, {passwd: password},]}})
      .then(customer => {
        if (customer.length === 0) {
          return Promise.reject({
            status: 500,
            message: "Username and/or password is incorrect."
          })
        }

        return { qrId: customer[0].qrId };
      })

  };

  Customer.remoteMethod('login', {
    http: {path: '/login', verb: 'post'},
    accepts: [
      {arg: 'fields', type: 'object', required: true, http: {source: 'body'}},
    ],
    returns: {root: true, type: 'object'},
  });
};
