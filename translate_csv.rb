require 'csv'
require 'erb'

path = "./2022静止画MADリスト - ニコニコ.csv"
list = CSV.read(path)

result = ERB.new(File.read("template.html.erb")).result(binding)

File.open('list.html', 'w') do |f|
  f<< result
end
