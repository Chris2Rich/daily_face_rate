const axios = require('axios');

const day = Math.floor(((new Date().getTime()) - 1724022000000) / 86400000)
let daily_data = null

const data_get = JSON.stringify({
  "collection": "data",
  "database": "data",
  "dataSource": "raterandoms",
  "pipeline": [{
    $project: {
      nthObject: { $arrayElemAt: ["$data", day] }
    }
  }]
})

let data_post = null

const config_get = {
  method: 'post',
  url: 'https://eu-west-2.aws.data.mongodb-api.com/app/data-yiwnmcn/endpoint/data/v1/action/aggregate',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Request-Headers': '*',
    'api-key': process.env.mongokey,
  },
  data: data_get
}

const config_post = {
  method: 'post',
  url: 'https://eu-west-2.aws.data.mongodb-api.com/app/data-yiwnmcn/endpoint/data/v1/action/updateOne',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Request-Headers': '*',
    'api-key': process.env.mongokey,
  },
  data: data_post
}

async function get_data(){
  const response = await axios(config_get)
  daily_data = response.data.documents[0].nthObject
  return
}

async function post_data(){
  const response = await axios(config_post)
  await get_data()
  return
}

function parse_url(s){
  let res_buffer = []
  let buffer = ""
  let c = 0
  for(let i = 0; i < s.length; i++){
    if(s[i] == "/"){
      c++;
      if(buffer){
        res_buffer.push(buffer)
        buffer = ""
      }
    } else {
      buffer += s[i]
    }
  }
  return res_buffer.slice(1)
}

module.exports = async (req, res) => {
  if(daily_data == null){
    await get_data()
  }

  const url_data = parse_url(req.url)
  switch(url_data[0]){
    case "rate":
      Object.assign(config_post, {data: JSON.stringify({
        "collection": "data",
        "database": "data",
        "dataSource": "raterandoms",
        "filter": { "_id": { "$oid": "66c388c15108060f7786c50c" } },
        "update": {
          "$set": {
          [`data.${day}.r`]: ((daily_data["r"] * daily_data["n"]) + Number(url_data[2])) / (daily_data["n"] + 1),
          [`data.${day}.n`]: (daily_data["n"] + 1)
          }
        }
      })})

      await post_data()

      res.status(200).json(daily_data)
      console.log(daily_data, url_data[2])
      break
    case "face":
      res.status(200).json(daily_data)
      break
    default:
      res.status(404).json({error: 404})
      break
  }
  return
}