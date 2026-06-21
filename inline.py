import os

html_content = open('index.html', 'r', encoding='utf-8').read()

css_content = open('css/style.css', 'r', encoding='utf-8').read()
html_content = html_content.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css_content + '\n</style>')

js_files = ['auth.js', 'inventory.js', 'pos.js', 'reports.js', 'app.js']
for js in js_files:
    js_content = open('js/' + js, 'r', encoding='utf-8').read()
    html_content = html_content.replace(f'<script src="js/{js}"></script>', f'<script>\n{js_content}\n</script>')

open('index.html', 'w', encoding='utf-8').write(html_content)
print('Inlined successfully')
