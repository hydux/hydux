const { execSync } = require('child_process')
const changedFiles = execSync('git status')
  .toString().trim()
  .split('\n')
function changed(path) {
  return changedFiles
    .some(l => l.includes(path))
}
if (changed('src/') || changed('test/')) {
  execSync('npm test')
}

if (changed('src/')) {
  execSync('npm run build')
}

execSync('git add -A')
