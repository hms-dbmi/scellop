# Contributing to scellop

## Local development

### Set up

Create a virtual environment and and install python in *editable* mode with the optional development dependencies:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

You then need to install the JavaScript dependencies and run the development server.

```sh
pnpm install
pnpm run dev
```

### Start a session
You need the following three items running: 
1. `pnpm run widget` in scellop
2. `pnpm run dev` in python
3. Open `example.ipynb` in JupyterLab, VS Code, or your favorite editor
to start developing. 

Changes made in `js/` will be reflected in the notebook.
