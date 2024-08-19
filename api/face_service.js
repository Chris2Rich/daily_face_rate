const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://database:password@raterandoms.uyloh.mongodb.net/?retryWrites=true&w=majority&appName=raterandoms";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

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

const sheet = "https://docs.google.com/spreadsheets/d/1anARMqhMX6i8BlS-fdE9vzIalkY-9czM6ixZYQsYPUA/edit?gid=0#gid=0"

module.exports = (req, res) => {
  const data = parse_url(req.url)
  if(data[0] == "rate"){
    res.status(200).json({data : parse_url(req.url)})
  }
}