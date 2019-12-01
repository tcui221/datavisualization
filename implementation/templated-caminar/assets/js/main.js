/*
	Caminar by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
*/

// (function($) {
//
// 	skel.breakpoints({
// 		xlarge: '(max-width: 1680px)',
// 		large: '(max-width: 1280px)',
// 		medium: '(max-width: 980px)',
// 		small: '(max-width: 736px)',
// 		xsmall: '(max-width: 480px)'
// 	});
//
// 	$(function() {
//
// 		var	$window 	= $(window),
// 			$body 		= $('body'),
// 			$header 	= $('#header');
//
// 		// Disable animations/transitions until the page has loaded.
// 			$body.addClass('is-loading');
//
// 			$window.on('load', function() {
// 				window.setTimeout(function() {
// 					$body.removeClass('is-loading');
// 				}, 100);
// 			});
//
// 		// Prioritize "important" elements on medium.
// 			skel.on('+medium -medium', function() {
// 				$.prioritize(
// 					'.important\\28 medium\\29',
// 					skel.breakpoint('medium').active
// 				);
// 			});
//
// 		// Gallery.
// 			$('.gallery').poptrox();
//
// 	});
//
// })(jQuery);



var USchoro;
var pricesAreaChart;
var USscatter;
var hlBars;

// queue()
//     // geoJSON data is obtained from https://eric.clst.org/tech/usgeojson/
//     .defer(d3.json, "data/USgeojson.json")
//     .defer(d3.csv, "data/MedianHomeValuePerSqft.csv")
//     .await(function(error, USmapJson, HomeValueCsv) {
//        USchoro = new USchoropleth("US-choropleth", USmapJson, HomeValueCsv)
//     });
$("#US-choropleth").click(function() {
	$('html,body').animate({
			scrollTop: $("#pricesAreaChart").offset().top},
		'slow');
});

queue()
	.defer(d3.json, "data/State_USgeojson.json")
	// .defer(d3.csv, "data/State_MedianHomeValuePerSqft.csv")
	.defer(d3.csv, "data/State_Zhvi_AllHomes.csv")
	.defer(d3.csv, "data/cleaned_State_Zhvi_AllHomes copy.csv")
	.defer(d3.csv, "data/State_medianincome copy.csv")
	.defer(d3.csv,'data/Homelessness_Ratios.csv')
	.defer(d3.csv,'data/2bedroom_top400_zips.csv')
	.defer(d3.csv,'data/3bedroom_topbottom200.csv')
	.await(function(error, USmapJson, HomeValueCsv, cleanedHomeValue,
					medianIncome,homelessRatios, twoBedroom, threeBedroom) {

		var jsonData = [];
		var years = ['1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007','2008', '2009', '2010', '2011', '2012', '2013', '2014','2015', '2016','2017', '2018'];
		var income_obj = [];

		medianIncome.forEach(function(element){
			var income_arr= new Array(22);
			for (var i=0; i<years.length; i++) {
				element[years[i]] = +element[years[i]]
				income_arr[i] = [years[i], element[years[i]]]
			}
			income_obj.push(income_arr)
		});

		cleanedHomeValue.forEach(function (element, index) {
			var value_arr = new Array(22);
			for (var i=0; i<years.length; i++) {
				element[years[i]] = +element[years[i]]
				value_arr[i] = [years[i], element[years[i]]]
			}
			var obj = {
				region: element['RegionName'],
				division: element['Division'],
				price: value_arr,
				income: income_obj[index]
			};
			jsonData.push(obj)
		});

		// console.log(jsonData);

		USchoro = new USchoropleth_State("US-choropleth", USmapJson, HomeValueCsv);
		pricesAreaChart = new PricesVis("pricesAreaChart", HomeValueCsv);
		USscatter = new ScatterVis("US-scatter", jsonData);

		forceHouseCategories = new ForceDiagram('forceDiagram', twoBedroom, threeBedroom);

		hlBars=new HLBars('#homelessChart',homelessRatios);

	});


function choroplethClicked(stateClicked) {
	pricesAreaChart.onSelectionChange(stateClicked);
}