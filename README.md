# Team Flux Working App

This is for the JHU Whiting School of Engineering Computer Science Software Engineering course 
## Dependencies

-  Python 2.7.10 and Pip

- Pipenv: https://github.com/pypa/pipenv

- The best way to install Pipenv on Mac is get [Homebrew](https://brew.sh) and do `brew install pipenv`

## How to run

```
git clone https://github.com/teamfluxhq/clueless.git
cd clueless
```

- After you have everything installed make sure you're in the top level of the directory and do:

```
pipenv install
pipenv shell
```
- Then run python src/index.py

- Open http://localhost:5000 in the browser

You can exit out of the pipenv shell by simply typing `exit` into the terminal.

## How to update the code

- If you want to make changes to the code, it's recommended that you make your own branch, to create your own branch example branch with name `yourname` type:

```
git branch yourname
```

- Then you want to checkout the branch so type:

```
git checkout yourname
```

- If you type `git branch` you can see all of the current branches, the one with the asterisk on it will be the branch you're current only.

- After you make changes, you can commit those changes to your branch and push them remotely by doing:

- `git add .`

- `git commit -m "Descriptive message regarding changes"`

- `git push origin yourname`

Now if you go to your browser and navigate to the repo you should be able to see the branch there, if you want to merge your branch into `master` then you can create a pull request from the website. The pull request will be reviewed before being merged into the `master` branch.
