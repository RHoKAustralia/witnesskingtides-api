require 'json'
require 'pry'
require 'net/http'
require 'date'

def convert_date_range date_range_baloney
  date_range_in_parts = date_range_baloney.match(/([0-9]+) ?([a-zA-Z]+)?-([0-9]+) ([a-zA-Z]+)/)
  if date_range_in_parts[2]
    event_start = "#{date_range_in_parts[1]} #{date_range_in_parts[2]}"
  else
    event_start = "#{date_range_in_parts[1]} #{date_range_in_parts[4]}"
  end
  event_end = "#{date_range_in_parts[3]} #{date_range_in_parts[4]}"
  { event_start: Date.strptime(event_start, "%d %B"),
    event_end: Date.strptime(event_end, "%d %B") }
end
API_URL = 'http://kingtides-api-env-fubbpjhd29.elasticbeanstalk.com'
#API_URL = 'http://localhost:3000' # change depending on server settings
config = JSON.parse(File.read("../config.json"))
CORS_WHITELISTED_URL = config["WKT_CORS_WHITELIST"].split(",")[0]
tide_data = JSON.parse(File.read("./tide_data.json"))
tide_data.each do |state, values|
  values["areaInfo"].each do |area|
    date_range = convert_date_range area["dateRange"]
    lat_long = area["latLng"].split(",")

    upload_area = {
      location: area['name'],
      state: state,
      highTideOccurs: Date.strptime(area["dateTime"], "%d %B, %H.%M%p"),
      eventStart:date_range[:event_start],
      eventEnd:date_range[:event_end],
      latitude:lat_long[0],
      longitude:lat_long[1]
    }
    # puts upload_area.to_json
    uri = URI(API_URL+'/tides')
    req = Net::HTTP::Post.new(uri, initheader = {'Content-Type' =>'application/json', 'Origin' => CORS_WHITELISTED_URL})
    req.body = upload_area.to_json
    response = Net::HTTP.new(uri.hostname, uri.port).start {|http| http.request(req) }
    puts response.body
  end
end
