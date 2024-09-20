let Fs = require("fs");
let Path = require("path");
let Marked = require("marked");

function compile_articles() {
    let articles_dir = Path.join(__dirname, "articles");
    let articles_output_dir = Path.join(__dirname, "dist/articles");
    let post_template_path = "page_template.html";

    let compile_markdown = (file_path) => {
        let markdown = Fs.readFileSync(file_path, "utf-8");
        return Marked.parse(markdown);
    };

    let page_template = "" + Fs.readFileSync(post_template_path);
    let page_template_mtime = Fs.statSync(post_template_path).mtime;

    let update_article_html = markdown_file => {
        let output_file = Path.join(
            articles_output_dir,
            Path.basename(markdown_file, ".md") + ".html",
        );

        let compiled_file_mtime = Fs.statSync(output_file).mtime;

        if (
            !Fs.existsSync(output_file) ||
            Fs.statSync(markdown_file).mtime > compiled_file_mtime ||
            page_template_mtime > compiled_file_mtime
        ) {
            let compiled = compile_markdown(markdown_file);
            let html = page_template;
            html = html.replace("<SOURCE></SOURCE>", compiled);
            Fs.writeFileSync(output_file, html);
            console.log(`Updated: ${output_file}`);
        }
        else {
            console.log(`${output_file} is up to date.`);
        }
    };

    Fs.readdirSync(articles_dir).forEach(file => {
        if (Path.extname(file) === ".md") {
            let markdownFile = Path.join(articles_dir, file);
            update_article_html(markdownFile);
        }
    });
}

async function update_article_list() {
    const get_article_list = (directory, limit = 5) => {
        return new Promise(res => {
            Fs.readdir(directory, (err, files) => {
                if (err) {
                    return console.error('Error reading directory:', err);
                }
            
                const file_details = files.flatMap(file => {
                    if (Path.extname(file) != '.md') {
                        return [];
                    }
                    let slug = Path.basename(file, '.md');
                    return [{
                        slug,
                        title: JSON.parse(
                            Fs.readFileSync(Path.join('meta', slug + '.json'))).title,
                        mtime: Fs.statSync(Path.join(directory, file)).mtime,
                    }];
                });
            
                file_details.sort((a, b) => b.mtime - a.mtime);
            
                res(file_details);
            });
        });
    };
    
    Fs.writeFileSync('article_list.json',
        JSON.stringify(await get_article_list('articles')));
}

update_article_list();
