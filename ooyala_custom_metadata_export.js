/// install:-  npm install ooyala-api
/// install:-  npm install json2csv --save
/// install:- npm install -S fast-csv
/// Update:- update api_key, api_secret and accoundId

const api_key = 'F5bGsyOovEON1FJUjhscLRgo3j4a.LjaNP';
const api_secret = 'H3RNCDRabWeqWOqJqufuKlRlYRKRmwGUgLqoIVjT';
let fields = ["ch_id","rg_id","end_time","pgm_id","start_time","end_time_2","start_time_2","end_time_3","start_time_3","end_time_4","start_time_4","end_time_5","start_time_5","end_time_6","start_time_6","end_time_7","start_time_7","end_time_8","start_time_8","end_time_9","start_time_9","end_time_10","start_time_10","end_time_11","start_time_11","end_time_12","start_time_12","end_time_13","start_time_13","end_time_1","start_time_1","end_time_14","start_time_14","drawer_image","drawer_text","drawer_video","end_time_15","start_time_15","end_time_16","start_time_16","end_time_17","start_time_17","end_time_18","start_time_18","end_time_19","start_time_19","end_time_20","start_time_20"];
   
var count=0;
const OoyalaApi = require('ooyala-api');
const api = new OoyalaApi(api_key, api_secret, {concurrency: 10});


//Function to parse the metadata recieved and append to file
function data_parser(data,asset_id,ad_set_id,player_id,pub_rule_id,labels){
  //These are the data that we get other than from the custom metadata call
  var prepend_str='"'+asset_id+'","'+ad_set_id+'","'+player_id+'","'+pub_rule_id+'","'+labels+'",'
  const { Parser } = require('json2csv');
 
  const parser = new Parser({fields,defaultValue : "NA",header :false});

  var csv = parser.parse(data);
 csv="\n"+prepend_str+csv

 var fs = require('fs');
 var filename='Ooyala_Custom_Metadata_111019.csv' // Here the filename will have to be updated based on the init.js
  fs.writeFile(filename, csv,{flag:'a+'}, function(err) {
                   if (err) {
                   console.log('Error in file writing');
                   } else {
                   console.log('file saved');
                   }
                   });

}


//Function to make api calls for metadata
function metadata_call(asset_id,ad_set_id,player_id,pub_rule_id){
   
   //code to get the label
   var delimiter=":;:"  //Label Delimiter
   var label_string=""
   console.log("Label call start")
   data = api.get('/v2/assets/'+asset_id+'/labels', {where: ``}, {recursive: false})
   .catch((err) => {
     console.log('Error: ', err);
     var data="\n"+embed_code+","+err
     var fs = require('fs');
     var filename='label_resource_notfound.csv' 
      fs.writeFile(filename, data,{flag:'a+'}, function(err) {
                       if (err) {
                       console.log('Error in error file writing');
                       } else {
                       console.log('error file saved');
                       }
                       });

     })
   .then((labels) => {
     var label_arr=labels["items"]     
     for(i=0;i<label_arr.length;i++){
       label_string=label_string+label_arr[i].full_name+delimiter
     }
     label_string = label_string.substring(0, label_string.length - 3);

     //Code for making api calls to get
   api.get('/v2/assets/'+asset_id+'/metadata',{where: ``}, {recursive: false})
   .then((items) => {
     //Call data_parser method to parse the data and store it accordingly into the excel file
     data_parser(items,asset_id,ad_set_id,player_id,pub_rule_id,label_string)
     console.log('---------------------------End Time--------------------' + new Date().getHours() + ":" +  new Date().getMinutes() + ":" +  new Date().getSeconds());
   })
   .catch((err) => {
       console.log('Error: ', err);
       var data="\n"+embed_code+","+err
     var fs = require('fs');
     var filename='metadata_resource_notfound.csv' 
      fs.writeFile(filename, data,{flag:'a+'}, function(err) {
                       if (err) {
                       console.log('Error in error file writing');
                       } else {
                       console.log('error file saved');
                       }
                       });

       })


   })

.then(
  
  )    
  //-------------------------------------------------
  

}

//Function to get each embed code from csv file 
function get_assetid(){
  var csv=require('fast-csv')
  //Write here the code to retrieve the embed codes one by one from the file
  filePath="Ooyala_Metadata_111019.csv"
  let csvstream = csv.fromPath(filePath, { header: false })
    .on("data", function (row) {
        csvstream.pause();
        if(row.includes('asset_type'))
        {
          csvstream.resume();
        }
        else{

          embed_code=row[1]
          ad_set_id=row[2]
          player_id=row[3]
          pub_rule_id=row[4]
        //Call the function metdata_call to make the api calls to get the metdata of current asset.
        count=count+1
        metadata_call(embed_code,ad_set_id,player_id,pub_rule_id) 
        
      //  if(count<10000)  //Uncomment this to check for just 10 and not thw whole assets
        csvstream.resume();
        }
    })
    .on("end", function () {
        console.log("We are done!")
        console.log('---------------------------Start Time--------------------' + new Date().getHours() + ":" +  new Date().getMinutes() + ":" +  new Date().getSeconds());
    })
    .on("error", function (error) {
        console.log(error)
    });
  //----------------------------------------------------
  
  //----------------------------------------------------
  

}
get_assetid();