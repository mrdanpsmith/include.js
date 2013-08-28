include()
	.load('google','jquery','1.10.2')
	.andThen('google','jqueryui','1.10.3')
.loaded(function() {
	jQuery(function($) {
		var test = $('<div>This is a dialog</div>');
		test.attr('title','Hey there!');
		$('body').append(test);
		test.dialog();
	});
});
