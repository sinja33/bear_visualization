import pandas as pd

df = pd.read_csv("data/brown_bear_data.csv")

df = df[[
    "timestamp",
    "location-long",
    "location-lat",
    "individual-local-identifier"
]]

df["timestamp"] = pd.to_datetime(df["timestamp"])

df = df[(df["timestamp"].dt.year >= 1993) & (df["timestamp"].dt.year <= 1999)]

df_out = df.rename(columns={
    "timestamp": "time",
    "location-long": "lon",
    "location-lat": "lat",
    "individual-local-identifier": "bear_id"
})

df_out["time"] = df_out["time"].dt.strftime("%Y-%m-%dT%H:%M:%S")

df_out.to_json("data/bear_points.json", orient="records")
