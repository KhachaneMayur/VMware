/** @module com.avi */

/* VRO ACTION START */
/* id:187255e2-8d52-45ca-9265-58d3ce918797 */
/**
 * @method fetchAVIObject 
 *
 * @param {REST:RESTHost} hostController restHost name
 * @param {string} Tenant Tenant name
 * @param {string} objectName AVI object name
 * @param {string} Version AVI api version
 * @param {string} objectType AVI object type
 * 
 * @return {string}
 */
function fetchAVIObject () {
    /***********************************************************
    *  This action contains a REST GET call to AVI API         *
    *  in order to Get AVI Object details from the controller. *
    ***********************************************************/
    
    
    try{
    	// Check the restHost is selected ot not.
    	if(hostController == null){
    	  return null;
    	}
    
    	// Call the fetchAVIObjectUUID action for get the uuid of AVI object
    	var uuid = "";
    	uuid = System.getModule("com.avi").fetchAVIObjectUUID(hostController,objectType,objectName,Tenant,Version);
    	
    	//Set the REST API for GET request call to fetch AVI object
    	var request = hostController.createRequest("GET", "/api/"+objectType+"/"+uuid);
    	request.setHeader("X-Avi-Tenant",Tenant)
    	request.setHeader("X-Avi-Version",Version)
    	var response = request.execute();
    	var jsonResponse = response.contentAsString;
    
    	// return AVI Object JSON response
    	return jsonResponse
    		
    }catch(e){
    	throw "Error when fetch AVI object --> "+ e
    }
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:16c57aa5-961e-4395-a51d-602ccabff4ed */
/**
 * @method deleteAVIObject 
 *
 * @param {REST:RESTHost} hostController restHost name
 * @param {string} objectType AVI object type
 * @param {string} objectName AVI object name
 * @param {string} Tenant Tenant name
 * 
 * @return {boolean}
 */
function deleteAVIObject () {
    /***********************************************************
    *  This action contains a REST DELETE call to AVI API  *
    *  in order to DELETE a object from AVI controller             *
    ***********************************************************/
    
    try{
    
    	// Check the restHost is seleted or not
    	if(hostController == null){
    	  return null;
    	}	
    	System.log("Starting DELETE action...")
    	System.log("AVIObject Type -->"+ objectType)
    
    	// Set the DELETE request call for DELETE AVI object
    	var request = hostController.createRequest("DELETE", "/api/"+objectType+"/"+objectName)
    	request.setHeader("X-Avi-Tenant",Tenant)
    	var response = request.execute();
    	
    	System.log("ResponseCode ->"+ response.statusCode)
    	System.log("Delete action completed without error.")
    	return true
    }catch (e) {
    	throw "Error when DELETE the object -> "+ e
    }
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:a4eecb4d-767e-460c-a7ab-dfd9855d0c37 */
/**
 * @method updateVirtualService 
 *
 * @param {REST:RESTHost} hostController
 * @param {string} Tenant
 * @param {string} vsName
 * @param {string} Version
 * @param {string} IPAddress
 * @param {string} Name
 * @param {boolean} enabled
 * @param {string} servicePort
 * @param {Array} rollbackList
 * 
 * @return {Array}
 */
function updateVirtualService () {
    /*************************************************************
    * This script initializes Virtual service properties objects *
    * and puts user input into the Virtual service object        *
    * and update the Virtual service object                      *
    **************************************************************/
    
    
    try {
    	// Check the restHost is provided or NOT.
    	if(hostController == null){
    	  return null;
    	}
    	
    	// Trigger the GET request call for fetch AVI object using fetchAVIObject action.
    	previousObject = System.getModule("com.avi").fetchAVIObject(hostController,Tenant,vsName,Version, "virtualservice");
    	System.log("previousAVIObjectVS -> "+ previousObject)
    
    	// Check the rollbackList and push previous AVI object in it.
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(previousObject)
    	
    	// Parse the response into JSON format.
    	var properties = JSON.parse(previousObject)
    		
    	// Set Virtual Service name.
    	if (vsName != Name){
    		properties.name = Name
    	}else{
    		properties.name = vsName
    	}
    
    	
    	// Set the status of virtual service.
    	properties.enabled = enabled
    	
    	// Configuration of virtual service.
    	var vipConfig =	[{
    						"vip_id": "1",
    						"avi_allocated_fip": false,
    						"auto_allocate_ip": false,
    						"enabled": true,
    						"auto_allocate_floating_ip": false,
    						"avi_allocated_vip": false,
    						"auto_allocate_ip_type": "V4_ONLY",
    						"ip_address": {
    							"type": "V4",
    							"addr": IPAddress
    						}
    					}]
    	properties.vip = vipConfig
    	
    	// Add servers details.
    	var services =  [{
    		            "enable_ssl": enabled,
    		            "port_range_end": parseInt(servicePort),
    		            "port": parseInt(servicePort)
    	        	}]	
    	properties.services = services
    	
    	// Convert JSON into string format.
    	configuration = JSON.stringify(properties);	
    
    	// Get uuid of AVI object for UPDATE object
    	var VSUUID = properties.uuid
    
    	// Trigger the PUT request call for UPDATE the AVI object.
    	actionResult = System.getModule("com.avi").updateAVIObject(hostController,"virtualservice",configuration,Version,Tenant,VSUUID);
    	
    	// Check the rollbackList and push updated object in it.
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(actionResult)
    	System.log("RollbackListVS ->"+ rollbackList)
    	return rollbackList
    	
    } catch(e) {
         throw "Error while UPDATE VirtualService: "+ e
    }
    	
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:8c5a8985-6f3e-48d1-988b-d0130938f630 */
/**
 * @method fetchAVIObjectUUID 
 *
 * @param {REST:RESTHost} restHost restHost name
 * @param {string} objectType AVI object type
 * @param {string} objectName AVI object name
 * @param {string} Tenant Tenant name
 * @param {string} Version API version
 * 
 * @return {string}
 */
function fetchAVIObjectUUID () {
    
    /***********************************************************
    *  This action contains a REST GET call to AVI object      *
    *  in order to fetch ID of AVI object from the controller. *
    ***********************************************************/
    
    try{
    	// Check the restHost 
    	if(restHost == null){
    	  return null;
    	}
    	
    	// Set the GET request for fetch uuid of the AVI object
    	var uuid = "";
    	var request = restHost.createRequest("GET", "/api/"+objectType+"?name="+objectName)
    	request.setHeader("X-Avi-Tenant",Tenant)
    	request.setHeader("X-Avi-Version", Version)
    	var response = request.execute();
    	var jsonResponse = response.contentAsString
    	var objectData = JSON.parse(jsonResponse)
    	uuid = objectData.results[0].uuid
    	
    	return uuid
    } catch (e){
    	throw "Error when fetch UUID: "+ (e)
    }
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:c4f6b063-b4c4-46a6-a12d-e997dcf659c7 */
/**
 * @method createVirtualService 
 *
 * @param {string} Name Virtual service name
 * @param {string} IPAddress IP address for virtual service
 * @param {string} poolgroupName Poolgroup name
 * @param {string} ServerCloud Server cloud name
 * @param {string} Tenant Tenant name 
 * @param {string} ApplicationProfile Application profile name 
 * @param {string} servicePort Virtual service port
 * @param {string} SSLCertificate Existing SSL certificate name
 * @param {boolean} SSLCert Use SSL certificate or not
 * @param {string} CertName New SSL certificate name
 * @param {boolean} CreateSSL Check create SSL certificate or not
 * @param {REST:RESTHost} restHost restHost name
 * @param {string} Version AVI api version
 * @param {string} serviceEngine Serviceengine group name
 * @param {boolean} poolOrPoolgroup Create pool or poolgroup
 * @param {string} poolName Newly created pool name
 * @param {string} dataScriptName Datascript name 
 * @param {string} networkProfile Network profile name
 * @param {boolean} vsVIP VS Vip name
 * @param {string} existingVIP Existing Vs Vip name
 * @param {Array} rollbackList List of created AVI objects
 * 
 * @return {Array}
 */
function createVirtualService () {
    /*************************************************************
    * This script initializes Virtual service properties objects *
    * and puts user input into the Virtual service object        *
    * and creates the Virtual service on AVI Controller.         *  
    **************************************************************/
    
    
    try {
    	// Check Certificate and create it
    	var Certificate = SSLCertificate;
    	if (CreateSSL == true) {
    		Certificate = CertName;
    	}
    	
    	// Check the VsVip and create new VsVip if not exists.
    	var name = existingVIP;
    	if (vsVIP == false){
    		name = Name+"_vsvip"
    		// Trigger POST request call for create VsVip using an action.
    		actionResult = System.getModule("com.avi").createVsVIP(restHost,Tenant,name,IPAddress,Version);
    	} 
    	
    	// Check the pool and poolgroup based on user inputs.
    	var poolgroup_ref = "/api/poolgroup?name="+poolgroupName
    	var pool_ref = null
    	if (poolOrPoolgroup != true){
    		poolgroup_ref = null
    		pool_ref = "/api/pool?name="+poolName
    	}
    	
    	// Set the service Engine  reference.
    	var serviceEngine_ref = null;
    	var analyticsProfile_ref = null;
    	if ( serviceEngine != null){
    		serviceEngine_ref = "/api/serviceenginegroup?name="+serviceEngine
    		analyticsProfile_ref  = "/api/analyticsprofile?name=System-Analytics-Profile"
    	}
    	
    	// Form a load balancer alogorithm type based on user input
    	var AppProfile = "System-HTTP";
    	var ssl = false;
        var ssl_profile_ref = null;
    	var ssl_key_and_certificate_refs = null;
    	if (ApplicationProfile == "HTTPS" || SSLCert == true ) {
    		AppProfile= "System-Secure-HTTP";
    		ssl = true
    		ssl_profile_ref = "/api/sslprofile?name=System-Standard";
    		ssl_key_and_certificate_refs = [ "/api/sslkeyandcertificate/?name="+Certificate ];		
    	}	
    
    	
    	// Set the configuration for virtual service.
    	configuration = {
        "vsvip_ref": "/api/vsvip?name="+name,
    	"cloud_ref":"/api/cloud?name="+ServerCloud,
    	"tenant_ref":"/api/tenant?name="+Tenant,
    	"pool_group_ref": poolgroup_ref,
    	"pool_ref": pool_ref,
    	"application_profile_ref": "/api/applicationprofile?name="+AppProfile,
    	"se_group_ref": serviceEngine_ref,
    	"analytics_profile_ref": analyticsProfile_ref,
    	"network_profile_ref": "/api/networkprofile?name="+networkProfile,
    	"name": Name, 
    	"fqdn": "production_vs.prod.corp",
    	"ssl_profile_ref": ssl_profile_ref,
    	"ssl_key_and_certificate_refs": ssl_key_and_certificate_refs,
    	"services": [
    	        {
    	            "enable_ssl": ssl,
    	            "port_range_end": servicePort,
    	            "port": servicePort
    	        }
    	    ]
    	}
    	// Add datascript if selected.
    	if (dataScriptName != "" ){
    		configuration.vs_datascripts =  [{
    							"index": 1,
    							"vs_datascript_set_ref": "/api/vsdatascriptset?name="+ dataScriptName
    						  }]
        }
    
    	configuration = JSON.stringify(configuration);
    	System.log("VSData ->"+ configuration);
    		
    	// Call the createAVIObject action and set the POST call for create AVI object
    	actionResult = System.getModule("com.avi").createAVIObject(restHost,"virtualservice",configuration,Version,Tenant,Name);
    	
    	//Check the rollbackList is NULL or NOT 
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(actionResult)
    	
    	System.log("createVirtualService -> "+ rollbackList)
    	return rollbackList
    	
    } catch(e) {
         throw "Error while create VS: "+ e
    }
    	
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:06a1eac5-0208-44f8-913a-301bf8dca83c */
/**
 * @method fetchAPIVersion 
 *
 * @param {REST:RESTHost} hostController restHost name
 * 
 * @return {string}
 */
function fetchAPIVersion () {
    /***********************************************************
    *  This action contains a REST GET call to AVI API         *
    *  in order to Get AVI API Version from the controller     *
    ***********************************************************/
    
    
    try{
    	// Set the AVI API static version 
    	var version = "18.2.3"
    	
    	return version
    
    }catch(e){
    	throw "Error when fetch API version: "+ e
    }
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:71be7905-2d77-4b8a-a9b7-295ec0f9c7d4 */
/**
 * @method updateRollBack 
 *
 * @param {REST:RESTHost} restHost
 * @param {Array} objectList
 * @param {string} Tenant
 * @param {string} Version
 * 
 * @return {string}
 */
function updateRollBack () {
    /***********************************************************
    *  This action handles the update roolback                 *
    *  in order to update the AVI object with old object,      *
    *  if fails in any points.                                  *
    ***********************************************************/
    
    try{
    	// Check the restHost is provided or NOT.
    	if(restHost == null){
    	  return null;
    	}
    	System.log("Starting RollBack Action...")
    
    	// This block is iterate list of AVI object for UPDATE object	
    	for (i = objectList.length-1; i >= 0 ; i--){
    		var jsonData = JSON.parse(objectList[i])
    		// remove the last_modified of JSON for update object
    		delete jsonData["_last_modified"]
    		var urlArray = jsonData.url.split("/")
    		var objectUUID = jsonData.uuid
    		// Trigger UPDATE request call for UPDATE AVI object
    		actionResult = System.getModule("com.avi").updateAVIObject(restHost,urlArray[urlArray.length-2],JSON.stringify(jsonData),Version,Tenant, objectUUID);
    	
    	}
    	return actionResult;
    }catch (e) {
    	throw "Error in updateRoolBack -> "+ e
    }
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:2f8e50bf-89ca-47e8-8870-f9d7058c8b9f */
/**
 * @method readvROResourceElements 
 *
 * @param {string} keyName Key name of default value 
 * @param {string} appProfile Name of Application Profile 
 * @param {ResourceElement} resourceElement Resource element
 * 
 * @return {Any}
 */
function readvROResourceElements () {
    /************************************************************
    * This script fetch default values from resource element    *
    * and puts values as default value into workflow parameters.*
    *************************************************************/
    
    try{
    	// Initilize variable for JSON data of resource element
    	var jsonData = ""
    
    	// Check the resource element or application profile based on user inputs
    	if (resourceElement != null){
    		contentMime = resourceElement.getContentAsMimeAttachment();
    		contentText = contentMime.content
    		jsonData = JSON.parse(contentText)
    	}else{
    		// Check the application profile name
    		// and set the resource element file name based on application profile
    		resourceName = "avi-default-"+ appProfile.toLowerCase() + ".txt"
    		resourcePath = "Library/AviNetworks"
    	
    		//Call an action to get content from resource element based on name(user inputs).
    		resourceContent = getResourceElementContent(resourcePath,resourceName);
    		// Check the resource element is exists or NOT
    		// If NOT then set the default resource element.
    		if (resourceContent != null){
    			jsonData = JSON.parse(resourceContent)
    		}else{
    			resourceName = "avi-default.txt"
    			actionResult = getResourceElementContent(resourcePath,resourceName);
    			jsonData = JSON.parse(actionResult)
    		}
    	}
    	// Check the provided key based on users input.
    	if (keyName != null){
    		var keyDetails = jsonData[keyName]
    	}else{
    		return jsonData
    	}
    	
    	// return value of key which is provided by user.
    	System.log("Result ->"+ keyDetails)
    	return keyDetails
    	
    } catch (e) {
    	throw "Error while fetch default value: " +e
    }
    
    // Create a function for get resource element content.
    function getResourceElementContent(resourcePath, resourceName){
    	// Set the Path of resource element
    	var category = Server.getResourceElementCategoryWithPath(resourcePath);
    	
    	// Get the content from resource element based on resource name
    	for each (var resourceElement in category.resourceElements) 
    	{
    		if (resourceElement.name == resourceName) 
    		{
    			return resourceElement.getContentAsMimeAttachment().content;
    		}
    	}
    	return null;
    }
    
    
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:cec10d48-c906-40b9-a55d-7b8ee38af567 */
/**
 * @method validateResources 
 *
 * @param {REST:RESTHost} restHost
 * @param {string} sslCertName
 * @param {string} Tenant
 * @param {string} Version
 * @param {string} hmName
 * @param {string} poolName
 * @param {string} poolGroupName
 * @param {string} vsName
 * 
 * @return {boolean}
 */
function validateResources () {
    /**************************************************************
    *  This action contains a REST GET call to AVI API            *
    *  in order to check AVI objects are exists on AVI controller.*
    **************************************************************/
    
    try {
    	// Check the restHost os provided or NOT.
    	if (restHost == null){
    		return null;
    	}
    
    	// Create an Array for get all AVI object name for check existing AVI object.
    	var objectArray = [["healthmonitor", hmName],["pool",poolName],["poolgroup",poolGroupName],["sslkeyandcertificate", sslCertName],["virtualservice", vsName]]
    	
    	// Trigger the GET request call for check existing AVI object based on NAME.
    	for (i=0; i<=objectArray.length-1; i++){
    		var request = restHost.createRequest("GET", "/api/"+objectArray[i][0]+"?name="+objectArray[i][1])
    		request.setHeader("X-Avi-Tenant",Tenant)
    		request.setHeader("X-Avi-Version",Version)
    		var response = request.execute();
    		var result = JSON.parse(response.contentAsString); 
    		if (result.count == 1){
    			throw objectArray[i][1]+ " is already exists."
    		}
    	}
    	return true
    	
    
    } catch (e) {
    	throw (e)
    }
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:0cbeacc4-24e9-4602-b4e8-324ed08b0d25 */
/**
 * @method createAVIObject 
 *
 * @param {REST:RESTHost} restHost resthost name
 * @param {string} objectType AVI object type
 * @param {string} configString AVI object json
 * @param {string} version AVI api version
 * @param {string} Tenant Tenant name 
 * @param {string} objectName AVI object name
 * 
 * @return {string}
 */
function createAVIObject () {
    /***********************************************************
    *  This action contains a REST POST call to AVI API        *
    *  in order to deploy a object on AVI controller           *
    ***********************************************************/
    
    try {
    	// Check the restHost
    	if (restHost == null){
    		return null
    	}
    	System.log("Starting create action...")
    	System.log("AVIObject Type -->"+ objectType)
    	
    	// Create a POST request object
    	var request = restHost.createRequest("POST", "/api/"+objectType, configString)
    	
    	// Set request header type
    	request.contentType = "application/json";
    	request.setHeader("X-Avi-Version", version)
    	request.setHeader("X-Avi-Tenant", Tenant)
    	
    	// Trigger a POST call with JSON string
    	var response = request.execute()
    	if (response.statusCode != 201) {
    		throw response.contentAsString;
    	}
    	System.log("ResponseCode ->"+ response.statusCode)
    	
    	// Create a GET request call which check AVI Object is created or not.
    	System.log("objectTypeSet ->"+ objectType)
    	System.log("objectNameSet ->"+ objectName)
    	var request = restHost.createRequest("GET", "/api/"+ objectType+"?name="+objectName)
    	request.setHeader("X-Avi-Tenant",Tenant)
    	for(var count=0; count<6; count++){
    	    System.sleep(10000);
    	    var response = request.execute();
    	    var result = JSON.parse(response.contentAsString);
    		if (result.count == 1){
    			System.log("CreatedAVIObject ->"+ JSON.stringify(result.results[0]))
    		    return JSON.stringify(result.results[0])
    		}else{
    			return null
    		}
    	}
    	System.log("Create action completed without error.")		
    
    } catch (e) {
    	throw "Error in createAVIObject -> " + e
    }
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:f23b63cd-d6fd-4c33-a449-b3ff7ab84bb1 */
/**
 * @method createPool 
 *
 * @param {REST:RESTHost} restHost restHost name
 * @param {Array/CompositeType(IP:string,Ratio:string,Port:string):AVIServer} PoolServers Pool servers list 
 * @param {boolean} enablePool Pool status
 * @param {boolean} CreateHealthMonitor Check create healthmonitor or not
 * @param {string} poolName Pool name
 * @param {string} defaultServerPort Default server port
 * @param {string} loadBalancerAlgo Pool LB algorithm type
 * @param {string} serverType Server type
 * @param {string} lbConsistentHash Consistent hash data for load balancer algorithm type is consistent hash
 * @param {string} lbCustomHeaderName Custom headers consistent hash type
 * @param {string} ServerCloud Servercloud name
 * @param {string} Tenant Tenant name
 * @param {string} HealthMonitorName New healthmonitor name
 * @param {Array/string} healthMonitor List of existing healthmonitors name
 * @param {string} Version Avi api version
 * @param {string} persistenceProfile Persistence profile name
 * @param {Array} rollbackList List for created AVI objects
 * 
 * @return {Array}
 */
function createPool () {
    /**************************************************
    * This script initializes pool properties objects *
    * and creats pool object. 						  *
    **************************************************/
    
    try{
    
    	// Initialize pool property object
    	var properties = new Object();
    	
    	// Set the healthmonitor details bassed on user inputs
    	// Check if selected healthmonitor or create new
    	if (CreateHealthMonitor == false){
    		var HM_refs = []
    		for (i=0; i<=healthMonitor.length-1; i++){
    			var HealthMonitor_ref = "/api/healthmonitor?name="+healthMonitor[i]
    			HM_refs.push(HealthMonitor_ref)		
    		}
    		// Set the healthmonitor reference
    		properties.health_monitor_refs = HM_refs
    	}else{
    		properties.health_monitor_refs = [ "/api/healthmonitor?name="+ HealthMonitorName ]
    	}
    	
    	// Form a load balancer alogorithm type based on user input
    	var algorithm = loadBalancerAlgo.toUpperCase();
    	algorithm = "LB_ALGORITHM_"+algorithm.replace(" ", "_");
    	// Set load balancer algorithm in properties
    	properties.lb_algorithm = algorithm;
    	
    	// Set consistent hash data if load balancer algorithm is consistent hash type
    	if (algorithm == "LB_ALGORITHM_CONSISTENT_HASH") {
    		var lbConsistentHashValue = lbConsistentHash.toUpperCase();
    		lbConsistentHashValue = lbConsistentHashValue.split(" ");
    		lbConsistentHashValue = "LB_ALGORITHM_CONSISTENT_HASH_"+lbConsistentHashValue.join("_");
    		properties.lb_algorithm_hash = lbConsistentHashValue;
    		
    		// Set consistent hash header value to pool properties
    		// consistent hash type is custom headers
    		if(lbConsistentHashValue == "LB_ALGORITHM_CONSISTENT_HASH_CUSTOM_HEADER") {
    			properties.lb_algorithm_consistent_hash_hdr = lbCustomHeaderName;
    		}
    	}
    	
    	// Set cloud server
    	properties.cloud_ref = "/api/cloud?name="+ServerCloud;
    	
    	// Set persistence profile 
    	properties.application_persistence_profile_ref = "/api/applicationpersistenceprofile?name="+persistenceProfile;
    	
    	// Set tenant
    	properties.tenant_ref = "/api/tenant?name="+Tenant;
    	
    		
    	// Set defaut port in properties
    	properties.default_server_port = defaultServerPort;
    	
    	// Set pool status
    	properties.enabled = enablePool;	
    	
    	// Set poolname to properties
    	properties.name = poolName;
    	
    	// Initialize server list for get server details from user inputs.
    	var servers = [];
    	
    	// Get the IP, Ratio, ServerType and Port from list of servers and push into JSON.
    	for (index in PoolServers){
    		var IP = PoolServers[index].get("IP");
    		var ratio = PoolServers[index].get("Ratio");
    		var port = PoolServers[index].get("Port");
    		servers[index] = {"ip":{"addr":IP,"type":serverType}, "port":port, "ratio":ratio};
    	}
    	
    	// Set servers object in properties
    	properties.servers = servers;
    		
    	// Convert properties object into JSON string
    	var jsonData = JSON.stringify(properties);	
    	
    	// Call the createAVIObject action for create Object
    	actionResult = System.getModule("com.avi").createAVIObject(restHost,"pool",jsonData,Version,Tenant,poolName);
    	
    	//Check roolbackList is NULL or NOT
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(actionResult)
    	System.log("CreatePOOL ->"+ JSON.stringify(rollbackList))
    
    	return rollbackList
    
    } catch (e) {
    	throw "Error while creating pool object : " +e
    }
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:db265f90-9bc1-44c9-bf9b-98dade3ee6d1 */
/**
 * @method createSSLCertificate 
 *
 * @param {string} CertName SSL certificate name
 * @param {string} SSLAlgorithm SSL algorithm type
 * @param {string} CommonName Common name for SSL certificate
 * @param {string} RSAKeySize RSA key size
 * @param {string} ECKeySize EC key size
 * @param {string} Tenant Tenant name 
 * @param {REST:RESTHost} restHost restHost name
 * @param {string} Version AVI api version
 * @param {Array} rollbackList List of created AVI objects
 * 
 * @return {Array}
 */
function createSSLCertificate () {
    /***********************************************************
    *  This action creates a REST POST call to AVI API         *
    *  in order to create a SSL certificate on AVI controller  *
    ***********************************************************/
    
    try {
    	// Set the algorithm
    	var algorithm = SSLAlgorithm.toUpperCase();
    	algorithm = "SSL_KEY_ALGORITHM_"+algorithm.replace(" ", "_");
    	
    	// Set the RSA key Size for algorithm
    	var key = RSAKeySize.toUpperCase();
    	var keySize = "SSL_KEY_"+key.replace(" ", "_");
    	var key_params = {
    		"rsa_params": {
    			"key_size": keySize,
    			"exponent": 65537
    		},
    		"algorithm": algorithm
    	}
    	if (SSLAlgorithm == "EC") {
    	    key = ECKeySize.toUpperCase();
    		keySize = "SSL_KEY_EC_CURVE_"+key.replace(" ", "_");
    		key_params = {
    			"ec_params": {
    				"curve": keySize
    			},
    			"algorithm": algorithm
    		}
    	}
    		
    
    
    	// Configuration for SSL Certificate 
    	config = {
    		"status": "SSL_CERTIFICATE_FINISHED",
    		"certificate": {
    			"days_until_expire": 365,
    			"expiry_status": "SSL_CERTIFICATE_GOOD",
    			"self_signed": true,
    			"subject": {
    				"common_name": CommonName
    			}
    		},
    		"format": "SSL_PEM",
    		"certificate_base64": true,
    		"key_params": key_params,
    		"type": "SSL_CERTIFICATE_TYPE_VIRTUALSERVICE",
    		"name": CertName
    	}
    	// Convert JSON into string
    	config = JSON.stringify(config);
    	
    	// Call the createAVI action and set the POST call for create AVI Object
    	actionResult = System.getModule("com.avi").createAVIObject(restHost,"sslkeyandcertificate",config,Version,Tenant,CertName);
    	
    	// Check rollbackList is NULL or NOT
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(actionResult)
    	
    	System.log("createSSLCert ->"+ rollbackList)
    	return rollbackList
    	
    } catch (e) {
          throw "Error in creating SSL Certificate ->"+ e
    }
    	
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:4ca95676-fc6f-4d20-8d04-452333d15af1 */
/**
 * @method fetchServerIP 
 *
 * @param {REST:RESTHost} hostController restHost name
 * @param {string} Tenant Tenant name
 * @param {string} servers Selected servers name
 * @param {string} IPGroupName Name of IP group
 * @param {string} PGName PG network name
 * @param {boolean} AddExistingServers Check add existing servers or not
 * 
 * @return {CompositeType(IP:string,Ratio:string,Port:string):AVIServer[]}
 */
function fetchServerIP () {
    /***********************************************************
    *  This action contains a REST GET call to AVI API         *
    *  in order to Get AVI Object details from  controller     *
    ***********************************************************/
    
    
    try{
    	// Check the restHost is added or NOT.
    	if(hostController == null){
    	  return null;
    	}
    	// Check selected server type based on user input.
    	if (servers == "IP Group"){
    		var objectList = new Array();
    		
    		// Set the GET request for fetch IPGroups  from AVI Controller
    		var request = hostController.createRequest("GET", "/api/ipaddrgroup?name="+IPGroupName);
    		request.setHeader("X-Avi-Tenant",Tenant)
    		var response = request.execute();
    		var jsonResponse = response.contentAsString;
    		var objectData = JSON.parse(jsonResponse);
    		
    		// fetch the Ip's from response and push into list.
    		for each(index in objectData.results){
    			for each(ip in index.addrs){
    				var props = new Properties();
    				props.put("IP",ip.addr);
    				props.put("Ratio","1");
    				props.put("Port","");
    				objectList.push(props);
    			}
    		}
    		return objectList;
    		
    	// Get the existing servers from PG Network based on PGName
    	// and return the list of servers from JSON response.
    	}else if(servers == "Select by network" && AddExistingServers == true){
    			var uuid = " ";			
    			var request = hostController.createRequest("GET", "/api/vimgrnwruntime?name="+PGName);
    			request.setHeader("X-Avi-Tenant",Tenant)
    	
    			var response = request.execute();
    			var jsonResponse = response.contentAsString;
    			var objectData = JSON.parse(jsonResponse);
    			uuid = objectData.results[0].uuid
    			
    			// Initialize new Array
    			var listIPs = new Array();
    			// Create the API for fetch Network IP's from the AVI Controller.
    			const API = "?include_name&sort=name&referred_by=vimgrnwruntime%3A"+uuid+"&depth=1&page_size=200&page=1&"
    			
    			// Set the GET request for fetch PGServers from AVI Controller
    			var request = hostController.createRequest("GET", "/api/vimgrvmruntime/"+API);
    			request.setHeader("X-Avi-Tenant",Tenant)
    			var response = request.execute();
    			var jsonResponse = response.contentAsString;
    			var objectData = JSON.parse(jsonResponse);
    
    			for each(index in objectData.results){
    				if (index.connection_state == "connected"){
    					for each(res in index.guest_nic){
    						if (res.connected == true){
    							for each(ip in res.guest_ip){
    								var props2 = new Properties();
    								props2.put("IP",ip.prefix.ip_addr.addr);
    								props2.put("Ratio","1");
    								props2.put("Port","");
    								listIPs.push(props2);
    							}
    						}
    					}
    					continue
    				}
    			}
    			// return List of IP's
    			return listIPs;
    	}
    	
    }catch(e){
    	throw "Error when fetch serverIP-> "+ e
    }
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:1530488e-9c4e-40e3-a426-b27d98fade51 */
/**
 * @method createVsVIP 
 *
 * @param {REST:RESTHost} restHost restHost name
 * @param {string} Tenant Tenant name
 * @param {string} name Vs vip name
 * @param {string} IPAddress Vs vip IP address
 * @param {string} Version AVI api version
 * 
 * @return {string}
 */
function createVsVIP () {
    /************************************************************
    * This action initializes VS_VIP properties objects         *
    * and puts user input into the VS_VIP object        		*
    *************************************************************/
    
    try{
    
    	// Set Configuration for create VsVip
    	var properties = {
    						"tenant_ref": "/api/tenant?name="+Tenant,
    						"name": name,
    						"vip": [
    							{
    								"vip_id": "1",
    								"avi_allocated_fip": false,
    								"auto_allocate_ip": false,
    								"enabled": true,
    								"auto_allocate_floating_ip": false,
    								"avi_allocated_vip": false,
    								"auto_allocate_ip_type": "V4_ONLY",
    								"ip_address": {
    									"type": "V4",
    									"addr": IPAddress
    								}
    							}
    						]
    					}
    					
    	var jsonData = JSON.stringify(properties);
    	
    	//Call create AVI Object Action for create AVI Object 
    	actionResult = System.getModule("com.avi").createAVIObject(restHost,"vsvip",jsonData,Version,Tenant,name) ;
    	
    
    	return actionResult
    
    } catch (e) {
    	throw "Error when create HealthMonitor -> "+ e
    }
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:b4eba505-1532-4fcf-b5aa-009c28b6eac2 */
/**
 * @method rollBackAction 
 *
 * @param {REST:RESTHost} restHost restHost name
 * @param {string} Tenant Tenant name
 * @param {Array} objectList List of all created AVI objects
 * 
 * @return {string}
 */
function rollBackAction () {
    
    /************************************************************
    *  This action handles the update rollback                  *
    *  in order to DELETE the AVI object if fails in any points.*                                  *
    ***********************************************************/
    
    try{
    	// Check the restHost
    	if(restHost == null){
    	  return null;
    	}
    	
    	for (i = objectList.length-1; i >= 0 ; i--){
    		var jsonData = JSON.parse(objectList[i])
    		var urlArray = jsonData.url.split("/")
    		// Call the deleteAVIObject action for DELETE AVI object
    		actionResult = System.getModule("com.avi").deleteAVIObject(restHost,urlArray[urlArray.length-2],urlArray[urlArray.length-1],Tenant);
    		
    	}
    	return null;
    }catch (e){
    	throw "Error when RollBack: "+ e
    }
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:a0cfb117-8b33-4406-a8cf-71489c8f4f53 */
/**
 * @method createHealthmonitor 
 *
 * @param {string} Tenant Tenant name
 * @param {string} monitorType Healthmonitor type 
 * @param {string} HealthMonitorName Healthmonitor name
 * @param {string} Command Command code for  external type healthmonitor
 * @param {string} Request Command code for  UDP type healthmonitor
 * @param {string} DNSData Command code for DNS type healthmonitor
 * @param {Array/string} ResponseCode Respose code for HTTP type healthmonitor
 * @param {Array/string} HTTPSResponse Respose code for HTTPS type healthmonitor
 * @param {REST:RESTHost} restHost resthost name
 * @param {string} Version AVI api version
 * @param {Array} rollbackList List for created AVI objects
 * 
 * @return {Array}
 */
function createHealthmonitor () {
    /************************************************************
    * This action initializes health monitor properties objects *
    * and puts user input into the health monitor object        *
    *************************************************************/
    
    try{
    
    	// Initialize pool property object
    	var properties = new Object();
    	
    	// Check the Response Code 
    	var Response = ""
    	if (monitorType == "HTTP"){
    		Response = ResponseCode
    	}else if(monitorType == "HTTPS"){
    		Response = HTTPSResponse
    	}
    	
    	// Form a Response code for HealthMonitor based on user input
    	for (i=0; i<Response.length; i++) {
    		var code = "HTTP_" + Response[i]
    		Response[i] = code
    		
    	}
    	
    	// Form a load balancer alogorithm type based on user input
    	var type = monitorType.toUpperCase();
    	type = "HEALTH_MONITOR_"+type.replace(" ", "_");
    	if (type == "HEALTH_MONITOR_EXTERNAL") {
    		properties.external_monitor = { "command_code": Command};
    	}else if (type == "HEALTH_MONITOR_UDP") {
    		properties.udp_monitor = { "udp_request": Request};
    	}else if (type == "HEALTH_MONITOR_DNS") {
    		properties.dns_monitor = { "query_name": DNSData };
    	}else if (type == "HEALTH_MONITOR_HTTP") {
    		properties.http_monitor = { "http_response_code": Response };
    	}else if (type == "HEALTH_MONITOR_HTTPS") {
    		properties.https_monitor = { 
    			"ssl_attributes": {
    				"ssl_profile_ref": "/api/sslprofile?name=System-Standard",
    				"ssl_key_and_certificate_ref": "/api/sslkeyandcertificate?name=System-Default-Cert"
    			},
    			"http_response_code": Response 
    		};
    	}
    	// Set load balancer algorithm in properties
    	properties.type = type;
    	
    	// Set tenant reference
    	properties.tenant_ref  = "/api/tenant?name="+Tenant;
    	
    	// Set poolname to properties
    	properties.name = HealthMonitorName;
    		
    	// Convert properties object into JSON string
    	var jsonData = JSON.stringify(properties);
    	
    	//Call create AVI Object Action for create AVI Object 
    	actionResult = System.getModule("com.avi").createAVIObject(restHost,"healthmonitor",jsonData,Version,Tenant,HealthMonitorName) ;
    	
    	// Check the rollbackList 
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(actionResult)
    	
    	System.log("CreatedHMObject ->"+ rollbackList)
    	return rollbackList
    
    } catch (e) {
    	throw "Error when create HealthMonitor -> "+ e
    }
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:3623c988-73b7-46aa-a55e-1056f585380f */
/**
 * @method fetchObjectList 
 *
 * @param {REST:RESTHost} hostController restHost name
 * @param {string} objectType AVI object type
 * @param {string} Tenant Tenant name 
 * @param {string} searchPGNames PG network name 
 * @param {string} Version AVI api version
 * 
 * @return {string[]}
 */
function fetchObjectList () {
    /***********************************************************
    *  This action contains a REST GET call to AVI API         *
    *  in order to Get AVI Object details from  controller     *
    ***********************************************************/
    
    
    try{
    	// Check the restHost.
    	if(hostController == null){
    	  return null;
    	}
    	
    	// Fetch the AVI API version.
    	var version = ""
    	version = System.getModule("com.avi").fetchAPIVersion(hostController);
    	
    	// Initilize the Array.
    	var objectList = new Array();
    	// Set the GET request call for fetch AVI objects name from the AVI controller.
    	var request = hostController.createRequest("GET", "/api/"+objectType);
    	request.setHeader("X-Avi-Tenant",Tenant)
    	request.setHeader("X-Avi-Version", version)
    	var response = request.execute();
    	var jsonResponse = response.contentAsString;
    	var objectData = JSON.parse(jsonResponse);
    	
    	// Push the names which will fetch from response
    	for each(index in objectData.results){
    		objectList.push(index.name);
    	}
    	
    	// Initilize the empty list and return PGName based on users input.
    	var list = []
    	if (searchPGNames == ""){
    		return objectList
    	}else {	
    		for each(index in objectList){
    			var result = index.indexOf(searchPGNames)
    			if(result > -1){
    				list.push(index)
    			}
    		}
    		return list
    	}
    	
    }catch(e){
    	throw "Error when fetch object list --> "+ e
    }
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:1a575dea-6568-47c4-bace-b67a4d72023b */
/**
 * @method updatePoolGroup 
 *
 * @param {REST:RESTHost} hostController restHost name
 * @param {string} Tenant Tenant name
 * @param {string} Version AVI api version
 * @param {string} Poolgroups Existing poolgroup name
 * @param {string} PoolgroupName Poolgroup name for update
 * @param {string} servers Minimum numbers of server for poolgroup
 * @param {Array/string} PGMembers List of added pools to poolgroup
 * @param {string} failActionType Fail action type for poolgroup
 * @param {Array} rollbackList List of created and previous AVI objects
 * @param {string} statusCode Status code for fail action type of poolgroup
 * @param {string} failActionURL Redirect url for fail action type of poolgroup
 * @param {string} statusProtocol Protocol for fail action type of poolgroup
 * 
 * @return {Array}
 */
function updatePoolGroup () {
    /************************************************************
    * This action initializes poolgroup properties objects *
    * and puts user input into the poolgroup object        *
    *************************************************************/
    
    try{
    	// Check the restHost is provided or NOT.
    	if(hostController == null){
    	  return null;
    	}
    	
    	// Trigger GET request for fetch AVI object using fetchAVIObject action.
    	previousResult = System.getModule("com.avi").fetchAVIObject(hostController,Tenant,Poolgroups,Version, "poolgroup");
    	System.log("previousAVIObject -> "+previousResult)
    
    	// Check the rollbackList is NULL and push previous AVI object in it.
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(previousResult)
    
    	// Parse the AVI object into JSON.
    	var properties = JSON.parse(previousResult)
    
    	// Set poolgroup to name
    	if (PoolgroupName != Poolgroups){
    		properties.name = PoolgroupName;
    	}else{
    		properties.name = Poolgroups
    	}
    	
    	
    	// Set the pool members in poolgroup. 
    	var pgmembers =  []
    	// Adding numbers of pools which is provided in list
    	for (i=0; i<PGMembers.length; i++) {
    		var pool_ref = { "pool_ref": "/api/pool?name="+PGMembers[i] }
    		pgmembers.push(pool_ref)		
    	}
    	properties.members = pgmembers
    	
    	// Check the fail action change or Not
    	if (failActionType == "Close Connection") {
    		properties.fail_action = { "type": "FAIL_ACTION_CLOSE_CONN" }
    	}else if (failActionType == "HTTP Redirect"){
    		var status_code = "HTTP_REDIRECT_STATUS_CODE_"+ statusCode
    		var urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(failActionURL);
    		var host = urlParts[1]
    		var path = urlParts[2]
    		properties.fail_action = {
    								    "redirect": {
    										"path": path,
    								        "host": host,
    								        "query": "",
    								        "protocol": statusProtocol,
    								        "status_code": status_code
    								    },
    								    "type": "FAIL_ACTION_HTTP_REDIRECT"
    								 }
    	}
    	
    			
    	// Convert properties object into JSON string
    	var jsonData = JSON.stringify(properties);
    	System.log("poolgroupJSON ->"+ jsonData);
    	
    	// Get the uuid of AVI object for update object
    	var pgUUID = properties.uuid
    	
    	// Trigger the UPDATE request for UPDATE the AVI object using updateAVIObject action.
    	actionResult = System.getModule("com.avi").updateAVIObject(hostController,"poolgroup",jsonData,Version,Tenant,pgUUID);
    	
    	// Check the rollbackList and push the updated AVI Object in it.
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(actionResult)
    	return rollbackList
    
    } catch (e) {
    	throw "Error when UPDATE a Poolgroup: "+ e
    }
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:4e23b9ef-d91c-4980-ba91-e3b9e82c261d */
/**
 * @method fetchObjectFieldValue 
 *
 * @param {string} objectName AVI object name
 * @param {REST:RESTHost} hostController restHost name
 * @param {string} Tenant Tenant name
 * @param {string} field Field name 
 * @param {string} objectType AVI object type
 * 
 * @return {Any}
 */
function fetchObjectFieldValue () {
    /***********************************************************
    *  This action contains a REST GET call to AVI API         *
    *  in order to Get AVI Object from the controller.         *
    ***********************************************************/
    
    
    try{
    	// Check the restHost 
    	if(hostController == null){
    	  return null;
    	}
    	
    	// Get the API version of AVI Controller 
    	var version = ""
    	version = System.getModule("com.avi").fetchAPIVersion(hostController) ;
    	
    	// Call action for fetch UUID of the AVI object
    	var uuid = "";
    	uuid = System.getModule("com.avi").fetchAVIObjectUUID(hostController,objectType,objectName,Tenant,version); 
    	
    	// Set the GET request call for fetch object response from the Controller.
    	var request = hostController.createRequest("GET", "/api/"+objectType+"/"+uuid);
    	request.setHeader("X-Avi-Tenant",Tenant)
    	request.setHeader("X-Avi-Version",version)
    	var response = request.execute();
    	var jsonResponse = response.contentAsString;
    	var objectData = JSON.parse(jsonResponse);
    	// Initialize variable for store value which will fetch from  AVI object based on user input.
    	var fieldValue = objectData[field]
    	
    		
    	if (field == "lb_algorithm"){
    		var lb_algorithm = ""
    		lb_algorithm = fieldValue.slice(13).toLocaleLowerCase().replace("_", " ")
    		
    		return lb_algorithm
    	}
    	if(field == "servers"){
    		var objectList = new Array();
    		for each(index in fieldValue){
    			var serverDetails = new Properties();
    			var Port = index.port == null ? objectData['default_server_port'] : index.port
    			serverDetails.put("IP",index.ip.addr);
    			serverDetails.put("Ratio",index.ratio);
    			serverDetails.put("Port",Port);
    			objectList.push(serverDetails)
    		}
    		
    		return objectList
    	}
    	if(field.indexOf("_refs") > -1){
    		var obj = []
    		for (l=0; l<=fieldValue.length-1; l++){
    			var ref = fieldValue[l].toString().split("/")
    			var refName = System.getModule("com.avi").fetchAVIObjectName(hostController,ref[ref.length-2],ref[ref.length-1],Tenant,version);
    			obj.push(refName)
    		}
    
    		return obj
    	}
    	if (field == "serverType"){
    		var serverType = ""
    		for each(index in fieldValue){
    			serverType.push(index.ip.type)
    		}
    		
    		return serverType
    	}
    	if(field.indexOf("_ref") > -1){
    		var reference = fieldValue.toString().split("/")
    		var referenceName = System.getModule("com.avi").fetchAVIObjectName(hostController,reference[reference.length-2],reference[reference.length-1],Tenant,version);
    		
    		return referenceName
    	}
    	if (field == "vip"){
    		var serverIP = fieldValue[0].ip_address.addr
    		return serverIP
    	}
    	if (field == "services"){
    		var port = fieldValue[0].port
    		return port
    	}
    	if (field == "type"){
    		var typeArray = fieldValue.split("_")
    		var type = typeArray[2]
    		return type
    	}
    	if(field == "members"){
    		var objectList = new Array();
    		for each(index in fieldValue){
    			var reference = index.pool_ref.toString().split("/")
    			var referenceName = System.getModule("com.avi").fetchAVIObjectName(hostController,reference[reference.length-2],reference[reference.length-1],Tenant,version);
    			objectList.push(referenceName)
    		}
    
    		return objectList
    	}
    	if(field == "fail_action"){
    		var type = fieldValue.type
    		if (type == "FAIL_ACTION_HTTP_REDIRECT"){
    			return "HTTP Redirect"
    		}else{
    			return "Close Connection"
    		}
    	}
    	if(field == "status_code"){
    		var result = objectData["fail_action"]
    		var statusCodeType = result.redirect.status_code
    		var statusCode = statusCodeType.split("_")[4]
    		return statusCode
    	}
    	if(field == "protocol"){
    		var result = objectData["fail_action"]
    		var proto = result.redirect.protocol
    		return proto
    	}
    	if(field == "url"){
    		var result = objectData["fail_action"]
    		var url = result.redirect.host+ result.redirect.path
    		return url
    	}
    	
    		
    	return fieldValue
    	
    		
    }catch(e){
    	throw "Error when fetch object by fieldValue: "+ e
    }
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:7e616340-4985-4296-aca0-80f69aa7702e */
/**
 * @method updatePool 
 *
 * @param {string} defaultServerPort Default server port for pool
 * @param {string} poolName Pool name for update
 * @param {string} pools Existing pool name
 * @param {boolean} enabled Pool status
 * @param {string} lbAlgorithm Pool load balancer type
 * @param {string} lbConsistentHash Consistent hash data for load balancer algorithm type is consistent hash
 * @param {string} lbCustomHeaderName Custom header name for load balancer type consistent hash
 * @param {string} serverType Server type
 * @param {Array/CompositeType(IP:string,Ratio:string,Port:string):AVIServer} PoolServers List of pool server IP's
 * @param {REST:RESTHost} hostController restHost name
 * @param {string} Tenant Tenant name
 * @param {string} Version AVI api version
 * @param {Array} rollbackList List of created AVI objeccts
 * @param {Array/string} healthMonitor List of exisitng healthmonitors
 * 
 * @return {Array}
 */
function updatePool () {
    /**************************************************
    * This script fetch AVI Object details            *
    * and update the AVI object.					  *
    **************************************************/
    
    try{
    	// Check the restHost is provided or NOT.
    	if(hostController == null){
    	  return null;
    	}
    	
    	// Trigger the GET call for fetch AVI object using fetchAVI Object action.
    	previousResult = System.getModule("com.avi").fetchAVIObject(hostController,Tenant,pools,Version, "pool");
    
    	System.log("previousAVIObject -> "+previousResult)
    	// Check the rollbackList is NULL or NOT
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(previousResult)
    
    	// Parse AVI object for update object based on users input.
    	var properties = JSON.parse(previousResult)
    	
    	// Set defaut port in properties
    	properties.default_server_port = parseInt(defaultServerPort);
    	
    	// Set poolname to properties
    	if (poolName != pools){
    		properties.name = poolName;
    	}else {
    		properties.name = pools;
    	}
    	
    	//pool enabled or not 
    	properties.enabled = enabled
    	
    	// Form a load balancer alogorithm type based on user input
    	var algorithm = lbAlgorithm.toUpperCase();
    	algorithm = "LB_ALGORITHM_"+algorithm.replace(" ", "_");
    	// Set load balancer algorithm in properties
    	properties.lb_algorithm = algorithm;
    	
    	// Set consistent hash data if load balancer algorithm is consistent hash type
    	if (algorithm == "LB_ALGORITHM_CONSISTENT_HASH") {
    		var lbConsistentHashValue = lbConsistentHash.toUpperCase();
    		lbConsistentHashValue = lbConsistentHashValue.split(" ");
    		lbConsistentHashValue = "LB_ALGORITHM_CONSISTENT_HASH_"+lbConsistentHashValue.join("_");
    		properties.lb_algorithm_hash = lbConsistentHashValue;
    		
    		// Set consistent hash header value to pool properties
    		// consistent hash type is custom headers
    		if(lbConsistentHashValue == "LB_ALGORITHM_CONSISTENT_HASH_CUSTOM_HEADER") {
    			properties.lb_algorithm_consistent_hash_hdr = lbCustomHeaderName;
    		}
    	}
    	
    	// update the healthmonitors
    	var HM_refs = []
    	for (HM=0; HM<=healthMonitor.length-1; HM++){
    		var HealthMonitor_ref = "/api/healthmonitor?name="+healthMonitor[HM]
    		HM_refs.push(HealthMonitor_ref)		
    	}
    	// Set the healthmonitor reference
    	properties.health_monitor_refs = HM_refs
    	
    	// Initialize server array
    	var servers = [];
    	// Add server object to array based on number of servers added by user
    	for (index in PoolServers){
    		var IP = PoolServers[index].get("IP");
    		var ratio = PoolServers[index].get("Ratio");
    		var port = PoolServers[index].get("Port");
    		servers[index] = {"ip":{"addr":IP,"type":serverType},"port":port, "ratio":ratio};
    	}
    	properties.servers = servers;
    	
    	// Convert properties object into JSON string
    	var json = JSON.stringify(properties);
    
    	var poolUUID = properties.uuid
    	
    	// Trigger UPDATE request call for UPDATE AVI object using updateAVIObject action.
    	actionResult = System.getModule("com.avi").updateAVIObject(hostController,"pool",json,Version,Tenant,poolUUID);
    	
    	// Check the rollbackList and push updated object in it.
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(actionResult)
    	System.log("RollbackList_POOL ->"+ rollbackList)
    	return rollbackList
    
    } catch (e) {
    	throw "Error while updating pool object : " +e
    }
    
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:4fc42776-0ba8-4aa8-a230-e3fe74bf2d74 */
/**
 * @method updateAVIObject 
 *
 * @param {REST:RESTHost} restHost restHost name
 * @param {string} objectType AVI object type
 * @param {string} configString Created AVI object json string
 * @param {string} version AVI api version
 * @param {string} Tenant Tenant name
 * @param {string} objectName AVI object name
 * 
 * @return {string}
 */
function updateAVIObject () {
    /***********************************************************
    *  This action contains a REST POST call to AVI API        *
    *  in order to UPDATE a object on AVI controller           *
    ***********************************************************/
    
    try {
    	// Check the restHost
    	if (restHost == null){
    		return null
    	}
    	System.log("Starting update action...")
    	System.log("AVIObject Type -->"+ objectType)
    	
    	// Create a PUT request call for UPDATE the AVI object
    	var request = restHost.createRequest("PUT", "/api/"+objectType+"/"+objectName, configString)
    	
    	// Set request header type.
    	request.contentType = "application/json";
    	// Set the version of AVI API.
    	request.setHeader("X-Avi-Version", version)
    	// Set the Tenant of controller.
    	request.setHeader("X-Avi-Tenant", Tenant)
    	
    	// Trigger a PUT call with JSON string
    	var response = request.execute()
    	var jsonResponse = response.contentAsString
    	if (response.statusCode != 200) {
    		throw response.contentAsString;
    	}
    	System.log("ResponseCode ->"+ response.statusCode)
    	System.log("UpdatedAVIObject ->"+ jsonResponse)
    	System.log("Update action completed without error.")
    	return jsonResponse		
    
    } catch (e) {
    	throw "Error when update AVI object --> "+e
    }
};
/* VRO ACTION END */


/* VRO ACTION START */
/* id:c790b00a-cb58-44c7-9cdf-2b2c631f3030 */
/**
 * @method createPoolGroup 
 *
 * @param {REST:RESTHost} hostController restHost name
 * @param {string} Tenant Tenant name
 * @param {string} Version AVI api version
 * @param {string} PoolgroupName Poolgroup name
 * @param {string} serverCloud Server cloud
 * @param {string} servers Minimum numbers of servers
 * @param {string} failActionType Poolgroup failaction type
 * @param {boolean} enabled Poolgroup status
 * @param {boolean} CreateHealthMonitor Check create healthmonitor or not
 * @param {string} defaultServerPort Default server port for pool
 * @param {string} loadBalancerAlgo Pool LB algorithm type
 * @param {string} serverType Server type for pool servers
 * @param {string} lbConsistentHash Consistent hash data for load balancer algorithm type is consistent hash
 * @param {string} lbCustomHeaderName Custom header name for consistent type LB algorithm
 * @param {string} HealthMonitorName New heealthmonitor name
 * @param {Array/string} healthMonitor List of existing healthmonitors
 * @param {Array/CompositeType(IP:string,Ratio:string,Port:string):AVIServer} PoolServers List of pool servers
 * @param {string} Name Virtual service name
 * @param {string} persistenceProfile Persistent profile name
 * @param {Array} rollbackList List for created AVI objects
 * @param {string} failActionURL Redirect url for fail action type of poolgroup
 * @param {string} statusCode Status code for  fail action type of poolgroup
 * @param {string} statusProtocol Protocol for fail action type of poolgroup
 * @param {string} newParam
 * 
 * @return {Array}
 */
function createPoolGroup () {
    /************************************************************
    * This action initializes poolgroup properties objects *
    * and puts user input into the poolgroup object        *
    *************************************************************/
    
    try{
    	
    	//Create pools based on numbers server which added into server list.
    	var pools = []
    	for(serverCount=0; serverCount<=PoolServers.length-1; serverCount++) {
    		poolServer = [ PoolServers[serverCount] ]
    		// Set the pool name.
    		var name = Name + "_pool_"+(serverCount+1)
    		pools.push(name)
    		// Trigger the POST call for create pools using an action.
    		poolResult = System.getModule("com.avi").createPool(hostController,poolServer,enabled,CreateHealthMonitor,name,defaultServerPort,loadBalancerAlgo,serverType,lbConsistentHash,lbCustomHeaderName,serverCloud,Tenant,HealthMonitorName,healthMonitor,Version,persistenceProfile);
    		if (rollbackList == null) {
    	    	rollbackList = new Array()
    		}
    		rollbackList.push(poolResult)
    
    	}
    	
    	// Initialize pool property object
    	var properties = new Object();
    	
    	// Set poolgroup name
    	properties.name = PoolgroupName;
    
    	// Set tenant reference
    	properties.tenant_ref = "/api/tenant?name="+Tenant;
    	
    	// Set cloud reference
    	properties.cloud_ref = "/api/cloud?name="+serverCloud;
    	
    	// Set the minimum servers
    	properties.min_servers = servers
    	
    	// Set the pool reference in poolgroup which is created based on servers IP.
    	var pgmembers =  []
    	if (pools != null){
    		for (i=0; i<=pools.length-1; i++) {
    			var pool_ref = { "pool_ref": "/api/pool?name="+pools[i] }
    			pgmembers.push(pool_ref)		
    		}
    		properties.members = pgmembers
    	}else{
    		properties.members = pgmembers
    	}
    		
    	// Fail action type based on user input
    	//FAIL_ACTION_HTTP_REDIRECT
    	if (failActionType == "Close Connection") {
    		properties.fail_action = { "type": "FAIL_ACTION_CLOSE_CONN" }
    	}else if (failActionType == "HTTP Redirect"){
    		var status_code = "HTTP_REDIRECT_STATUS_CODE_"+ statusCode
    		var urlParts = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(failActionURL);
    		var host = urlParts[1]
    		var path = urlParts[2]
    		properties.fail_action = {
    								    "redirect": {
    										"path": path,
    								        "host": host,
    								        "query": "",
    								        "protocol": statusProtocol,
    								        "status_code": status_code
    								    },
    								    "type": "FAIL_ACTION_HTTP_REDIRECT"
    								 }
    	}
    	
    			
    	// Convert properties object into JSON string
    	var jsonData = JSON.stringify(properties);
    	System.log("poolgroupJSON ->"+ jsonData);
    	
    	//Call create AVI Object Action for create AVI Object 
    	actionResult = System.getModule("com.avi").createAVIObject(hostController,"poolgroup",jsonData,Version,Tenant,PoolgroupName);
    	
    	// Check the rollbackList
    	if (rollbackList == null) {
        	rollbackList = new Array()
    	}
    	rollbackList.push(actionResult)
    	
    	System.log("CreatedPoolGroupObject ->"+  rollbackList)
    	return rollbackList
    
    } catch (e) {
    	throw "Error when create poolgroup: "+ e
    }
    
};
/* VRO ACTION END */


