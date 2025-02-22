#!/usr/bin/env node

const exec = require('sync-exec');
const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');
const prompt = require('prompt-sync')();

const optionDefinitions = [
  {
    name: 'source',
    type: String,
    multiple: true,
    description: 'Source repositories to fetch commits',
  },
  {
    name: 'destination',
    type: String,
    description: 'Destination repository to sync contributions into',
  },
  {
    name: 'days',
    type: Number,
    description: 'Specify the number of days back to include',
    defaultValue: 5000,
  },
  {
    name: 'folder-depth',
    type: Number,
    description:
      'Specify the level of subfolders to look for repos (default: 1)',
    defaultValue: 1,
  },
  {
    name: 'reset',
    type: Boolean,
    description: 'Reset the destination repository',
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    defaultOption: true,
    defaultValue: false,
  },
  {
    name: 'silent',
    type: Boolean,
    description: 'Will not prompt',
    defaultValue: false,
  },
  {
    name: 'author',
    type: String,
    description:
      'Author name',
  },
  {
    name: 'project',
    type: String,
    description:
      'Project name',
  },
];

const options = commandLineArgs(optionDefinitions);

if (options.help === true || !options.source || !options.destination) {
  const sections = [
    {
      header: 'sync-external-contributions',
      content:
        'Synchronize your external contributions into your GitHub account',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
  ];

  const usage = getUsage(sections);
  console.log(usage);
}

if (!options['dry-run'] && options.reset) {
  let resetPrompt;

  if (!options.silent) {
    resetPrompt = prompt(
      `Are you sure you want to reset ${options.destination}? (N/y) `,
    );
  } else {
    resetPrompt = 'y';
  }

  if (['y', 'Y'].includes(resetPrompt)) {
    const firstCommit = '`git rev-list --all | tail -1`';
    const resetStdout = exec(
      `cd ${options.destination} && git reset --hard ${firstCommit}`,
    ).stdout;

    if (resetStdout && !options.silent) {
      console.log(`${options.destination} were successfully reset.`);
    } else {
      console.log(
        'An error occured while resetting the destination repository',
      );
    }
  }
}

const { stdout } = exec(
  `cd ${options.source} && git standup -d ${options.days} -m ${options['folder-depth']} -a ${options.author ? `"${options.author}"` : ''} -D iso-strict`,
);

const commits = stdout.split('\n').reduce((formattedCommits, commit) => {
  let formattedCommit;

  if (commit.match(/^\w{7,9}\s[-]*/)) {
    formattedCommit = {
      commit: commit.substring(0, 7),
      date: commit
        .match(/[(]\d{4}-\d{2}-\d{2}[T]\d{2}[:]\d{2}:\d{2}[^)]*/)[0]
        .replace(/\(|\)/g, ''),
    };
  }

  return formattedCommit
    ? [...formattedCommits, formattedCommit]
    : formattedCommits;
}, []);

if (!options.silent) {
  if (commits.length === 0) {
    console.error("Couldn't find any commits");
  } else if (commits.length === 1) {
    console.log(`${commits.length} commit was found`);
  } else {
    console.log(`${commits.length} commits were found`);
  }
}

if (!commits.length) {
  process.exit();
}

let syncPrompt;

if (!options.silent) {
  syncPrompt = prompt(
    `Are you sure you want to sync your contributions of ${options.source} into ${options.destination}? (Y/n) `,
  );
} else {
  syncPrompt = 'y';
}

if (!['y', 'Y', ''].includes(syncPrompt)) {
  process.exit();
}

const commitSorted = commits.sort((a, b) => {
  if (a.date > b.date) {
    return 1;
  }
  if (a.date < b.date) {
    return -1;
  }

  return 0;
});

const outputFile = `COMMITS${options.project ? `_${options.project}` : ''}`;

const nbNewCommits = commitSorted.reduce((count, commit) => {
  const grepStdout = exec(
    `cd ${options.destination} && grep -R ${commit.date} ${outputFile}`,
  ).stdout;
  const isNewCommit = !grepStdout;

  if (isNewCommit) {
    if (!options['dry-run']) {
      exec(
        `cd ${options.destination} && echo "${commit.date}" >> ${outputFile} && git add . && git commit -m "${commit.date}" --date="${commit.date}"`,
      );
    }
    return count + 1;
  }

  return count;
}, 0);

if (!options.silent) {
  console.log(`${nbNewCommits} commits have been created`);
}
