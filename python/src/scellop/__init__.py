import importlib.metadata
import pathlib
import json
import os
import re
from collections import Counter

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
        """
        Initialize a ScellopData object.

        Parameters
        ----------
        counts : pd.DataFrame
            Count matrix with rows as observations and columns as categories.
        row_metadata : dict
            Dictionary mapping row names to metadata dictionaries.
        col_metadata : dict
            Dictionary mapping column names to metadata dictionaries.
        """
        self.counts = counts
        self.rows = counts.index.tolist()
        self.cols = counts.columns.tolist()
        self.row_metadata = row_metadata
        self.col_metadata = col_metadata
    
    def __repr__(self):
        """Representation method."""
        return (
            f"<ScellopData: {len(self.rows)} rows x {len(self.cols)} columns>\n"
            f"Row metadata columns: {list(self.row_metadata[next(iter(self.row_metadata))].keys()) if self.row_metadata else []}\n"
            f"Column metadata columns: {list(self.col_metadata[next(iter(self.col_metadata))].keys()) if self.col_metadata else []}\n\n"
            f"Fields: counts, rows, cols, row_metadata, col_metadata\n"
            f"Methods: to_dict, to_json, to_js, remove_rows, remove_columns, add_rows, add_columns\n"
        )
    
    @classmethod
    def from_json(cls, text):
        """
        Loader for scellop data from a JSON file. Either supply file name or text content.

        Parameters
        ----------
        text : str
            File path to JSON file or JSON content.

        Returns
        -------
        ScellopData
            Object with processed count DataFrame, row metadata dict, column metadata dict.
        """
        if isinstance(text, str):
            try:
                with open(text) as f:
                    obj = json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"JSON file not found: {text}.\nIf you want to pass JSON content, please pass a dictionary object instead of a string.")
        else:
            obj = text
            
        df = pd.DataFrame(obj["countsMatrix"], columns=obj["countsMatrixOrder"])
        counts = df.pivot(index="row", columns="col", values="value")

        row_metadata = obj["metadata"]["rows"]
        col_metadata = obj["metadata"]["cols"]

        return cls(counts, row_metadata, col_metadata)

    @classmethod
    def from_js(cls, text):
        """
        Loader for scellop data from a JavaScript file. Either supply file name or text content.
        Assumes JavaScript file name does not contain both characters '{' and '}'.

        Parameters
        ----------
        text : str
            File path to JavaScript file or JavaScript text content.

        Returns
        -------
        ScellopData
            Object with processed count DataFrame, row metadata dict, column metadata dict.
        """
        if isinstance(text, str):
            if "{" in text and "}" in text:
                text = text
            else:
                try:
                    text = open(text).read()
                except FileNotFoundError:
                    raise FileNotFoundError(f"JavaScript file not found: {text}.")
        else:
            raise ValueError("Input must be a file path or string content.")
        
        t = text.strip()

        if t.startswith("export"):
            t = t.split("=", 1)[1].strip()

        if t.endswith(";"):
            t = t[:-1].strip()

        t = re.sub(r'(?<!")(\b\w+\b)(?=\s*:)', r'"\1"', t)

        obj = json.loads(t)
        return cls.from_json(obj)

    def to_dict(self):
        """
        Convert ScellopData to a dictionary. Used for updating widget state.

        Returns
        -------
        dict
            Dictionary with counts (as nested dicts) and metadata for rows and columns.
        """
        return {
            "counts": self.counts.T.to_dict(),
            "metadata": {
                "row": self.row_metadata,
                "col": self.col_metadata
            }
        }
    
    def to_json(self, file=None):
        """
        Convert ScellopData to JSON-compatible object or save to file. Used in to_js method.

        Parameters
        ----------
        file : str, optional
            File path to write JSON. If None, returns the JSON object.

        Returns
        -------
        dict or None
            JSON-compatible dictionary if no file is provided.
        """
        flattened_counts = self.counts.stack().reset_index()
        counts_cols = ['row', 'col', 'value']
        flattened_counts.columns = counts_cols
        flattened_list = flattened_counts.values.tolist()

        obj = {
            "countsMatrix": flattened_list,
            "countsMatrixOrder": counts_cols,
            "rowNames": self.counts.index.tolist(),
            "colNames": self.counts.columns.tolist(),
            "metadata": {
                "rows": self.row_metadata,
                "cols": self.col_metadata
            }
        }
        
        if file:
            with open(file, "w") as f:
                json.dump(obj, f, indent=2)
        else: 
            return obj
        
    def to_js(self, file=None):
        """
        Convert ScellopData to JavaScript object text or save to file.
        Can be loaded into scellop's JavaScript module.

        Parameters
        ----------
        file : str, optional
            File path to write JS. If None, returns JS text.

        Returns
        -------
        str or None
            JavaScript object text if no file is provided.
        """
        obj = self.to_json()

        def format(v, indent=2, compact=False, top_level=False):
            ind = " " * indent

            if isinstance(v, dict):
                lines = ["{"]
                for i, (k, val) in enumerate(v.items()):
                    comma = "," if i < len(v) - 1 else ""
                    if top_level or k in ["rows", "cols"]:
                        key_str = k
                    else:
                        key_str = f'"{k}"'
                    val_str = format(val, indent + 2, compact=(k == "countsMatrix"), top_level=(k == "metadata"))
                    lines.append(f"{ind}{key_str}: {val_str}{comma}")
                lines.append(f'{" " * (indent - 2)}}}')
                return "\n".join(lines)

            elif isinstance(v, list):
                lines = []
                for i, x in enumerate(v):
                    comma = "," if i < len(v) - 1 else ""
                    if compact and isinstance(x, list):
                        inner = ", ".join(format(y) if isinstance(y, str) else str(y) for y in x)
                        lines.append(f"{ind}[{inner}]{comma}")
                    else:
                        lines.append(f"{ind}{format(x)}{comma}")
                return "[\n" + "\n".join(lines) + f"\n{ind[:-2]}]"

            elif isinstance(v, str):
                return '"' + v.replace('"', '\\"') + '"'
            else:
                return str(v)
                
        text = format(obj, indent=2, top_level=True)

        if file:
            with open(file, "w") as f:
                f.write(f"export const data = {text};")
        else:
            return text

    def remove_rows(self, rows):
        """
        Remove rows from ScellopData.

        Parameters
        ----------
        rows : list
            List of row names to remove.
        """
        keep_rows = [r for r in self.rows if r not in rows]
        self.counts = self.counts.loc[keep_rows, :]
        self.rows = keep_rows
        self.row_metadata = {r: meta for r, meta in self.row_metadata.items() if r in keep_rows}

    def remove_cols(self, cols):
        """
        Remove columns from ScellopData.

        Parameters
        ----------
        cols : list
            List of column names to remove.
        """
        keep_cols = [c for c in self.cols if c not in cols]
        self.counts = self.counts.loc[:, keep_cols]
        self.cols = keep_cols
        self.col_metadata = {c: meta for c, meta in self.col_metadata.items() if c in keep_cols}

    def merge(self, other, merge_datasets=False, suffix="_2", inplace=False):
        """
        Merge another ScellopData into this one.

        Parameters
        ----------
        other : ScellopData
            Another ScellopData object to merge with.
        merge_datasets : bool, optional
            If True, overlapping rows will have their counts summed. 
            If False, overlapping rows will be renamed with a '_2' suffix. Default is False.
        suffix : str, optional
            Suffix to append to overlapping row names when merge_datasets is False.
        inplace : bool, optional
            If True, modifies the current object. If False, returns a new ScellopData object. Default is True.
        
        Returns
        -------
        ScellopData or None
            New ScellopData object if inplace is False, otherwise None.
        """
        if not isinstance(other, type(self)):
            raise TypeError("Can only merge with another ScellopData object.")

        def _next_available_name(base, existing, suffix):
            print(base, existing, suffix)
            new_name = f"{base}{suffix}"
            i = 2
            while new_name in existing:
                new_name = f"{base}{suffix}_{i}"
                i += 1
            return new_name
        
        cols_new = list(set(self.cols).union(set(other.cols)))
        df1 = self.counts.reindex(columns=cols_new, fill_value=0)
        df2 = other.counts.reindex(columns=cols_new, fill_value=0)

        rows_self = set(self.rows)
        rows_other = set(other.rows)
        overlap = rows_self & rows_other
        renamed_index = {}

        if not overlap: 
            counts_new = pd.concat([df1, df2], axis=0)
        else:
            if merge_datasets:
                counts_new = df1.add(df2, fill_value=0).astype(int)
            else:
                renamed_index = {
                    r: _next_available_name(r, df1.index.to_list() + df2.index.to_list(), suffix)
                    for r in overlap
                }
                df2_renamed = df2.rename(index=renamed_index)
                counts_new = pd.concat([df1, df2_renamed], axis=0)
        
        col_metadata_new = self.col_metadata.copy()
        for col, meta in other.col_metadata.items():
            if col not in col_metadata_new:
                col_metadata_new[col] = meta
            else:
                for k, v in meta.items():
                    if k in col_metadata_new[col]:
                        if col_metadata_new[col][k] != v:
                            warnings.warn(
                                f"Conflict for column '{col}' key '{k}': "
                                f"{col_metadata_new[col][k]} (kept) vs {v} (other)."
                            )
                    else:
                        col_metadata_new[col][k] = v

        row_metadata_new = self.row_metadata.copy()
        for row, meta in other.row_metadata.items():
            
            row_key = row if row not in overlap or merge_datasets else renamed_index.get(row, row)
            if row_key not in row_metadata_new:
                row_metadata_new[row_key] = meta
            else:
                for k, v in meta.items():
                    if k in row_metadata_new[row_key]:
                        if row_metadata_new[row_key][k] != v:
                            warnings.warn(
                                f"Conflict for row '{row_key}' key '{k}': "
                                f"{row_metadata_new[row_key][k]} (kept) vs {v} (other)."
                            )
                    else:
                        row_metadata_new[row_key][k] = v

        if inplace:
            self.counts = counts_new
            self.rows = self.counts.index.tolist()
            self.cols = self.counts.columns.tolist()
            self.row_metadata = row_metadata_new
            self.col_metadata = col_metadata_new
        else:
            return ScellopData(counts_new, row_metadata_new, col_metadata_new)

    def rename_rows(self, dict):
        """
        Rename rows in ScellopData.

        Parameters
        ----------
        mapping : dict
            Dictionary mapping old row names to new row names.
        """
        self.counts = self.counts.rename(index=dict)
        self.rows = self.counts.index.tolist()
        self.row_metadata = {dict.get(r, r): meta for r, meta in self.row_metadata.items()}

    def rename_cols(self, dict):
        """
        Rename cols in ScellopData.

        Parameters
        ----------
        mapping : dict
            Dictionary mapping old col names to new col names.
        """
        self.counts = self.counts.rename(columns=dict)
        self.cols = self.counts.columns.tolist()
        self.col_metadata = {dict.get(c, c): meta for c, meta in self.col_metadata.items()}


class ScellopWidget(anywidget.AnyWidget):
    """
    AnyWidget-based widget for scellop.

    Users can interact with the following attributes:

    Attributes
    ----------
    data : ScellopData
    df : pd.DataFrame with counts
    """
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
            if not os.path.exists(source):
                warnings.warn(f"File not found: {source}")
                return None
            try:
                adata = ad.read_h5ad(source, backed="r")
            except Exception as e:
                warnings.warn(f"Failed to read {source}: {e}")
                return None
        df = adata.obs
        del adata
        return df

    warnings.warn(f"source type {type(source)} is not pd.DataFrame or string.")


def find_colnames(source):
    """
    Helper function to list column names in obs of a source.

    Parameters
    ----------
    source : pd.DataFrame, ad.AnnData, or str
        Source of data, either a DataFrame, AnnData object, or a file path (string).

    Returns
    -------
    list
        List of column names in obs DataFrame.
    """
    df = _use_source(source)
    if df is None:
        return
    return df.columns.tolist()


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

    # counts matrix
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

        # row metadata
        if r_cols_meta:
            r_meta_values = {}
            for meta_col in r_cols_meta:
                if meta_col in df.columns:
                    unique_values = df[meta_col].unique()
                    if len(unique_values) > 1:
                        warnings.warn(f"Row metadata column '{meta_col}' has multiple values in dataset {rows[i]}. Using most common value.")
                    r_meta_values[meta_col] = Counter(unique_values).most_common(1)[0][0]
                else:
                    warnings.warn(f"Row metadata column {meta_col} not found in dataset {rows[i]}")
            row_metadata[rows[i]] = r_meta_values

        # col metadata
        if c_cols_meta:
            for meta_col in c_cols_meta:
                if meta_col in df.columns:
                    unique_values = df[[c_col, meta_col]].drop_duplicates()
                    
                    col_values = {}
                    for _, row in unique_values.iterrows():
                        col = row[c_col]
                        value = row[meta_col]
                        col_values.setdefault(col, []).append(value)
                    
                    for col, values in col_values.items():
                        if len(values) > 1:
                            warnings.warn(f"Column metadata column '{meta_col}' has multiple values for column '{col}' in dataset {rows[i]}. Using most common value.")
                        most_common_value = Counter(values).most_common(1)[0][0]
                        if col not in col_metadata:
                            col_metadata[col] = {}
                        col_metadata[col][meta_col] = most_common_value
                else:
                    warnings.warn(f"Column metadata column {meta_col} not found in dataset {rows[i]}")
        
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
