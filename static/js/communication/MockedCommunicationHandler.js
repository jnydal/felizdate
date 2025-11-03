/**
 * Mocked communication handler.
 * 
 * This is meant to serve for testing purposes,
 * unit testing and other kind of client isolated testing.
 * 
 * @author Jørund Nydal
 */
var CommunicationHandler = new Class({
	Extends: AbstractObject,
	
	getClassName: function() {
		return "CommunicationHandler";
	},
	performAction: function(request) {
		if (!(request instanceof ActionRequest)) {
			throw new Exception("Expected instance of ActionRequest, but was: <" + request + ">.");
		}

		var response;

		switch (request.actionName) {
			case "getRepositoryFolderContent":
			    var folderId = request.getPayload().folderId;
			    var folderContent = MockedServer.getRepositoryFolderContent(folderId);
			    if (folderContent == null) {
			        response = new FailureServerResponse(request, "FOLDER_NOT_FOUND", {message: "Failed to find folder with id: <" + folderId + ">."});
			    } else {
			        response = new ServerResponse(request, folderContent);
			    }
				break;
			default:
			    response = new FailureServerResponse(request, "REQUEST_ERROR", {message: "Action is not known: <" + request.getActionName() + ">."});
		}
		setTimeout(function() {
			this.handleResponse(response);
		}.bind(this), 250);
	},
    handleResponse: function(response) { // this method is expected to be overriden
        if (response instanceof FailureServerResponse) {
            alert("Failed to execute " + response.request.actionName + " action.");
        } else {
            alert("Execution of " + response.request.actionName + " action was successful.");
        }
    }
});


var MockedServer = new function() {
    
    var repositoryData = [
        { id : "0", text : "Main", type : "folder", content : [
                                                                { id : "1", text : "Wizard", type : "wizard" },
                                                                { id : "2", text : "Wizard2", type : "wizard" },
                                                                { id : "3", text : "Wizard3", type : "wizard" },
                                                                { id : "4", text : "other", type : "folder", content : [
                                                                                                                        { id : "5", text : "Wizard4", type : "wizard" },
                                                                                                                        { id : "6", text : "Wizard5", type : "wizard" },
                                                                                                                        { id : "7", text : "Wizard6",  type : "wizard" }
                                                                                                                       ]}
                                                                ]},
        { id : "8", text : "Extra", type : "folder", content : [
                                                                { id : "9", text : "more", type : "folder", content : [
                                                                                                                        { id : "12", text : "Wizard13", type : "wizard" },
                                                                                                                        { id : "13", text : "Wizard14", type : "wizard" },
                                                                                                                        { id : "14", text : "Wizard15",  type : "wizard" }
                                                                                                                       ]},
                                                                { id : "10", text : "Wizard8", type : "wizard" },
                                                                { id : "11", text : "Wizard9",  type : "wizard" }
                                                               ]}
    ];   

    this.getRepositoryFolderContent = function(folderId) {
        if (folderId == null) {
            return toFolderJSON(repositoryData);
        }
        var content = findFolderContent(folderId, repositoryData);
        if (content == null) {
            return null;
        }
        return toFolderJSON(content);
    };
    
    function toFolderJSON(folderContent) {
        var result = [];
        for (var i = 0; i < folderContent.length; i++) {
            var file = folderContent[i];
            var jsonFile = {};
            jsonFile.isFolder = (file.type === "folder");
            jsonFile.id = file.id;
            jsonFile.name = file.text;
            result.push(jsonFile);
        }
        return result;
    }

    function findFolderContent(folderIdToLookFor, folderContent) {
        for (var i = 0; i < folderContent.length; i++) {
            var file = folderContent[i];
            if (file.type === "folder") {
                if (file.id === folderIdToLookFor) {
                    return file.content;
                }
                var content = findFolderContent(folderIdToLookFor, file.content);
                if (content != null) {
                    return content;
                }
            }
        }
        return null;
    }
};
