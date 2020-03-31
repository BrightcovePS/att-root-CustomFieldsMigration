/// install:-  npm install ooyala-api
/// install:-  npm install json2csv --save
/// Update:- update ooyala api_key, api_secret and accoundId


/////////THIS IS TO GET THE EMBED CODES AND OTHER METADATA WHICH **DOES NOT** COME UNDER CUSTOM METADATA///////////////////
const api_key = 'F5bGsyOovEON1FJUjhscLRgo3j4a.LjaNP';
const api_secret = 'H3RNCDRabWeqWOqJqufuKlRlYRKRmwGUgLqoIVjT';
const accoundId = '111019';


const OoyalaApi = require('ooyala-api');
const api = new OoyalaApi(api_key, api_secret, {concurrency: 10});

console.log('---------------------------Start Time--------------------', accoundId + ":-"  + new Date().getHours() + ":" +  new Date().getMinutes() + ":" +  new Date().getSeconds());
//Get all the asset's embed code,
api.get('/v2/assets', {where: ``}, {recursive: true})
.catch((err) => {
  console.log('Error: ', err);
  })
.then((items) => {
  const data = items;
 // console.log(data)
  const { Parser } = require('json2csv');
   
  let fields = ["asset_type", "embed_code","ad_set_id","player_id","publishing_rule_id"];
      
  const parser = new Parser({fields,defaultValue : "NA",unwind: ["asset_type", "embed_code","ad_set_id","player_id","publishing_rule_id"]});
      
  const csv = parser.parse(data);
  const fs = require('fs');
  const filename='Ooyala_Metadata_' + accoundId + '.csv'
  fs.writeFile(filename, csv,{flag:'a+'}, function(err) {
                   if (err) {
                   console.log('Error in file writing');
                   } else {
                   console.log('file saved');
                   }
                   });
      console.log('---------------------------FInish Time--------------------', accoundId + ":-" +  new Date().getHours() + ":" +  new Date().getMinutes() + ":" +  new Date().getSeconds());

});