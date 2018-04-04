(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try { 
        var apiKey = "2f301bccd61b6c642d250cd3f76e5eb66ebd170f"; // Sandbox, hard coded for dev
        var baseUrl = "https://api.meraki.com/api/v0";
        var endpoint = request.params.endpoint;
        var query = requesat.query;
        var url = baseUrl+endpoint;
        
        var r = new sn_ws.RESTMessageV2();
        r.setHeader("X-Cisco-Meraki-API-Key", request.headers["x-cisco-meraki-api-key"] || apiKey);
        r.setEndpoint(url);

        if (query){      
            var queryString = "";
            Object.getOwnPropertyNames(query).forEach(
            function (val, idx, array) {
                queryString += (val + '=' + query[val]);
                if (idx < array.length - 1){
                    queryString += "&";
                }
            }
            );
            url = url +"?" + queryString;
        }

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




    // Set Variables
    var apiKey = flow.get('apiKey');
    var baseUrl = flow.get('baseUrl');
    var endpoint = msg.req.params.endpoint
    var query = msg.req.query;


    // API Call
    msg.headers = {
        "X-Cisco-Meraki-API-Key": msg.req.headers["x-cisco-meraki-api-key"] || apiKey
    };
    msg.url = baseUrl + endpoint;

    if (query){
        
        var queryString = ""
        Object.getOwnPropertyNames(query).forEach(
        function (val, idx, array) {
            queryString += (val + '=' + query[val]);
            if (idx < array.length - 1){
                queryString += "&";
            }
        }
        );
        msg.url = msg.url +"?" + queryString;
    }

    return msg;
})(request, response);