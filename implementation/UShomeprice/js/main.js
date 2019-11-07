

var USchoro;


queue()
    // geoJSON data is obtained from https://eric.clst.org/tech/usgeojson/
    .defer(d3.json, "data/USgeojson.json")
    .defer(d3.csv, "data/MedianHomeValuePerSqft.csv")
    .await(function(error, USmapJson, HomeValueCsv) {
       USchoro = new USchoropleth("US-choropleth", USmapJson, HomeValueCsv)

    });