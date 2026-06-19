from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import pandas as pd

from app.utils.config import cluster_centers_path, csv_path


class CsvLoadError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def load_events_dataframe() -> pd.DataFrame:
    path = csv_path()
    if not path.exists():
        raise CsvLoadError(f"Dataset not found: {path}")

    df = pd.read_csv(path)
    df["start_datetime"] = pd.to_datetime(df["start_datetime"], utc=True, errors="coerce")
    df["created_date"] = pd.to_datetime(df["created_date"], utc=True, errors="coerce")
    df["resolved_datetime"] = pd.to_datetime(df["resolved_datetime"], utc=True, errors="coerce")
    df["closed_datetime"] = pd.to_datetime(df["closed_datetime"], utc=True, errors="coerce")

    # Normalized columns used across services
    df["event_ts"] = df["start_datetime"].fillna(df["created_date"])
    df["requires_road_closure"] = df["requires_road_closure"].fillna(False).astype(bool)
    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    df["zone_label"] = df.apply(
        lambda r: r["zone"] if pd.notna(r["zone"]) else (r["corridor"] if pd.notna(r["corridor"]) else "Unknown Zone"),
        axis=1,
    )
    df["zone_label"] = df["zone_label"].astype(str)

    return df


@lru_cache(maxsize=1)
def load_cluster_centers() -> pd.DataFrame:
    path = cluster_centers_path()
    if not path.exists():
        return pd.DataFrame(columns=["latitude", "longitude", "cluster_id"])
    return pd.read_csv(path)


def reload_cache() -> None:
    load_events_dataframe.cache_clear()
    load_cluster_centers.cache_clear()


def dataset_path() -> Path:
    return csv_path()
