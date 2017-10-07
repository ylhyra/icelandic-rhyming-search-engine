for i in */*.xml; do
  echo "$i"
  sed -n 's/.*>\(.*\)<\/w.*/\1/p' $i >> output.txt
done

sed -e 's/./\L\0/g' output.txt > lowercase.txt

sort lowercase.txt | uniq -c | sort -bgr > sorted.txt
