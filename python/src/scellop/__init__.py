import importlib.metadata
import pathlib

import anywidget
import traitlets

import pandas as pd
import anndata as ad

import warnings

try:
    __version__ = importlib.metadata.version("scellop")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"


class ScellopData():
    def __init__(self, counts, row_metadata, col_metadata):
        self.counts = counts
        self.rows = counts.index.tolist()
        self.cols = counts.columns.tolist()
        self.row_metadata = row_metadata
        self.col_metadata = col_metadata
    
    def __repr__(self):
        return (
            f"<ScellopData: {len(self.rows)} rows x {len(self.cols)} columns>\n"
            f"Row metadata columns: {list(self.row_metadata[next(iter(self.row_metadata))].keys()) if self.row_metadata else []}\n"
            f"Column metadata columns: {list(self.col_metadata[next(iter(self.col_metadata))].keys()) if self.col_metadata else []}"
        )
    
    def to_dict(self):
        return {
            "counts": self.counts.to_dict(),
            "metadata": {
                "row": self.row_metadata,
                "col": self.col_metadata
            }
        }


class ScellopWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"

    data = traitlets.Instance(ScellopData, default_value=ScellopData(pd.DataFrame(), list(), list())).tag(sync=False)
    df = traitlets.Instance(pd.DataFrame, default_value=pd.DataFrame()).tag(sync=False)

    dataDict = traitlets.Dict(default_value={}).tag(sync=True)

    @traitlets.observe("df")
    def _update_from_df(self, change):
        self.dataDict = ScellopData(change.new, None, None).to_dict()

    @traitlets.observe("data")
    def _update_from_scellop_data(self, change):
        self.dataDict = change.new.to_dict()


def _use_source(source):
    """
    Helper function to load obs DataFrame from different source types.

    Parameters
    ----------
    source : pd.DataFrame, ad.AnnData, or str
        Source of data, either a DataFrame, AnnData object, or a file path (string).

    Returns
    -------
    pd.DataFrame
        Loaded obs DataFrame.
    """
    if type(source) is pd.DataFrame:
        return source
    if type(source) is ad.AnnData: 
        return source.obs
    if type(source) is str:
        if source.startswith("http://") or source.startswith("https://"):
            warnings.warn("Remote sources not yet supported.")
            return
        else:
            adata = ad.read_h5ad(source, backed="r")
        df = adata.obs
        del adata
        return df

    warnings.warn(f"source type {type(source)} is not pd.DataFrame or string.")



def load_data_multiple(sources, rows, c_col, r_cols_meta=None, c_cols_meta=None):
    """
    Loader for scellop data from a list of dataframes.
    Loader for scellop data from a list of sources containing a DataFrame per dataset/sample. 

    Parameters
    ----------
    sources : list
        List of data sources, which each can be either a pandas DataFrame, AnnData object, or a file path to AnnData source (string).
    rows : list
        List of row names corresponding to each DataFrame.
    c_col : str
        Column name in obs to be used for grouping.
    r_cols_meta : list, optional
        List of column names for row metadata (default is None).
    c_cols_meta : list, optional
        List of column names for column metadata (default is None).

    Returns
    -------
    ScellopData
        Object with processed count DataFrame, row metadata dict, column metadata dict.
    """
    if len(sources) > len(rows): 
        warnings.warn("Not enough row names (in rows) supplied.")
        return
    if len(sources) < len(rows): 
        warnings.warn("Warning: more row names (in rows) supplied than data sources. Last row will not be used.")
    
    counts = None
    row_metadata = {}
    col_metadata = {}

    if r_cols_meta:
        warnings.warn("Row metadata not yet implemented for multiple sources.")
    if c_cols_meta:
        warnings.warn("Column metadata will be partially implemented for multiple sources.")

    for i in range(len(sources)):
        df = _use_source(sources[i])
        if df is None:
            continue
        if c_col not in df.keys(): 
            warnings.warn(f"Dataset {rows[i]} does not have label {c_col} in obs. Dataset skipped.")
            continue

        counts_i = df[[c_col]].reset_index(names=rows[i])
        counts_i = counts_i.groupby(c_col, observed=True).count().T
        counts = pd.concat([counts, counts_i], join="outer").fillna(0)

    counts = counts.astype(int) if counts is not None else counts

    return ScellopData(counts, row_metadata, col_metadata)


def load_data_singular(source, r_col, c_col, r_cols_meta=None, c_cols_meta=None):
    """
    Loader for scellop data from a source containing a singular DataFrame with columns for row and col.

    Parameters
    ----------
    source : pd.DataFrame or str
        Data source, either a DataFrame, AnnData object, or a file path to AnnData source (string).
    r_col : str
        Column name in obs to be used for grouping for rows.
    c_col : str
        Column name in obs to be used for grouping for cols.
    r_cols_meta : list of str, optional
        Column names in obs to extract row metadata from (e.g. donor metadata).
    c_cols_meta : list of str, optional
        Column names in obs to extract column metadata from (e.g. celltype metadata).

    Returns
    -------
    ScellopData
        Object with processed count DataFrame, row metadata dict, column metadata dict.
    """
    df = _use_source(source)
    if df is None:
        return

    if r_col not in df.keys(): 
        warnings.warn(f"DataFrame does not have label {r_col}.")
        return
    if c_col not in df.keys(): 
        warnings.warn(f"DataFrame does not have label {c_col}.")
        return

    # count matrix
    counts = df.groupby([r_col, c_col], observed=True).size().reset_index(name="count")
    counts = counts.pivot(index=r_col, columns=c_col, values="count").fillna(0)
    counts = counts.astype(int)

    # row metadata
    row_metadata = {}
    if r_cols_meta:
        df_row = df[[r_col] + r_cols_meta]

        for col in r_cols_meta:
            dfRowUnique = df_row.groupby(r_col, observed=True)[col].nunique()
            inconsistent = dfRowUnique[dfRowUnique > 1]
            if len(inconsistent) > 0:
                warnings.warn(f"Row metadata column '{col}' has inconsistent values for some {r_col} entries.")
        
        # if there are multiple values for row, use most common
        df_row = df_row.drop_duplicates(subset=r_col).dropna().groupby(r_col, observed=True).agg(lambda x: x.mode().iloc[0]).reset_index()

        row_metadata  = {
            str(row): df_row.loc[df_row[r_col] == row, r_cols_meta].iloc[0].to_dict()
            for row in counts.index
        }

    # col metadata
    col_metadata = {}
    if c_cols_meta:
        df_col = df[[c_col] + c_cols_meta]
        
        for col in c_cols_meta:
            dfColUnique = df_col.groupby(c_col, observed=True)[col].nunique()
            inconsistent = dfColUnique[dfColUnique > 1]
            if len(inconsistent) > 0:
                warnings.warn(f"Column metadata column '{col}' has inconsistent values for some {c_col} entries.")

        # if there are multiple values for col, use most common
        df_col = df_col.drop_duplicates(subset=c_col).dropna().groupby(c_col, observed=True).agg(lambda x: x.mode().iloc[0]).reset_index()

        col_metadata  = {
            str(col): df_col.loc[df_col[c_col] == col, c_cols_meta].iloc[0].to_dict()
            for col in counts.columns
        }

    return ScellopData(counts, row_metadata, col_metadata)
