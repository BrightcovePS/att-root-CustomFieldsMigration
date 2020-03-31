# ATT_CustomFieldsMigration
Migration script of custom metadata from Ooyala Backlot to custom fields in Brightcove VC.

Problem Statement:

Migration of assets and metadata from Ooyala to Brightcove was performed by appending all the metadata values to metadata fields in VC. But the custom metadata as custom fields needed to be migrated. Also '/' was appended with all the tags, so it needs to be removed.
There were a total of 59 custom metadata fields that needs to be mapped in videocloud. Note that a video doesn’t necessarily have data for all these fields. These 59 are the custom fields of AT&T account.

Solution:

We have prepared a separate custom metadata migration script to handle this particular migration. AT&T has already shared the list of custom fields needed so in our script we were calling the Ooyala API to retrieve the data from Ooyala and map it to the relevant fields for all the video id's.
We divide the call to Ooyala API into 3, the call to get asset metadata (player_id, ad_set_id, publishing_rule_id), the calls to get the full path of nested label, the calls to get the custom metadata. And after these calls, from the data dump that we created we make update calls to videocloud. These calls are implemented as follows:
1.	Initially we take the dump of all the assets from ooyala side using v2/assets. In this response we can get 4 metadata fields that come under custom metadata.
(ooyala_metadata_export.js)

2.	After having the dump of all the assets from Ooyala side, we now fetch the labels and custom metadata for each asset and create a new dump of all the 59 fields for all the assets.
If an asset doesn’t have a field, ‘NA’ will be placed. (ooyala_custom_metadata_init.js & ooyala_custom_metadata_export.js)

3.	Now we take each asset from the second dump and do the processing for the required columns and create the json object required to update the asset. (brightcove_custom_metadata_ingest.js)

How to run the scripts.

Install all the required node packages by running the command "npm install".
After installing all the node packages required.

1.	Update api_key, api_secret and accoundId in the file 'ooyyala_metdata_export.js' and run ooyala_metadata_export.js - This will fetch the embed codes and all the asset metadata and store it in a csv.
[ node ooyyala_metdata_export.js ]


2.	After 1, run ooyala_custom_metdata_init.js - This is to create the file with headers to store the custom metadata along with the previously fetched metadata and labels and custom metadata to be fetched.
[ node ooyala_custom_metdata_init.js ]
 

3.	After 2, Update api_key, api_secret and accoundId in the file 'ooyala_custom_metdata_export.js' and run ooyala_custom_metdata_export.js - This will fetch you the nested labels and all the required custom metadata for all assets based on the embed codes we got from STEP 1.
[ node ooyala_custom_metdata_export.js ]
 

4.	After 3, update the client_id, client_secret and accoundId in the file 'brightcove_custom_metadata_ingest.js' and run brightcove_custom_metadata_ingest.js - This will update the custom fields of videos and remove '/' in tags that are in brightcove based on the embed code (from ooyala) and reference id (from brightcove). Success log and Error logs will be created based on the response from videocloud.
[ node brightcove_custom_metadata_ingest.js ]

 
