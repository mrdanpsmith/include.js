include.set()
	.load('jqueryui')
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
	include.loaded('plugindemo');
});
