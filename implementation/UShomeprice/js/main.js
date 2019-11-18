

var USchoro;
var pricesAreaChart;


// queue()
//     // geoJSON data is obtained from https://eric.clst.org/tech/usgeojson/
//     .defer(d3.json, "data/USgeojson.json")
//     .defer(d3.csv, "data/MedianHomeValuePerSqft.csv")
//     .await(function(error, USmapJson, HomeValueCsv) {
//        USchoro = new USchoropleth("US-choropleth", USmapJson, HomeValueCsv)
//     });

queue()
    .defer(d3.json, "data/State_USgeojson.json")
    // .defer(d3.csv, "data/State_MedianHomeValuePerSqft.csv")
    .defer(d3.csv, "data/State_Zhvi_AllHomes.csv")
    .await(function(error, USmapJson, HomeValueCsv) {

        USchoro = new USchoropleth_State("US-choropleth", USmapJson, HomeValueCsv);

        pricesAreaChart = new AgeVis("agevis", allData, metaData);
        // var prioVis = new PrioVis("priovis", allData, metaData);

    });