Brown Bear Movements in Slovenia (1993–1999)

1. Dataset Source

The visualization uses the Brown Bear Slovenia dataset (1993–1999).
Downloaded via:

Download → Download Data

Download → Download Reference Data

A related study using similar tracking methods is described in [1].

2. Raw Data Structure

The downloaded CSV includes the following columns:

event-id
visible
timestamp
location-long
location-lat
behavioural-classification
comments
location-error-text
sensor-type
individual-taxon-canonical-name
tag-local-identifier
individual-local-identifier
study-name


For visualization we used only:

timestamp

location-lat

location-long

individual-local-identifier (bear ID)

3. Preprocessing Steps

To prepare the dataset for visualization, the following changes were made:

Converted the original CSV into JSON (bear_points.json)

Fields kept:
time, lat, lon, bear_id

Normalized timestamps

Extracted date in YYYY-MM-DD format.

Removed invalid points

Filtered out coordinates outside Slovenia.

Sorted points chronologically

Required for monthly slider and animation.

Loaded reference municipalities

slovenia_municipalities.geojson added for map context.

4. Important Notes About the Data

GPS frequency varies; some days have no recorded points.

Bear IDs represent individual animals but do not include age/sex.

Behaviour classification is mostly empty → excluded.

5. Visualization Features

Map of Slovenia (Leaflet)

Bear locations as points

Monthly time slider (sliding window)

Optional replay animation

Bear-specific movement paths

Hover highlight (point enlargement + other points dim)

Filter by bear ID

Municipal borders for reference

6. Reference

[1] Study documenting the Slovenian brown bear tracking project (1993–1999).