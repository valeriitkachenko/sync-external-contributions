# Sync External Contributions [![npm](https://img.shields.io/npm/v/sync-external-contributions.svg)](https://www.npmjs.com/package/sync-external-contributions)

![header](https://user-images.githubusercontent.com/7189823/30006552-96e72362-90c8-11e7-8034-56f45bf72771.jpg)

Reads all your contributions you've authored on local repositories with [git-standup](https://github.com/kamranahmedse/git-standup) and create a GitHub contribution activity for every commits associated with you.

It **does not copy** the content of the commit, to respect NDA and privacy it only lists commit dates you've authored and write it to a file. This is totally safe.

## Why?

For some projects, you may use other platforms such as GitLab and Bitbucket, so your daily activity won't be displayed on your GitHub page. This script solves the problem by duplicating information about your contributions to GitHub.

## Requirement

- [`git standup`](https://github.com/kamranahmedse/git-standup)

## Usage

First, you'll need a git repository where the contributions will be synced.

Create it where you want it (e.g. `~/external-contributions`), run `git init` inside and push your initial commit with an empty file named `COMMITS`.

Create your repository on GitHub and add it as origin.

To sync every commits that you've done in `~/some-project` into `~/external-contributions`:

```
npx sync-external-contributions --source ~/some-project --destination ~/external-contributions
```

```
Options

  --source string[]      Source repositories to fetch commits
  --destination string   Destination repository to sync contributions into
  --days number          Specify the number of days back to include
  --folder-depth         Specify the number of subfolders to look for repos in source
  --reset                Reset the destination repository
  --silent               Will not prompt
  --author               Author name, for example "John Doe"
  --project              Project name
  -h, --help
```

## License

sync-external-contributions is [MIT Licensed](LICENSE).
