import '../../helper';

import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import mockery from 'mockery';

describe('generator-esnext-project:package', () => {
  const generatorIndex = path.join(__dirname, '../../../src/package');
  let defaultOptions;

  beforeEach(() => {
    defaultOptions = {
      name: 'my-package',
      description: 'My package',
      authorName: 'Chris Sauve',
      authorEmail: 'chris.sauve@shopify.com',
    };
  });

  describe('defaults', () => {
    context('when run on a new project', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withOptions(defaultOptions)
          .on('end', done);
      });

      it('creates the required files', () => {
        assert.file([
          'package.json',
          '.npmignore',
        ]);
      });

      it('fills out the package.json file', () => {
        assert.jsonFileContent('package.json', {
          name: defaultOptions.name,
          description: defaultOptions.description,
          author: {
            name: defaultOptions.authorName,
            email: defaultOptions.authorEmail,
          },
        });
      });
    });

    context('when run on an existing project', () => {
      const originalName = 'foo-bar-project';
      let originalPackage = {
        name: originalName,
        description: 'Something special.',
        author: 'Chris Sauve',
      };

      beforeEach((done) => {
        let {name, ...defaultsExcludingName} = defaultOptions;

        helpers
          .run(generatorIndex)
          .withOptions(defaultsExcludingName)
          .on('ready', (gen) => gen.fs.writeJSON('package.json', originalPackage))
          .on('end', done);
      });

      it('overwrites existing data for which options are provided', () => {
        assert.jsonFileContent('package.json', {
          name: originalName,
          description: defaultOptions.description,
          author: {
            name: defaultOptions.authorName,
            email: defaultOptions.authorEmail,
          },
        });
      });
    });
  });

  describe('--keywords', () => {
    const keywords = ['foo', 'bar'];

    beforeEach((done) => {
      helpers
        .run(generatorIndex)
        .withPrompts({keywords: keywords.join(', ')})
        .on('end', done);
    });

    it('includes the keywords in the package file', () => {
      assert.jsonFileContent('package.json', {keywords});
    });
  });

  describe('version', () => {
    context('when none previously existed', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withOptions(defaultOptions)
          .on('end', done);
      });

      it('adds a default version', () => {
        assert.jsonFileContent('package.json', {
          version: '0.0.1',
        });
      });
    });

    context('when a previous version existed', () => {
      const version = '1.2.3';

      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withOptions(defaultOptions)
          .on('ready', (gen) => gen.fs.writeJSON('package.json', {version}))
          .on('end', done);
      });

      it('uses the existing version', () => {
        assert.jsonFileContent('package.json', {version});
      });
    });
  });

  describe('author', () => {
    const authorName = 'Chris Sauve';
    const authorEmail = 'chris.sauve@shopify.com';

    context('when no package.json entry', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withOptions({authorName, authorEmail})
          .on('end', done);
      });

      it('uses the passed name and email', () => {
        assert.jsonFileContent('package.json', {
          author: {
            name: authorName,
            email: authorEmail,
          },
        });
      });
    });

    context('when there is a string package.json entry', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .on('ready', (gen) => {
            gen.fs.writeJSON('package.json', {
              author: `${authorName} <${authorEmail}>`,
            });
          })
          .on('end', done);
      });

      it('normalizes it into an object', () => {
        assert.jsonFileContent('package.json', {
          author: {
            name: authorName,
            email: authorEmail,
          },
        });
      });
    });

    context('when there is an object package.json entry', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .on('ready', (gen) => {
            gen.fs.writeJSON('package.json', {
              author: {
                name: authorName,
                email: authorEmail,
              },
            });
          })
          .on('end', done);
      });

      it('uses does not change anything', () => {
        assert.jsonFileContent('package.json', {
          author: {
            name: authorName,
            email: authorEmail,
          },
        });
      });
    });
  });
});
