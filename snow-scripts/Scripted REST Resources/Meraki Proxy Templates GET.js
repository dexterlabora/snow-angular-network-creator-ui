(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var apiKey = "2f301bccd61b6c642d250cd3f76e5eb66ebd170f"; // Sandbox, hard coded for dev
        var baseUrl = "https://api.meraki.com/api/v0";
        var path = request.pathParams;
        var url = baseUrl + "/organizations/" + path.organizationId + '/configTemplates';

        // API call
        var req = new sn_ws.RESTMessageV2();
        req.setHttpMethod("get");  
        req.setRequestHeader("X-Cisco-Meraki-API-Key", apiKey);
        req.setEndpoint(url);        
        var res = req.execute();

        // Response data
        var httpStatus = res.getStatusCode(); // FYI
        var resBody = res.getBody();
        
        // return API call results
        var parsed = JSON.parse(resBody)
        return parsed; 
    }
    catch (ex) {
        // handle error
        return ex;
    }
})(request, response);