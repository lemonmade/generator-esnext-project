import _ from 'lodash';
import {Base as BaseGenerator} from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
import parseAuthor from 'parse-author';

module.exports = class EsnextProjectGenerator extends BaseGenerator {
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
  }

  initializing() {
    let {options, fs} = this;
    let pkg = fs.readJSON(this.destinationPath('package.json'), {});

    let packageAuthor = getPackageAuthor(pkg);

    this.props = {
      name: options.name || pkg.name,
      description: options.description || pkg.description,
      version: pkg.version || '0.0.1',
      keywords: pkg.keywords || [],
      authorName: options.authorName || packageAuthor.name,
      authorEmail: options.authorEmail || packageAuthor.email,
    };
  }

  prompting() {
    let done = this.async();
    let {props, user} = this;

    this.log(yosay(`Welcome to the ${chalk.red('esnext-project')} generator!`));

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
        name: 'keywords',
        message: 'Package keywords (comma-separated)',
        when: props.keywords.length === 0,
      },
    ];

    this.prompt(prompts, (newProps) => {
      this.props = {...props, ...newProps};
      done();
    });
  }

  writing() {
    let {fs, props} = this;

    // Re-read the content at this point because a composed generator might modify it.
    let pkg = fs.readJSON(this.destinationPath('package.json'), {});

    let packageUpdates = {
      name: _.kebabCase(props.name),
      version: props.version,
      description: props.description,
      keywords: commaSeparated(props.keywords),
      author: {
        name: props.authorName,
        email: props.authorEmail,
      },
    };

    // Let's extend package.json so we're not overwriting user previous fields
    fs.writeJSON('package.json', _.merge(pkg, packageUpdates));

    if (!fs.exists(this.destinationPath('.npmignore'))) {
      fs.copy(
        this.templatePath('npmignore'),
        this.destinationPath('.npmignore')
      );
    }
  }
};

function commaSeparated(words) {
  if (words.constructor === Array) { return words; }
  return words.split(/\s*,\s*/g);
}

function getPackageAuthor(pkg) {
  if (_.isObject(pkg.author)) {
     return pkg.author;
  }

  if (_.isString(pkg.author)) {
    let info = parseAuthor(pkg.author);
    return {name: info.name, email: info.email};
  }

  return {};
}
