humctl api POST /orgs/htc-demo-04/resources/defs -d \
'{
  "id": "static-tod-2",
  "name": "Static TOD 2",
  "org_id": "htc-demo-04",
  "type": "s3",
  "driver_type": "humanitec/static",
  "driver_inputs": {
    "values": {
      "url": "https://ratkefaheyvandervortbradtkegraham.newapp.io/static/time"
    }
  },
  "criteria": [
    {
      "app_id": "adktest-3",
      "env_id": "static-stage"
    }
  ]
}'
