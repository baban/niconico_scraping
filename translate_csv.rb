require 'csv'
require 'erb'

print "Hello"

path = "./2022静止画MADリスト - ニコニコ.csv"
list = CSV.read(path)
list.each do |row|
  p row
end
