//To create the file to store the custom metadata
  const { Parser } = require('json2csv');
   
  
  //These are the custom fields that are required. Here the headers are generated for the csv.
  let fields = ["ch_id","rg_id","end_time","pgm_id","start_time","end_time_2","start_time_2","end_time_3","start_time_3","end_time_4","start_time_4","end_time_5","start_time_5","end_time_6","start_time_6","end_time_7","start_time_7","end_time_8","start_time_8","end_time_9","start_time_9","end_time_10","start_time_10","end_time_11","start_time_11","end_time_12","start_time_12","end_time_13","start_time_13","end_time_1","start_time_1","end_time_14","start_time_14","drawer_image","drawer_text","drawer_video","end_time_15","start_time_15","end_time_16","start_time_16","end_time_17","start_time_17","end_time_18","start_time_18","end_time_19","start_time_19","end_time_20","start_time_20"];
   
  const parser = new Parser({fields});
      
  var csv = parser.parse();
  //Since these 5 are not custom metadata they have to handled differently while retrieving the data.
  var prepend_str='"embed_code","Ad Set ID","Player ID","Publishing Rule ID","label",'
  csv=prepend_str+csv
  //console.log(csv)
  var fs = require('fs');
  //The filename where the custom metadata is stored
 var filename='Ooyala_Custom_Metadata_111019.csv'
  fs.writeFile(filename, csv,{flag:'a+'}, function(err) {
                   if (err) {
                   console.log('Error in file writing');
                   } else {
                   console.log('file saved');
                   }
                   });
