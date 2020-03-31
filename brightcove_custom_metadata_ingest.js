//Insrtuction to use

// Please install following dependancies
//1.npm install request --save
//2.npm install sync-request
//3.npm install json2csv --save

//Please update the client_id, client_secret and accoundId with respective one.

var request = require('request');
const client_id = "235b7c67-54cc-4507-9644-96d2e73aa976";
const client_secret = "3B_7-IhbwvK43zXShAT2ZXV7VKt12en5gZ3FCYC2zu_IVpn4QmTtZyydYFw-Z_aR8J8VJXePtxcHM0oUkRL_xA";
const accoundId = "6114089510001";
custom_fields = {}
var auth_string = new Buffer(client_id + ":" + client_secret).toString('base64');
var tokenExpiry = 0;
let keys = ["embed_code", "ad_set_id", "player_id", "publishing_rule_id", "ch_id", "rg_id", "end_time", "pgm_id", "start_time", "end_time_2", "start_time_2", "end_time_3", "start_time_3", "end_time_4", "start_time_4", "end_time_5", "start_time_5", "end_time_6", "start_time_6", "end_time_7", "start_time_7", "end_time_8", "start_time_8", "end_time_9", "start_time_9", "end_time_10", "start_time_10", "end_time_11", "start_time_11", "end_time_12", "start_time_12", "end_time_13", "start_time_13", "end_time_1", "start_time_1", "end_time_14", "start_time_14", "drawer_image", "drawer_text", "drawer_video", "end_time_15", "start_time_15", "end_time_16", "start_time_16", "end_time_17", "start_time_17", "end_time_18", "start_time_18", "end_time_19", "start_time_19", "end_time_20", "start_time_20"];
let values = []
var accessToken;
let j = 0 //index for values and keys
let i = 0 //index for the row fetched from csv

console.log('---------------------------Start Time-------------------- :- ', new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());

function start() {
    count = 0
    var embed_code = ""
    var csv = require('fast-csv')
    // filePath="extra.csv"
    filePath = "Ooyala_Custom_Metadata_111019.csv"
    let csvstream = csv.fromPath(filePath, { header: false })
        .on("data", function (row) {
            values = [];
            csvstream.pause();
            if (row.includes('embed_code'))// skip header row
            {
                csvstream.resume();
            }
            else {
                count = count + 1
                i = 0, j = 0
                embed_code = row[0]
                while (i < 59) {
                    values[j] = row[i]
                    j = j + 1
                    i = i + 1
                }
                var json_str = {}
                for (i = 1; i < keys.length; i++) {
                    if (values[i] != 'NA' && values[i] != "")
                        json_str[keys[i]] = values[i]
                }
                let label = []
                if (values[4] == '') {
                    label = []
                } else {
                    label = values[4].split(":;:");
                    var x;
                    for (x = 0; x < label.length; x++) {
                        label[x] = label[x].replace('/', '');
                    }
                }

                values = [];
                update_call(embed_code, json_str, label, function (err, resp, body, cf) {
                    var fs = require('fs');
                    var erfile = 'Error_log.csv'
                    var sucfile = 'Success_log.csv'
                    if (resp.statusCode != 200) {
                        var csv;
                        csv = "\n" + embed_code + ',' + JSON.stringify(body)
                        fs.writeFileSync(erfile, csv, { flag: 'a+' }, function (err) {
                            if (err) {
                                console.log('Error in file writing');
                            } else {
                                console.log('file saved (Error logged) : ' + embed_code);
                            }
                        })
                    }
                    else {
                        var csv;
                        csv = "\n" + embed_code + ',Success'
                        fs.writeFileSync(sucfile, csv, { flag: 'a+' }, function (err) {
                            if (err) {
                                console.log('Error in file writing');
                            } else {
                                console.log('file saved (Success logged)');
                            }
                        });
                    }
                    //    if(count<10)    //Uncomment this if condition if you want to make call only for a limited number (10) of assets
                    csvstream.resume();
                })
            }
        })
        .on("end", function () {
            console.log("We are done!")
            console.log('---------------------------Finish Time-------------------- :- ', new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());
        })
        .on("error", function (error) {
            console.log(error)
        });
}

function update_call(embed_code, custom_fields, label, cb) {
    if ((Date.now() / 1000) < tokenExpiry) {
        request({
            method: 'PATCH', url: 'https://cms.api.brightcove.com/v1/accounts/' + accoundId + '/videos/ref:' + embed_code,
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json'
            }, json: {

                "custom_fields": custom_fields,
                "tags": label
            }
        }, function (error, response, body) {
            cb(error, response, body, custom_fields)
        });

    }
    else {
        getTokenWithExpiry()
        update_call(embed_code, custom_fields, label, cb)

    }

}

// Get Auth Token
function getTokenWithExpiry() {
    const request = require('sync-request');
    const res = request('POST', 'https://oauth.brightcove.com/v4/access_token',
        {
            headers: {
                'Authorization': 'Basic ' + auth_string,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

    const token = JSON.parse(res.getBody('utf8'))
    accessToken = 'Bearer ' + token.access_token
    tokenExpiry = Math.floor(Date.now() / 1000) + 270
    console.log('New AccessToken:- ', token.access_token);
}
getTokenWithExpiry();
start();