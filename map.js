
//my map append from different file 
var sMapTags='<div class="" id="input-div"><input id="pac-input" class="controls" type="text" placeholder="City, Address, ZIP code"></div>\
    <div id="map"></div><div id="map-properties"></div>';
// end of map append




function initAutocomplete() {
        var allProperties;
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 56.2639, lng: 9.5018},
          zoom: 7,
          mapTypeId: 'roadmap'
        });


        // addin markers
         $.getJSON("php/api-get-all-properties-images.php", function(result){
        allProperties=result;
          for(var i=0; i<result.length; i++){
            var iLat=parseFloat(result[i].lat);
            var iLng=parseFloat(result[i].lng);
            var myLatLng = {lat: iLat, lng: iLng};
            var marker = new google.maps.Marker({
              position: myLatLng,
              map: map,
              title: result[i].header
            });
          }
        });
        

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        map.addListener('bounds_changed', function() {
          // 3 seconds after the center of the map has changed, pan back to the
          // marker.
          var mapCenter = map.getCenter();
          var mapCenterLat = mapCenter.lat();
          var mapCenterLong = mapCenter.lng();

          // calculates difference number
          var jAllPropertiesIndexed=fnDifferenceIndex(mapCenterLat,mapCenterLong,allProperties);
          
          // returns id based on smallest difference number
          var aPropertiesToShow=fnShowClosest(jAllPropertiesIndexed);
          fnShowProperties(aPropertiesToShow,allProperties);
            var myLatLng = {lat: mapCenterLat, lng: mapCenterLong};
            // var marker = new google.maps.Marker({
            //   position: myLatLng,
            //   map: map,
            //   title: 'Center!'
            // });
         
        });


}

function fnDifferenceIndex(currentLat,currentLong,properties){
  var jAllProperties=properties;
  var fCurrentLat=currentLat;
  var fCurrentLong=currentLong;

  for(var x=0; x<jAllProperties.length; x++){ // loop throught all properties and calculate difference index
    fPropertyLat=parseFloat(jAllProperties[x].lat);
    fPropertyLng=parseFloat(jAllProperties[x].lng);
    fPropertyDifferenceLat=Math.abs(fCurrentLat-fPropertyLat); // absolute value of a number.
    fPropertyDifferenceLng=Math.abs(fCurrentLong-fPropertyLng); // absolute value of a number.
    fPropertyDifferenceIndex=fPropertyDifferenceLat+fPropertyDifferenceLng; // difference index 
    jAllProperties[x].differenceIndex=fPropertyDifferenceIndex;
    
  }
  // return properties with difference indexes
  return jAllProperties;
}

function fnShowClosest(input){
 var jAllPropertiesCal=input;
 var aAllindexes=[];
 var aSmallest=[];
 var aIdsToShow=[];
 var fSmallestIndex;
 var iNumberOfClosestObjects=2;
 for(var t=0; t<jAllPropertiesCal.length; t++){
  aAllindexes.push(jAllPropertiesCal[t].differenceIndex); // push all indexes to array

 }
 for(var u=0; u<iNumberOfClosestObjects; u++){// get 2 smallest indexes
 fSmallestIndex=Math.min.apply(null, aAllindexes); // sort
  aSmallest.push(fSmallestIndex);// push result to array
  aAllindexes.splice(aAllindexes.indexOf(fSmallestIndex),1); //remove from array

 }
 for(var j=0; j<aSmallest.length; j++){
  for(var h=0; h<jAllPropertiesCal.length; h++){
    if(jAllPropertiesCal[h].differenceIndex==aSmallest[j]){// find proprety id
      aIdsToShow.push(jAllPropertiesCal[h].id);//push ids to array
    }
    
  }
 }
 //return id of properties which are closest
  return aIdsToShow;
}

function fnShowProperties(ids,properties){
  var showPropertyId=ids;
  var allProperties=properties;
  console.log(showPropertyId);
  var sPrintProperty="";
  for(var g=0; g<showPropertyId.length; g++){
  sMapProperty=sMapPropertyA;
    for(var p=0; p<allProperties.length; p++){
      if(showPropertyId[g]==allProperties[p].id){
        var sImageNames=allProperties[p].image_name
        var sImageName=sImageNames.split(",");
        sMapProperty=sMapProperty.replace("{{id}}",allProperties[p].id);
        sMapProperty=sMapProperty.replace("{{Header}}",allProperties[p].header);
        sMapProperty=sMapProperty.replace("{{Address}}",allProperties[p].address);
        sMapProperty=sMapProperty.replace("{{m2}}",allProperties[p].square_meters);
        sMapProperty=sMapProperty.replace("{{Price}}",allProperties[p].price);
        sMapProperty=sMapProperty.replace("{{if}}",allProperties[p].image_folder);
        sMapProperty=sMapProperty.replace("{{in}}",sImageName[0]);
        break;
      }
    }
    sPrintProperty=sPrintProperty+sMapProperty;
  }
  $("#map-properties").html(sPrintProperty);
}
