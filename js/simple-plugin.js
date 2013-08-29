include()
	.load('google','jquery','1.10.2')
	.then('google','jqueryui','1.10.3')
.loaded(function() {
	(function($) {
		$.fn.test = function() {
			var div = $('<div>test</div>');
			div.attr('title','test');
			$(this).append(div);
			div.dialog();
			return this;
		};
	})(jQuery);
	include.markLoaded('local','simple-plugin','snapshot');
});
