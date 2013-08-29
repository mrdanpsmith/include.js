include = {};

include.libraries = {};

include.resolvers = {
	standard: function(name,metadata) {
		return this.url + metadata.path + '/' + metadata.version + '/' + metadata.filename;
	}
};

include.sources = {
	google: {
		url: '//ajax.googleapis.com/ajax/libs/',
		resolver: include.resolvers.standard
	},
	cdnjs: {
		url: '//cdnjs.cloudflare.com/ajax/libs/',
		resolver: include.resolvers.standard
	}
};

include.set = function(needs) {
	return {
		load: function(name) {
			include._load(name);
			this.needs.push(name);
			return this;
		},
		chain: function(name) {
			include._load(name,this.needs);
			this.needs.push(name);
			return this;
		},
		loaded: function(callback) {
			if (include._fulfilled(this.needs)) {
				callback();
			} else {
				include._listen({
					needs: this.needs,
					callback: callback
				});
			}
		},
		needs: needs ? needs.slice(0): new Array()
	};
};

include.loaded = function(name) {
	include._markLoaded(name);
	include._notifyListeners();
};

include._listeners = new Array();

include._load = function(name,needs) {
	if (!needs) {
		needs = include.__metadata(name).needs;
	}
	for (var i = 0; needs && i < needs.length; i++) {
		include._load(needs[i]);
	}
	var chain = include.set(needs);
	chain.loaded(function() {
		include.__load(name);
	});
};

include.__load = function(name) {
	var metadata = include.__metadata(name);
	if (metadata.loaded || metadata.loading) return;

	var source = include.sources[metadata.source];
	var url = source.resolver(name,metadata);
	var managed = source.managed || metadata.managed;

	metadata.loading = true;
	include.__loadScript(name,url,managed);
};

include._markLoaded = function(name) {
	include.libraries[name].loaded = true;
	include.libraries[name].loading = undefined;
};

include._notifyListeners = function() {
	for (var i = 0; include._listeners.length > 0 && i < include._listeners.length; i++) {
		var listener = include._listeners[i];
		if (include._fulfilled(listener.needs)) {
			include._listeners.splice(i--,1);
			listener.callback();
		}
	}
};

include._fulfilled = function(needs) {
	var fulfilled = true;
	for (var i = 0; i < needs.length; i++) {
		if (!include.__isLoaded(needs[i])) {
			fulfilled = false;
			break;
		}
	}
	return fulfilled;
};

include._listen = function(listener) {
	include._listeners.push(listener);
};

include.__metadata = function(name) {
	var metadata = include.libraries[name];
	if (!metadata) include.__configError(name);
	if (!include.sources[metadata.source] || !include.sources[metadata.source].resolver) include.__configError(name,'source');
	return metadata;
};

include.__configError = function(name,field) {
	throw {
		name: 'IncludeConfigException',
		message: field ? name + ' does not have a correctly configured ' + field + '.' : name + ' is not correctly configured.',
		toString: function() {
			return this.name + ': ' + this.message;
		}
	};
};

include.__loadScript = function(name,url,managed) {
	if (window.console) console.log('Loading: ' + url);
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	if (!managed) {
		var complete = function() {
			include.loaded(name);
		};
		script.onreadystatechange = function() {
			if (this.readyState == 'complete' || this.readyState == 'loaded') {
				if (!this.status || this.status == 200) {
					complete();
				} else {
					throw 'Error loading ' + name + '.  Status: ' + this.status;
				}
			}
		}
		script.onload = complete;
	}
	script.src = url;
	head.appendChild(script);
};

include.__isLoaded = function(name) {
	return include.libraries[name].loaded;
};
