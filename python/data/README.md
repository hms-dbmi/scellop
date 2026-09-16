# Datasets

This folder contains datasets used in example notebooks and testing of the _scellop_ Python package.

It contains a dataset from the Human Lung Cell Atlas, and three datasets from the Human BioMolecular Atlas Program (HuBMAP).

The original datasets, all in AnnData format, are modified to only keep the 'obs' table, to minimize the size of the files. The original HCLA dataset is available [here](https://cellxgene.cziscience.com/collections/6f6d381a-7701-4781-935c-db10d30de293). This dataset is filtered to the first 5 unique donor ids to reduce file size. The original HuBMAP datasets are available [here](https://portal.hubmapconsortium.org/search/datasets?N4IgzgpghgTgxgCxALhAVzQSwCZgAQC8eA2gOQDsALBAAwCccARo3QIxSNQ0BsjlAHJQBMdbgFZWTAMz9+dSjVIAaPKSFxBUftw4SIcKVFatu-bP05jyU7FPU0oy1axuyhAM0bQIdcjXf8njT8UNzuNIzkvO6sQuSkALogSuAA9jAALgBimBAANtgooO65BSggAA5ojHmYYAgQ2AD6GZgAthBgGVBtFckg2Jgw+q2pAHbl2J1w-ZBw49iwAJ45+YXIxaXrIG1QFRWNTV1QGWhg-YPDcKMTqFNgMwC+jykleRkQMOcbIDBQAO5NRbdSAZFpLA5FEAANygeTQnShAGValMALSQACOKGIIBROAgGIgmJISLhbXGSQSLxAGQhEHKAAkAJIAUQASgBBdkAYRZPM5ABkQM9HkA). The UUIDs of the HuBMAP datasets are:
1. 74e09cbb91aba06b48429651cb388940
2. 2c84a86ab51ec3a1168d8ba573d32c0a
3. 13d882fbeae970f8fb08a6f0b76bf127

They are compressed with a HuBMAP Workspaces [template](https://portal.hubmapconsortium.org/templates/compress_anndata), source available [here](https://github.com/hubmapconsortium/user-templates-api/blob/development/src/user_templates_api/templates/jupyter_lab/templates/compress_anndata/template.ipynb).
