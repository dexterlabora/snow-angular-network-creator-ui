(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {

        // Copy user request body
        var requestBody = request.body;
        var requestString = requestBody.dataString;
        var requestParsed = {};
        requestParsed = JSON.parse(requestString);
   

        // Glide Table Logic
    

        // send data back to client
        return {
            message: "Table Updated",
            userData: requestParsed
        }; 

    

    }
    catch (ex) {
        // handle error
        return ex;
    }
})(request, response);