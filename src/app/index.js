import _ from 'lodash';
import {Base as BaseGenerator} from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
import path from 'path';
import githubUsername from 'github-username';
import packageName from 'inquirer-npm-name';

module.exports = class ESNextProjectGenerator extends BaseGenerator {
  constructor(...args) {
    super(...args);

    this.option('name', {
      type: String,
      required: false,
      desc: 'Project name',
    });

    this.option('description', {
      type: String,
      required: false,
      desc: 'Project description',
    });

    this.option('githubAccount', {
      type: String,
      required: false,
      desc: 'The package author\'s Github account',
    });

    this.option('authorName', {
      type: String,
      required: false,
      desc: 'The package author\'s name',
    });

    this.option('authorEmail', {
      type: String,
      required: false,
      desc: 'The package author\'s email',
    });

    this.option('eslint', {
      type: Boolean,
      required: false,
      desc: 'Include eslint config',
    });

    this.option('travis', {
      type: Boolean,
      required: false,
      desc: 'Include travis config',
    });

    this.option('coveralls', {
      type: Boolean,
      required: false,
      desc: 'Include coveralls config',
    });

    this.option('readme', {
      type: String,
      required: false,
      desc: 'Content to insert in the README',
    });
  }

  initializing() {
    let {options} = this;

    this.props = {
      name: options.name,
      description: options.description,
      authorName: options.authorName,
      authorEmail: options.authorEmail,
      githubAccount: options.githubAccount,
      eslint: options.eslint,
      editorconfig: options.editorconfig,
      travis: options.travis,
      coveralls: options.coveralls,
      readme: options.readme,
    };
  }

  get prompting() {
    return {
      start() {
        if (!this.options.skipWelcomeMessage) {
          this.log(yosay(`Welcome to the ${chalk.red('esnext-project')} generator!`));
        }
      },

      projectName() {
        let {props} = this;
        let pkg = this.fs.readJSON('package.json', {});

        if (props.name || pkg.name) {
          props.name = pkg.name || _.kebabCase(props.name);
          return;
        }

        let done = this.async();

        packageName({
          name: 'name',
          message: 'Module Name',
          default: path.basename(process.cwd()),
          filter: _.kebabCase,
          validate(str) { return str.length > 0; },
        }, this, (name) => {
          this.props.name = name;
          done();
        });
      },

      otherDetails() {
        let done = this.async();
        let {props, user} = this;

        let prompts = [
          {
            name: 'name',
            message: 'Project name',
            when: props.name == null,
          },

          {
            name: 'description',
            message: 'Project description',
            when: props.description == null,
          },

          {
            name: 'authorName',
            message: 'Package author\'s name',
            when: props.authorName == null,
            default: user.git.name(),
            store: true,
          },

          {
            name: 'authorEmail',
            message: 'Package author\'s email',
            when: props.authorEmail == null,
            default: user.git.email(),
            store: true,
          },

          {
            name: 'eslint',
            message: 'Include eslint config',
            type: 'confirm',
            when: props.eslint == null,
            default: true,
            store: true,
          },

          {
            name: 'editorconfig',
            message: 'Include editor config',
            type: 'confirm',
            when: props.editorconfig == null,
            default: true,
            store: true,
          },

          {
            name: 'travis',
            message: 'Include travis config',
            type: 'confirm',
            when: props.travis == null,
            default: true,
            store: true,
          },

          {
            name: 'coveralls',
            message: 'Include coveralls config',
            type: 'confirm',
            when: props.coveralls == null,
            default: true,
            store: true,
          },
        ];

        this.prompt(prompts, (newProps) => {
          this.props = {...props, ...newProps};
          done();
        });
      },

      githubUsername() {
        let done = this.async();

        githubUsername(this.props.authorEmail, (err, username) => {
          this.prompt({
            name: 'githubAccount',
            message: 'GitHub username or organization',
            default: username,
          }, (prompt) => {
            this.props.githubAccount = prompt.githubAccount;
            done();
          });
        });
      },
    };
  }

  defaults() {
    let {props, options: {skipInstall}} = this;
    let skipWelcomeMessage = true;
    let pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    this.composeWith(
      'esnext-project:package',
      {options: {...props, skipInstall, skipWelcomeMessage}},
      {local: require.resolve('../package')}
    );

    if (!this.fs.exists(this.destinationPath('.git'))) {
      this.composeWith(
        'node:git',
        {options: {skipInstall, githubAccount: props.githubAccount, name: props.name}},
        {local: require.resolve('generator-node/generators/git')}
      );
    }

    if (!pkg.license) {
      this.composeWith(
        'license',
        {options: {name: props.authorName, email: props.authorEmail}},
        {local: require.resolve('generator-license/app')}
      );
    }

    if (!this.fs.exists(this.destinationPath('README.md'))) {
      this.composeWith(
        'esnext-project:readme',
        {options: {...props, skipInstall, skipWelcomeMessage}},
        {local: require.resolve('../readme')}
      );
    }

    if (props.eslint) {
      this.composeWith(
        'eslint-config:app',
        {options: {skipInstall, skipWelcomeMessage, babel: true}},
        {local: require.resolve('generator-eslint-config/generators/app')}
      );
    }

    if (props.editorconfig) {
      this.composeWith(
        'node:editorconfig',
        {options: {skipInstall, skipWelcomeMessage}},
        {local: require.resolve('generator-node/generators/editorconfig')}
      );
    }

    if (props.travis) {
      this.composeWith(
        'travis',
        {options: {skipInstall, skipWelcomeMessage}},
        {local: require.resolve('generator-travis/generators/app')}
      );
    }
  }
};
