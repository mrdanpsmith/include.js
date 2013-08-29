// Replace include.load with dummy function so that dependencies can be marked loaded manually.
include.load = function() {};

function mockLibrary(name) {
	include.libraries[name] = {
		path: name,
		filename: name,
		version: 'snapshot',
		source: 'google'
	}
}

test("simple load test", function() {
	mockLibrary('simple');
	var shouldFire = false;
	include.set()
		.load('simple')
	.loaded(function() {
		ok(shouldFire,'Should fire after load.');
	});
	shouldFire = true;
	include.loaded('simple');
});

test("chained load test", function() {
	mockLibrary('needed');
	mockLibrary('chained');
	var shouldFire = false;
	include.set()
		.load('needed')
		.chain('chained')
	.loaded(function() {
		ok(shouldFire,'Should fire after chained loading.');
	});
	include.loaded('needed');
	shouldFire = true;
	include.loaded('chained');
});

test("doubly chained test", function() {
	mockLibrary('library');
	mockLibrary('first');
	mockLibrary('second');
	var shouldFire = false;
	include.set()
		.load('library')
		.chain('first')
		.chain('second')
	.loaded(function() {
		ok(shouldFire,'Should fire after two libraries have been chain loaded.');
	});
	include.loaded('library');
	include.loaded('first');
	shouldFire = true;
	include.loaded('second');
});

test("mixed loading test", function() {
	mockLibrary('mixed');
	mockLibrary('needsTwo');
	mockLibrary('doubleChained');

	var chainedShouldFire = false, simpleShouldFire = false;

	include.set()
		.load('mixed')
		.load('doubleChained')
	.loaded(function() {
		ok(simpleShouldFire,'Should fire after the libraries are loaded.');
	});

	include.set()
		.load('mixed')
		.chain('needsTwo')
		.chain('doubleChained')
	.loaded(function() {
		ok(chainedShouldFire,'Should fire only after both libraries are loaded.');
	});

	include.loaded('mixed')
	simpleShouldFire = true;
	include.loaded('doubleChained');
	simpleShouldFire = false;

	chainedShouldFire = true;
	include.loaded('needsTwo');
});
