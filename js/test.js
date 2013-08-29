include.libraries.local = {
	url: 'js/',
	path: function(library) {
		return this.url + library.name + '.js';
	},
	managed: true
};
include()
	.load('local','plugin')
.loaded(function() {
	jQuery(function($) {
		$('body').test();
	});
});
