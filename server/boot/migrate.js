'use strict';

module.exports = function(server) {
  const ds = server.dataSources.local;

  const appModels = ['menu'];

  // if (!ds.isActual(appModels)) {
  //   ds.autoupdate(appModels, function(err) {
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  // }
  // ds.automigrate();
};

