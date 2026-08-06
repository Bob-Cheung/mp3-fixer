#!/bin/bash
set -e

echo "🚀 开始部署..."

# 1. 构建
echo "📦 构建项目中..."
npm run build

# 2. 记录当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 当前分支: $CURRENT_BRANCH"

# 3. 检查工作区是否有 dist/ 以外的未提交更改
DIRTY=$(git status --porcelain | grep -v '^.[M ] dist/' || true)
if [[ -n "$DIRTY" ]]; then
  echo "⚠️  警告: 工作区有未提交的更改（dist/ 除外），请先提交或暂存。"
  echo "$DIRTY"
  exit 1
fi

# 4. 删除旧的本地 gh-pages 分支（如果存在）
if git show-ref --verify --quiet refs/heads/gh-pages; then
  echo "🗑️  删除旧的本地 gh-pages 分支..."
  git branch -D gh-pages
fi

# 5. 创建孤儿分支（无历史记录）
echo "🌿 创建新的 gh-pages 分支..."
git checkout --orphan gh-pages

# 6. 清空所有内容
git rm -rf --ignore-unmatch . 2>/dev/null || true

# 7. 复制 dist 内容到根目录
echo "📋 复制构建产物..."
cp -r dist/* .

# 8. 添加 .nojekyll（防止 GitHub Pages 忽略以下划线开头的文件）
touch .nojekyll

# 9. 添加文件
git add index.html assets/ .nojekyll

# 10. 提交
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m "Deploy: ${TIMESTAMP}" --no-verify

# 11. 强制推送到远程
echo "📤 推送到远程..."
git push origin gh-pages --force

# 12. 返回原分支
echo "🔙 返回 $CURRENT_BRANCH 分支..."
git checkout "$CURRENT_BRANCH"

echo "✅ 部署完成!"
