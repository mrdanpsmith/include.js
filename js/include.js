var include = function(includes) {
	return {
		load: function(source,name,version) {
			var library = include.util.libraryFrom(source,name,version);
			this.includes.push(library);
			include._load(library);
			return this;
		},
		andThen: function(source,name,version) {
			var library = include.util.libraryFrom(source,name,version);
			var dependencies = include(this.includes);
			dependencies.loaded(function() {
				include._load(library);
			});
			this.includes.push(library);
			return this;
		},
		loaded: function(callback) {
			include._listen({
				includes: this.includes,
				callback: callback
			});
			return this;
		},
		includes: includes ? includes.slice(0) : new Array()
	};
};
include.libraries = {
	google: {
		url: '//ajax.googleapis.com/ajax/libs/',
		path: function(library) {
			if (library.name === 'jqueryui') {
				return this.url + library.name + '/' + library.version + '/jquery-ui.min.js';
			}
		}
	},
	cdnjs: {
		url: '//cdnjs.cloudflare.com/ajax/libs/',
		path: function(library) {
			if (library.name === 'jqueryui') {
				return this.url + library.name + '/' + library.version + '/jquery-ui.min.js';
			}
		}
	}
};
include._listeners = new Array();
include._load = function(library) {
	if (!this._isLoaded(library)) {
		this.util.load(library);
	}
};
include._markLoaded = function(library) {
	if (!include.libraries[library.source].loaded) {
		include.libraries[library.source].loaded = {};
	}
	if (!include.libraries[library.source].loaded[library.name]) {
		include.libraries[library.source].loaded[library.name] = {};
	}
	include.libraries[library.source].loaded[library.name][library.version] = library.tag;
	include._notifyListeners();
};
include._notifyListeners = function() {
	for (var i = this._listeners.length - 1; i >= 0; i--) {
		var listener = this._listeners[i];
		var waiting = false;
		for (var j = 0; j < listener.includes.length; j++) {
			var include = listener.includes[j];
			if (!this._isLoaded(include)) {
				waiting = true;	
			}
		}
		if (!waiting && !listener.called) {
			listener.callback();
			listener.called = true;
		}
	}
};
include._isLoaded = function(library) {
	return (this.libraries[library.source] &&
		this.libraries[library.source].loaded && 
			this.libraries[library.source].loaded[library.name] &&
				(!library.version || this.libraries[library.source].loaded[library.name][library.version]))
};
include._listen = function(listener) {
	this._listeners.push(listener);
	this._notifyListeners();
};
include._library = function(name, version) {
	if (!this.util.scriptLoaded(name,version)) {
		var error = "IncludeError: library " + name;
		if (version) {
			error += " v" + version;
		}
		error += " is not loaded.";
		throw error;
	}
};
include.util = {
	path: function(library) {
		return this.url + library.name + '/' + library.version + '/' + library.name + '.min.js';
	},
	buildPath: function(library) {
		var source = include.libraries[library.source];
		var result;
		if (source.path) {
			var result = source.path.call(source,library);
		}
		return (result) ? result : this.path.call(source,library);
	},
	load: function(library,callback) {
		var completeCalled = false;
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.onreadystatechange = function() {
			if (!completeCalled && (this.readyState == 'complete' || this.readyState == 'loaded')) {
				if (this.status == 200) {
					complete.call(this);
				} else {
					throw 'IncludeError: Error loading library ' + library.name + ' v' + library.version + ' from ' + library.source + '.  Status: ' + this.status;
				}
			}
		}
		script.onload = complete;
		script.src = include.util.buildPath(library);
		head.appendChild(script);
		function complete() {
			library.tag = script;
			include._markLoaded(library);
		}
	},
	libraryFrom: function(source,name,version) {
		return {
			source: source,
			name: name,
			version: version
		};
	}
};
