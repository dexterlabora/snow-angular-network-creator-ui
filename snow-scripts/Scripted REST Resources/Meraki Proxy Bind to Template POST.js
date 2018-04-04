(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var apiKey = "2f301bccd61b6c642d250cd3f76e5eb66ebd170f"; // Sandbox, hard coded for dev
        var baseUrl = "https://n149.meraki.com/api/v0"; // Hard coded shard number
        var path = request.pathParams;
        // https://{{shard}}.meraki.com/api/v0/networks/{{networkId}}/bind
        var url = baseUrl + "/networks/" + path.networkId + '/bind';
        

        // API call options
        var req = new sn_ws.RESTMessageV2();
        req.setHttpMethod("post");  
        req.setRequestHeader("X-Cisco-Meraki-API-Key", apiKey);
        req.setRequestHeader("Content-Type", "application/json");
        req.setEndpoint(url); 

        // Copy user request body to Meraki API

        var requestBody = request.body;
        var requestString = requestBody.dataString;
        var requestParsed = {};
        requestParsed = JSON.parse(requestString);
        req.setRequestBody(requestString);    

        // Call API
        var res = req.execute();

        // Response data
        var httpStatus = res.getStatusCode(); // FYI
        var httpResponseContentType = res.getHeader('Content-Type');
        var resBody = res.getBody();

        // Check if body is JSON or a string
        var resBodyFinal;
        try { 
            var parsedBody = JSON.parse(resBody);
            resBodyFinal = parsedBody;
        } catch (ex) { 
            resBodyFinal = resBody;
        }

        return resBodyFinal;

    

        // Return API call results
        /*
        if(typeof resBody === 'object'){
            return JSON.parse(resBody);
        }else{
            return resBody;
        }
        */
        
        /*
        if (httpStatus == 200 && httpResponseContentType == 'application/json') {
            return JSON.parse(resBody); 
        }else{
            return resBody;
        }
        */

    }
    catch (ex) {
        // handle error
        return ex;
    }
})(request, response);