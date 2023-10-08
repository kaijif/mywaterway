async function getIPaCData(geoJson) {
    var wkt = Terraformer.geojsonToWKT(geoJson.geometry).replace("POLYGON", "Polygon")
    console.log(wkt)
    let body  = {
        "projectLocationWKT":  wkt,
        "timeout": 200,
        "apiVersion": "1.1.0",
        "includeOtherFwsResources": true,
        "includeCrithabGeometry": true
    }
    var data = await fetch('https://ipac.ecosphere.fws.gov/location/api/resources', {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            "accept-encoding": "deflate, gzip",
            "charset": "UTF-8",
            "accept": "application/json, text/xml, application/xml, */*"
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
        body: JSON.stringify(body)
    })
    let response = await data.json()

    return response
}

async function getNOAAData(geoJson) {
    
}

async function getAllData(geoJson) {
    data = await Promise.all([getIPaCData(geoJson)])
    return data
}

async function updateWaterways(event) {
    console.log(event);
    var windowBounds = event.target.getBounds();
    console.log(windowBounds)
    var response = await fetch(`https://overpass-api.de/api/interpreter?data=%5Bbbox%3A${windowBounds.getSouthWest().lat}%2C${windowBounds.getSouthWest().lng}%2C${windowBounds.getNorthEast().lat}%2C${windowBounds.getNorthEast().lng}%5D%5Bout%3Ajson%5D%3B%28way%5B%22waterway%22%5D%3Bway%5B%22natural%22%3D%22water%22%5D%3B%29%3B%28%3E%3Bway%5B%22waterway%22%5D%3Bway%5B%22natural%22%3D%22water%22%5D%3B%29%3Bout%3B%0A`, {
        method: "get",
    })
    var data = await response.json().then((data) => {
        return data.elements
    })
    console.log(data);

    var nodes = new Map();
    var ways = new Map()

    for (const item of data) {
        console.log(item.type);
        console.log(item)
        if (item["type"] === "node") {
            console.log("node")
            nodes.set(item.id, [ item.lat, item.lon])
            // L.marker(item).addTo(event.target);
        } else if (item.type === "way") {
            for (var i = 0; i < item.nodes.length; i++) {
                item.nodes[i] = nodes.get(item.nodes[i])
            }
            console.log(item)
            if (item.tags.waterway === undefined) {
                var geoJson = GeoJSON.parse({polygon: [item.nodes]}, {'Point': ['x', 'y'], 'Polygon': 'polygon'})
                console.log(geoJson)
                var polygon = turf.polygon(geoJson.geometry.coordinates)
                var center = turf.centerOfMass(polygon);
                // get data
                let dataRaw = await getAllData(geoJson)
                console
                let data = {
                    ipac: dataRaw[0]
                }
                let noEndangeredSpecies = true
                if (data.ipac.resources.populationsBySid.length !== 0) {
                    noEndangeredSpecies = false
                }
                let marker = L.marker(center.geometry.coordinates).addTo(event.target)
                marker.bindPopup("Looks good! Have fun!")
                L.polygon(item.nodes).addTo(event.target)
            } else {
                L.polyline(item.nodes).addTo(event.target)
            }
        }
    }
}

function makeMap(location) {
    console.log(location)

    var map = L.map('map').setView([location.coords.latitude, location.coords.longitude], 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    updateWaterways({target:map});
    map.on("moveend", updateWaterways)
}

function main() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(makeMap);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
}

main();

