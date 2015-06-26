function getTest(URL, expectedResult, errorMessage) {
	var input;

	var expectedResults = jQuery.ajax({
		type : "GET",
		url : "qunitresults/Test11.txt",
		async : true
	});

	var xhr = jQuery.ajax({
		type : 'GET',
		url : URL
	}).always(function(data, status) {
		var results = (new XMLSerializer()).serializeToString(data);
		equal(results, expectedResult, errorMessage);
		start();
	});
};