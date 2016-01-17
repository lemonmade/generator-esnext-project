import '../../helper';

import _ from 'lodash';
import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

describe('generator-esnext-project:readme', () => {
  const generatorIndex = path.join(__dirname, '../../../src/readme');
  const name = 'my-project';
  const author = 'Chris Sauve';
  const authorURL = 'https://github.com/lemonmade';
  const description = 'a cool project';
  const license = 'MIT';
  const github = 'lemonmade';
  let defaultOptions = {
    name,
    description,
    githubAccount: github,
    authorName: author,
    authorURL: authorURL,
    travis: true,
    coveralls: true,
  };

  function writeBasicPackage(gen) {
    gen.fs.writeJSON(gen.destinationPath('package.json'), {license});
  }

  describe('defaults', () => {
    beforeEach((done) => {
      helpers
        .run(generatorIndex)
        .withOptions(defaultOptions)
        .on('ready', writeBasicPackage)
        .on('end', done);
    });

    it('creates and fill contents in README.md', () => {
      assert.file('README.md');
      assert.fileContent('README.md', `> ${description}`);
      assert.fileContent('README.md', `import ${_.camelCase(name)} from '${name}';`);
      assert.fileContent('README.md', `$ npm install --save ${name}`);
      assert.fileContent('README.md', `${license} © [${author}](${authorURL})`);
      assert.fileContent('README.md', `[travis-image]: https://travis-ci.org/${github}/${name}.svg?branch=master`);
      assert.fileContent('README.md', 'coveralls');
    });
  });

  describe('--content', () => {
    const content = 'My custom content!';

    beforeEach((done) => {
      helpers
        .run(generatorIndex)
        .withOptions({...defaultOptions, content})
        .on('ready', writeBasicPackage)
        .on('end', done);
    });

    it('uses the custom content instead of install instructions', () => {
      assert.fileContent('README.md', `> ${description}`);
      assert.fileContent('README.md', content);
      assert.noFileContent('README.md', `let ${_.camelCase(name)} = require('${name}');`);
      assert.noFileContent('README.md', `$ npm install --save ${name}`);
    });
  });

  describe('--no-coveralls', () => {
    beforeEach((done) => {
      helpers
        .run(generatorIndex)
        .withOptions({...defaultOptions, coveralls: false})
        .on('ready', writeBasicPackage)
        .on('end', done);
    });

    it('does not include any coveralls information', () => {
      assert.noFileContent('README.md', 'coveralls');
    });
  });
});
