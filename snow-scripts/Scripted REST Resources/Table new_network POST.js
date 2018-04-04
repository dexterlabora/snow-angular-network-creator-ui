(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {

        // Copy user request body
        var requestBody = request.body;
        var requestString = requestBody.dataString;
        var requestParsed = {};
        requestParsed = JSON.parse(requestString);
   
        network = requestParsed;


        // Glide Table Logic
        gr = new GlideRecord('u_meraki_cloud');
        gr.addQuery("correlation_id",network.id);
        gr.query();
            if(gr.next()){
                gr.mac_address = network.mac;
                gr.serial_number = network.serial;
                gr.model_id = network.model;
                gr.update();
            } else {
            gr.initialize();	
                gr.mac_address = network.mac;
                gr.serial_number = network.serial;
                gr.correlation_id = network.id;
                gr.model_id = network.model;
                gr.insert();
                
            }
	


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