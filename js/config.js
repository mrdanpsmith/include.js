include.sources.localplugin = {
	url: 'js/',
	resolver: function(name,metadata) {
		return this.url + 'jquery.' + name + '.js';
	},
	managed: true
};

include.libraries.jquery = {
	path: 'jquery',
	filename: 'jquery.min.js',
	version: '1.10.2',
	source: 'cdnjs'
};
include.libraries.jqueryui = {
	path: 'jqueryui',
	filename: 'jquery-ui.min.js',
	version: '1.10.3',
	source: 'cdnjs',
	needs: ['jquery']
};
include.libraries.plugindemo = {
	source: 'localplugin'
};
