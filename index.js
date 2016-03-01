'use strict';

var AJS = require('another-json-schema');

module.exports = function (routerName, schema) {
  var schemaValidator = AJS(routerName, schema);
  return function* jsonschema(next) {
    var res = schemaValidator.validate({
      request: this.request,
      response: this.response,
      params: this.params
    }, { additionalProperties: true });
    if (!res.valid) {
      return this.throw(400, res.error);
    }
    yield next;
  };
};
