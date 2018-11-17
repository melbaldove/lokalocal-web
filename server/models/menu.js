'use strict';

module.exports = function(Menu) {
  Menu.afterRemote('find', (ctx, model, next) => {
    let { draw } = ctx.req.query;

    if (draw) {
      return Menu.count(ctx.args.filter.where)
        .then(totalCount => {
          ctx.result = {
            total: totalCount,
            data: model,
          };
        })
    }

    next();
  });
};
