const fs = require("fs");
const path = require("path");
const marked = require("marked");

console.log(__dirname);

const articlesDir = path.join(__dirname, "articles");
const distDir = path.join(__dirname, "dist/articles");
const post_template_path = "page_template.html";

const convertMarkdownToHtml = (filePath) => {
  const markdown = fs.readFileSync(filePath, "utf-8");
  return marked.parse(markdown);
};

const page_template = "" + fs.readFileSync(post_template_path);
const page_template_mtime = fs.statSync(post_template_path).mtime;

const updateHtmlIfNeeded = (markdownFile) => {
  console.log(markdownFile);
  const htmlFile = path.join(
    distDir,
    path.basename(markdownFile, ".md") + ".html",
  );

  const compiled_file_mtime = fs.statSync(htmlFile).mtime;

  // HTML 파일이 존재하지 않거나 소스의 날짜가 출력물보다 최신인 경우
  if (
    !fs.existsSync(htmlFile) ||
    fs.statSync(markdownFile).mtime > compiled_file_mtime ||
    page_template_mtime > compiled_file_mtime
  ) {
    let compiled = convertMarkdownToHtml(markdownFile);
    let html = page_template;
    html = html.replace("<SOURCE></SOURCE>", compiled);
    fs.writeFileSync(htmlFile, html);
    console.log(`Updated: ${htmlFile}`);
  } else {
    console.log(`${htmlFile} is up to date.`);
  }
};

// articles 폴더 내의 모든 .md 파일에 대해 업데이트 수행
fs.readdirSync(articlesDir).forEach((file) => {
  if (path.extname(file) === ".md") {
    const markdownFile = path.join(articlesDir, file);
    updateHtmlIfNeeded(markdownFile);
  }
});
