#! /bin/bash
echo "================================"
echo ""
echo "可选参数:"
echo "1 - 提交更新"
echo "2 - 上线"
echo "3 - 同步master"
echo "4 - 列出提交过的tag列表"
echo "other - 自定义commit提交"
echo ""
echo "请输入您的选择: $1"

commit_message="update";

if test -z "$1"
then
    read dataOne
else
    dataOne=$1
fi

case ${dataOne} in
  1)
    commit_message="update"
   ;;
  2)
    commit_message="release new version"
  ;;
  3)
    git status && git add -A && git commit -m "commit for merge" && git pull origin master
    exit
  ;;
  4)
    git tag --sort version:refname
    exit
  ;;
  *)
    commit_message=${dataOne};
  ;;
esac

branch_list=$(git branch | grep '*')
current_branch=${branch_list:2}

git status && git add -A && git commit -m "${commit_message}" && git push origin ${current_branch}