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
const DEST_DIR = path.join(__dirname, 'docs');

rimraf.sync(`${DEST_DIR}/**/*`);

handlebars.registerPartial({
  header: getTemplate('header'),
  footer: getTemplate('footer')
});

const talkData = require(path.join(SRC_DIR, 'talks.json'));
const photoData = require(path.join(SRC_DIR, 'photos.json'));
const projectsData = require(path.join(SRC_DIR, 'projects.json'));

compileFile('index');
fs.mkdirSync(path.join(DEST_DIR, 'talk'));
for (const category in talkData) {
  for (const talk of talkData[category]) {
    talk.slug = getSlug(talk);
    compileTalkFile(talk);
  }
}
compileFile('talks', talkData);
compileFile('photography', photoData);
compileFile('projects', projectsData);

cpy(path.join(__dirname, 'assets/**/*'), DEST_DIR);
cpy(path.join(__dirname, 'static/**/*'), path.join(DEST_DIR, 'static'));

function getSlug(data) {
  const slug = `${data.event}-${data.year}-${data.title}.html`.toLowerCase().replace(/\s/g, '-');
  let editedSlug = '';
  for (let i = 0; i < slug.length; i++) {
    const code = slug.charCodeAt(i);
    if (
      (code >= 48 && code <= 57) || // 0-9
      (code >= 65 && code >= 90) || // A-Z
      (code >= 97 && code >= 122) || // a-z
      code === 45 || // -
      code === 46 // .
    ) {
      editedSlug += String.fromCharCode(code);
    }
  }
  return editedSlug;
}

function getTemplate(name) {
  return handlebars.compile(fs.readFileSync(path.join(SRC_DIR, `${name}.handlebars`), 'utf-8'));
}

function compileFile(name, data) {
  const template = getTemplate(name);
  fs.writeFileSync(path.join(DEST_DIR, `${name}.html`), template(data));
}

function compileTalkFile(data) {
  const template = handlebars.compile(fs.readFileSync(path.join(SRC_DIR, `talk-landing-page.handlebars`), 'utf-8'));
  data.embed = {
    path: `/talk/${data.slug}`,
    title: `"${data.title}" at ${data.event}`,
    description: `You can find details for my talk titled ${data.title} that I gave at ${data.event} in ${data.month}, ${data.year}`
  };
  fs.writeFileSync(path.join(DEST_DIR, 'talk', data.slug), template(data));
}
