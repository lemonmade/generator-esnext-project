import _ from 'lodash';
import {Base as BaseGenerator} from 'yeoman-generator';

module.exports = class ESNextProjectReadmeGenerator extends BaseGenerator {
  constructor(...args) {
    super(...args);

    this.option('name', {
      type: String,
      required: true,
      desc: 'Project name',
    });

    this.option('coveralls', {
      type: Boolean,
      required: true,
      desc: 'Include coveralls badge',
    });

    this.option('githubAccount', {
      type: Boolean,
      required: true,
      desc: 'Github account',
    });

    this.option('authorName', {
      type: String,
      required: true,
      desc: 'Author name',
    });

    this.option('authorURL', {
      type: String,
      required: true,
      desc: 'Author URL',
    });

    this.option('travis', {
      type: Boolean,
      required: true,
      desc: 'Include travis badge',
    });

    this.option('coveralls', {
      type: Boolean,
      required: true,
      desc: 'Include coveralls badge',
    });

    this.option('content', {
      type: String,
      required: false,
      desc: 'README content',
    });
  }

  initializing() {
    this.props = {...this.options};
  }

  writing() {
    let {props} = this;

    let pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      {
        projectName: props.name,
        safeProjectName: _.camelCase(props.name),
        description: props.description,
        githubAccount: props.githubAccount,
        author: {
          name: props.authorName,
          url: props.authorURL,
        },
        license: pkg.license,
        includeCoveralls: props.coveralls,
        includeTravis: props.travis,
        content: props.content,
      }
    );
  }
};
