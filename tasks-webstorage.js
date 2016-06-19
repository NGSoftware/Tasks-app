// Storage Engine for WebStorage

storageEngine = function(){
	
	var initialized = false;
	
	var initializedObjectStores = {};
	
	function getStorageObject(type){
		var item = localStorage.getItem(type);
		var parsedItem = JSON.parse(item);
		return parsedItem;
	}
	
	function checkInitialization(type,errorCallback){
		if (!initialized){
			errorCallback('storage_api_not_initialized','The storage engine has not been initialized');
		}
		else if (!initializedObjectStores[type]){
			errorCallback('store_not_initialized','The object store ' + type + ' has not been initialized');
		}
	}

	return {
		init: function(successCallback, errorCallback){
			if (window.localStorage){
				initialized = true;
				successCallback(null);
			}
			else{
				errorCallback('storage_api_not_supported','The web storage API is not supported');
			}
			
		}, initObjectStore: function(type,successCallback,errorCallback){
			if(!initialized){
				
				errorCallback('storage_api_not_initialized','The storage engine has not been initialized');
			}
			
			else if(!localStorage.getItem(type)){
			
				localStorage.setItem(type,JSON.stringify({}));
	
			}
			
			initializedObjectStores[type] = true;
			successCallback(null);
			
		}, save: function(type,obj,successCallback,errorCallback){
			
			checkInitialization(type,errorCallback);

			if(!obj.id){
				obj.id = $.now();
			}
			//Need to read the saved data, cause setItem overwrites the values...
			var storageItem = getStorageObject(type);
			storageItem[obj.id] = obj;
			localStorage.setItem(type,JSON.stringify(storageItem));
			successCallback(obj);
			
		}, findAll(type,successCallback,errorCallback){
			
			checkInitialization(type,errorCallback);

			var result = [];
			var storageItem = getStorageObject(type);

			$.each(storageItem,function(i,v){
				result.push(v);
			});
			
			successCallback(result);

		}, delete: function(type,id,successCallback,errorCallback){
			
			checkInitialization(type,errorCallback);

			var storageItem = getStorageObject(type);

			if(storageItem[id]){
				delete storageItem[id];
				localStorage.setItem(type,JSON.stringify(storageItem));
				successCallback(id);
			}
			else{
				errorCallback('object_not_found','The object requested could not be found');
			}
			
		}, findByProperty: function(type,propertyName,propertyValue,successCallback,errorCallback){
			
			checkInitialization(type,errorCallback);

			var result = [];
			var storageItem = getStorageObject(type);

			$.each(storageItem, function(i,v){
				if(v[propertyName]===propertyValue){
					result.push(v);
				}
			});
			
		}, findById: function(type,id,successCallback,errorCallback){
			//errorCallback('not_implemented','This method has not been implemented');

			checkInitialization(type,errorCallback);

			var storageItem = getStorageObject(type);
			var result = storageItem[id];

			successCallback(result);
			
		}
	}
}();