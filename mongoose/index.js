/* eslint-disable */
import axios from 'axios';
import jsonfn from 'json-fn';

function builder(resolver) {
  return new Proxy({}, {
    get(target, key) {
      // models
      return new Proxy({modelName: key}, {
        get(target, key) {
          if (['modelName'].includes(key)) {
            return target[key];
          }
          // models.key
          return function () {
            // models.key.query
            return new Proxy({modelName: this.modelName, chain: [{fn: key, args: [...arguments]}]}, {
              get(target, key) {
                if (['chain', 'modelName'].includes(key)) {
                  return target[key];
                }
                if (key === 'then') {
                  return resolver;
                }
                return function () {
                  target.chain = target.chain || [];
                  target.chain.push({fn: key, args: [...arguments]});
                  return this; // -> this is Proxy not function
                };
              }
            });
          };
        }
      });
    }
  });
}

const ModelsFactory = function(fn) {
  return builder(fn);
}

/* Usage
const models = builder(function (resolve, reject) {
  axios.post(BACKEND_API_ENDPOINTS.MONGOOSE.INTERFACE, jsonfn.clone({name: this.modelName, chain: this.chain}))
    .then(data => {
      if (typeof resolve === 'function') {
        resolve(jsonfn.clone(data.data, true, true));
      }
    }).catch(err => {
    if (typeof reject === 'function') {
      reject(err);
    }
  });
});
*/

export default ModelsFactory;
