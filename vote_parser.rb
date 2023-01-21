lines = readlines
print lines.map { |line| m = line.match(%r{(.+)/(.+?)\n}).to_a; m[1..2].map(&:strip).join("\t") }.join("\t")