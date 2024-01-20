import requests
import json
import csv

from bs4 import BeautifulSoup

#APIのエンドポイント
url = "https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search"
#検索結果をまとめる辞書（普段はリストでやりますがなんとなく辞書型でやってみた）

def editorName(userId):
  url = "https://www.nicovideo.jp/user/" + str(userId)
  html = requests.get(url)
  soup = BeautifulSoup(html.content, "html.parser")
  s = soup.find("script", type="application/ld+json").text
  h = json.loads(s)
  print(userId)
  return h['name']

def nico(start,end, offset):
  #検索結果の取得可能な最大数は１００件なので、日付期間で分けてデータを取得する
  #(fromとtoで期間を指定)
  filter = json.dumps(
    {
      "type": "or",
      "filters": [
      {
        "type": "range",
        "field": "startTime",
        "from": start,
        "to": end,
        "include_lower": True
      }
      ]
    }
  )
  #qは検索キーワード、タグを検索対象とし、動画タイトルとタグを取得する
  param = {
    "q":"静止画MAD",
    "targets":"tags",
    "_sort":"-startTime",
    "fields":"title,userId,contentId,thumbnailUrl",
    "_offset": offset,
    "_limit": 100,
    "jsonFilter":filter
  }
  #上記のfilterとparamsでAPIを使って検索実施
  #data = requests.get(url,params=param).json()["data"]
  data = requests.get(url,params=param).json()["data"]
  print(data)
  results = []
  for i in data:
    h = { "title": i['title'], "editor": editorName(i['userId']), "url": "https://www.nicovideo.jp/watch/" + i["contentId"], "thumbnail": i["thumbnailUrl"] }
    h['editor'] = h['editor']
    results.append(h)
  return results

def write_csv(urls):
  # CSVファイルを開く
  with open('list.csv', 'w', newline='') as csv_file:
    # CSVライターを作成する
    writer = csv.writer(csv_file)
    # ヘッダーを書き込む
    writer.writerow(['title', 'editor', 'url', 'src'])
    # ハッシュの情報を書き込む
    for h in urls:
      writer.writerow([h['title'], h['editor'], h['url'], h['thumbnail']])

#print(editorName(18317506))

offset = 0
urls = []
while True:
  results = nico(f"2023-01-01T00:00:00+09:00", f"2023-12-31T23:59:59+09:00", offset * 100)
  urls.extend(results)
  offset += 1
  if len(results) == 0:
    break

# 結果件数の出力
#print(urls)
write_csv(urls)