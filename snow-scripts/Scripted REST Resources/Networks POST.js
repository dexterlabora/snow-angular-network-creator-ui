(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

  try {
    var r = new sn_ws.RESTMessageV2('x_170302_global.Networks', 'POST');
    r.setRequestHeader('Content-Type', 'application/json');
    // copy user supplied data and forward to API call
    var requestBody = request.body;
    var requestData = {};
    requestData = requestBody.data;
    r.setRequestBody(JSON.stringify(requestData));

    // send API call
    var res = r.execute();
    var httpStatus = res.getStatusCode(); // FYI
    var responseBody = res.getBody();

    // return API call results
    return JSON.parse(responseBody); 

  }
  catch (ex) {
    // handle error
    return ex;
  }

})(request, response);