//Insrtuction to use

    // Please install following dependancies
    //1.npm install request --save
    //2.npm install sync-request
    //3.npm install json2csv --save

    //Please update the client_id, client_secret and accoundId with respective one.

    var request = require('request');
    const client_id = "e2d7017d-67c2-433c-8ac9-1ad0ced64b63";
    const client_secret = "3AI6-t9NcW41LhGYG7iGPCCsEmlH1tO6jG7qZv9o9hkaEVfDb_bHA2QfDt9_R3EK5VwVwaKSHIMeddiZ0hkNsQ";
    const accoundId = "6058022041001";
    custom_fields={}
    var auth_string = new Buffer(client_id + ":" + client_secret).toString('base64');
    var tokenExpiry = 0;
    let keys = ["embed_code","ad_set_id","player_id","publishing_rule_id","label","ch_id","rg_id","end_time","pgm_id","start_time","end_time_2","start_time_2","end_time_3","start_time_3","end_time_4","start_time_4","end_time_5","start_time_5","end_time_6","start_time_6","end_time_7","start_time_7","end_time_8","start_time_8","end_time_9","start_time_9","end_time_10","start_time_10","end_time_11","start_time_11","end_time_12","start_time_12","end_time_13","start_time_13","end_time_1","start_time_1","end_time_14","start_time_14","drawer_image","drawer_text","drawer_video","end_time_15","start_time_15","end_time_16","start_time_16","end_time_17","start_time_17","end_time_18","start_time_18","end_time_19","start_time_19","end_time_20","start_time_20"];
    let values=[]
    var accessToken;
    let splclmns=[] // Valencia Required some additional processing to the custom metadta before ingesting. This array has the indices of the fields that require processing
    let j=0 //index for values and keys
    let i=0 //index for the row fetched from csv

    console.log('---------------------------Start Time-------------------- :- ',  new Date().getHours() + ":" +  new Date().getMinutes() + ":" +  new Date().getSeconds());
    getTokenWithExpiry();
    start();
    function start(){
        count=0
        var embed_code=""
        var csv=require('fast-csv')
        // filePath="extra.csv"
        filePath="Ooyala_Custom_Metadata_111019-2.csv"
        let csvstream = csv.fromPath(filePath, { header: false })
    .on("data", function (row) {
        values=[];
        csvstream.pause();
        if(row.includes('Autor_1'))// skip header row and remote assets
        {
          csvstream.resume();
        }
        else{
            count=count+1
            i=0,j=0
            console.log(count)
            embed_code=row[0]
            while(i<59){
              if(splclmns.includes(i)){ // check if columns are special ones that require additional processing
               if([11,12,13,14].includes(i)){
                    process_body(i,j,row[i])
                    j=j+2
                    i=i+1
               }
               else {
                   if(i==19){
                       process_fechaexp(i,j,row[i],row[i+1],row[i+2])
                       j=j+1
                       i=i+3

                   }
                   else{
                        if(i==23){
                        process_fechapub(i,j,row[i],row[i+1])
                        j=j+1
                        i=i+2
                        }
                        else{
                            if(i==29){
                            process_idioma(i,j,row[i],row[i+1])
                            j=j+1
                            i=i+2
                            }
                            else{ 
                                if(i==32){
                                process_keyword(i,j,row[i],row[i+1],row[i+2],row[i+3],row[i+4],row[i+5])
                                j=j+1
                                i=i+6
                                }
                                else{
                                    if(i==40){
                                    process_rating(i,j,row[i],row[i+1])
                                    j=j+1
                                    i=i+2
                                    }
                                    else{
                                        if(i==42){
                                        process_registro(i,j,row[i],row[i+1])
                                        j=j+1
                                        i=i+2         
                                        }  
                                        else{
                                            if(i==48){
                                            process_textbody(i,j,row[i])
                                            j=j+1
                                            i=i+1         
                                            }         
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                
            }
            else{ 
                values[j]=row[i]
                j=j+1
                i=i+1
            }
          
        }        
        var json_str={}
        for(i=1;i<keys.length;i++)
        {   
            if(values[i]!='NA'&& values[i]!="")
            json_str[keys[i]]=values[i]          
        }
        let label=[]
        if (values[4]==''){
            label=[]
        }else{
            label=values[4].split(":;:");
        }
     
       values=[]; 
               
      console.log(embed_code,label)
       update_call(embed_code,json_str,label,function(err,resp,body,cf){ 
       var fs = require('fs');
       var erfile='Error_log.csv'
       var sucfile='Success_log.csv'       
       if (resp.statusCode!=200){
            var csv;
            csv="\n"+embed_code+','+JSON.stringify(body)
            fs.writeFileSync(erfile, csv,{flag:'a+'}, function(err) {
                if (err) {
                    console.log('Error in file writing');
                }else{
                    console.log('file saved (Error logged) : '+embed_code);
                     }
            })
        }
        else{
            var csv;
            csv="\n"+embed_code+',Success'
            fs.writeFileSync(sucfile, csv,{flag:'a+'}, function(err) {
                if (err) {
                console.log('Error in file writing');
                }else {
                console.log('file saved (Success logged)');
                }
            });
        }
    //    if(count<10)    //Uncomment this if statement if you want to make call only for a limited number (50) of assets
        csvstream.resume();
       })
      }
    })
    .on("end", function () {
        console.log("We are done!")
          console.log('---------------------------Finish Time-------------------- :- ',  new Date().getHours() + ":" +  new Date().getMinutes() + ":" +  new Date().getSeconds());
    })
    .on("error", function (error) {
        console.log(error)
    });
   }

    function update_call(embed_code,custom_fields,label,cb){
      console.log(label)
        if((Date.now()/1000) < tokenExpiry){
            request({ method: 'PATCH', url: 'https://cms.api.brightcove.com/v1/accounts/' + accoundId + '/videos/ref:'+embed_code,
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json'
            },json:{
    
                "custom_fields":custom_fields,
                "tags":label  //tags should be cleared. Hence passing empty array
            }
            }, function (error, response, body) {   
                cb(error,response,body,custom_fields)               
        });
       
    }
        else{
            getTokenWithExpiry()
            update_call(embed_code,custom_fields,label,cb)
        
        }

    }


    function process_fechaexp(i,j,eechexp,fechaexp,fechaexp289){
        if(fechaexp!='NA')
        values[j]=fechaexp
        else if(eechexp!='NA')
        values[j]=eechexp
        else if(fechaexp289!='NA')
        values[j]=fechaexp289
        else
        values[j]="NA"

    }

    function process_fechapub(i,j,publc,publcion){
        if(publcion!='NA')
        values[j]=publcion
        else if(publc!='NA')
        values[j]=publc
        else
        values[j]="NA"
    }

    function process_idioma(i,j,idiom,idioma){
        if(idioma!='NA')
        values[j]=idioma
        else if(idiom!='NA')
        values[j]=idiom
        else
        values[j]="NA"
    }
    function process_keyword(i,j,key1,key2,key3,key4,key5,key6){

        if(key5!='NA')
        values[j]=key5
        else if(key4!='NA')
        values[j]=key4
        else if(key3!='NA')
        values[j]=key3
        else if(key2!='NA')
        values[j]=key2
        else if(key1!='NA')
        values[j]=key1
        else if(key6!='NA')
        values[j]=key6
        else
        values[j]="NA"
    }

    function process_rating(i,j,rating,ratings){
        if(rating!='NA')
        values[j]=rating
        else if(ratings!='NA')
        values[j]=ratings
        else
        values[j]="NA"

    }
    function process_registro(i,j,registro,registre){
        if(registro!='NA')
        values[j]=registro
        else if(registre!='NA')
        values[j]=registre
        else
        values[j]="NA"

    }
    function process_textbody(i,j,text_bdy){
        if(text_bdy=='NA')
        values[j]="NA"
        else if(text_bdy.length<=500)
        values[j]=text_bdy
        else
        values[j]=text_bdy.substr(0,1000)

    }

    function process_body(i,j,bdy){
        if(bdy=='NA'){
        values[j]="NA"
        values[j+1]="NA"
        
        }
        else if(bdy.length>1000){        
        values[j]=bdy.substr(0,1000)
        values[j+1]=bdy.substr(1000,bdy.length-1000)
        }
        else{
          values[j]=bdy;
        }
        

    }

    // Get Auth Token
    function getTokenWithExpiry() {
        const request = require('sync-request');
        const res = request('POST', 'https://oauth.brightcove.com/v4/access_token',
                         { headers: {
                         'Authorization': 'Basic ' + auth_string,
                         'Content-Type': 'application/x-www-form-urlencoded'
                         },
                         body: 'grant_type=client_credentials'});

        const token = JSON.parse(res.getBody('utf8'))
        accessToken = 'Bearer ' +token.access_token
        tokenExpiry = Math.floor(Date.now()/1000) + 270
        console.log('New AccessToken:- ', token.access_token);
    }