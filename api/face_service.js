const axios = require('axios');

//const day = Math.floor(((new Date().getTime()) - 1724022000000) / 86400000)
const day = 6
let db_data = null
let daily_data = null

async function get_data(){
  db_data = await axios({
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
  })[0]

  console.log(db_data)

  // daily_data = await axios({
  //   method: 'post',
  //   url: process.env.DATA_API_URL + '/action/aggregate',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Access-Control-Request-Headers': '*',
  //     'api-key': process.env.DATA_API_KEY,
  //   },
  //   data: {
  //     "collection": "data",
  //     "database": "data",
  //     "dataSource": "raterandoms",
  //     "pipeline": [{
  //       $project: {
  //         nthObject: { $arrayElemAt: ["$daily", day] }
  //       }
  //     }]
  //   }
  // })

  // Object.assign(db_data, {"daily" : daily_data})
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
  const url_data = parse_url(req.url)
  await get_data()

  switch(url_data[0]){
    // case "rate":

    //   res.status(200).json(db_data[url_data[3]][url_data[1]])
    //   break
    case "face":
      res.status(200).json(db_data)
      break
    default:
      res.status(404).json({error: 404})
      break
  }
  return
}