git checkout dev
git add .
git commit -m "New Update"
git checkout main
git pull
git merge dev
git push -u origin
git branch -d dev
git branch dev
git checkout dev