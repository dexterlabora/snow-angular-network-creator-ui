(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

     try { 
		 var r = new sn_ws.RESTMessageV2('x_170302_global.Networks', 'GET');
		 var res = r.execute();
		 var responseBody = res.getBody();
		 var httpStatus = res.getStatusCode();	 	 
		 var parsed = JSON.parse(responseBody);		
		 return parsed;
	 }
	catch(ex) {
		// handle error
		return ex;
	}

})(request, response);