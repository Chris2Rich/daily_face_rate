const axios = require('axios');

//const day = Math.floor(((new Date().getTime()) - 1724022000000) / 86400000)
const day = 6
let db_data = null
let daily_data = null

async function get_data(){
  const r1 = await axios({
    method: 'post',
    url: process.env.DATA_API_URL + '/action/aggregate',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': process.env.DATA_API_KEY,
    },
    data: {
      "collection": "data",
      "database": "data",
      "dataSource": "raterandoms",
      "pipeline": [{
        $project: {
          athletes: 1,
          rappers: 1,
          creators: 1,
          _id: 0
        }
      }]
    }
  })

  db_data = r1.data.documents[0]

  const r2 = await axios({
    method: 'post',
    url: process.env.DATA_API_URL + '/action/aggregate',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': process.env.DATA_API_KEY,
    },
    data: {
      "collection": "data",
      "database": "data",
      "dataSource": "raterandoms",
      "pipeline": [{
        $project: {
          nthObject: { $arrayElemAt: ["$daily", day] }
        }
      }]
    }
  })

  daily_data = r2.data.documents[0].nthObject
  Object.assign(db_data, {"daily" : daily_data})
  return
}

async function set_data(url_data){
  let category = url_data[3] === "daily" ? `daily.${day}` : url_data[3];

  const obj = db_data[url_data[3]][url_data[1]]
  obj["r"] = ((Number(obj["r"]) * Number(obj["n"])) + Number(url_data[2])) / (Number(obj["n"]) + 1)
  obj["n"] = Number(obj["n"]) + 1

  const response = await axios({
    method: 'post',
    url: process.env.DATA_API_URL + '/action/updateOne',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': process.env.DATA_API_KEY,
    },
    data: {
      "collection": "data",
      "database": "data",
      "dataSource": "raterandoms",
      "filter": {},
      "update": {
        $set: {
          [`${category}.${url_data[1]}.r`]: obj["r"],
          [`${category}.${url_data[1]}.n`]: obj["n"]
        }
      }
    }
  })
  return obj
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
  const url_data = parse_url(req.url)
  if(db_data == null){
    await get_data()
  }

  switch(url_data[0]){
    case "rate":
      const db_res = await set_data(url_data)
      res.status(200).json(db_res)
      break
    case "face":
      res.status(200).json(db_data)
      break
    default:
      res.status(404).json({error: 404})
      break
  }
  return
}