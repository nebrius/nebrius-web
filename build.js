/*
Copyright (C) 2017 Bryan Hughes <bryan@nebri.us>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const cpy = require('cpy');
const rimraf = require('rimraf');

const SRC_DIR = path.join(__dirname, 'src');
const DEST_DIR = path.join(__dirname, 'dist');

rimraf.sync(`${DEST_DIR}/**/*`);

handlebars.registerPartial({
  header: getTemplate('header'),
  footer: getTemplate('footer')
});

compileFile('index');
compileFile('talks');
compileFile('photography');

cpy(path.join(__dirname, 'assets/**/*'), DEST_DIR);
cpy(path.join(__dirname, 'static/**/*'), path.join(DEST_DIR, 'static'));

function getTemplate(name) {
  return handlebars.compile(fs.readFileSync(path.join(SRC_DIR, `${name}.handlebars`), 'utf-8'));
}

function compileFile(name) {
  const template = getTemplate(name);
  fs.writeFileSync(path.join(DEST_DIR, `${name}.html`), template());
}

