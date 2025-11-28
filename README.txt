Brown Bear Movements in Slovenia (1993–1999)

DATASET

The visualization uses the Brown Bear Slovenia dataset (1993–1999).
The downloaded CSV includes the following columns:
    - event-id
    - visible
    - timestamp
    - location-long
    - location-lat
    - behavioural-classification
    - comments
    - location-error-text
    - sensor-type
    - individual-taxon-canonical-name
    - tag-local-identifier
    - individual-local-identifier
    - study-name


For visualization we used only:

    1. timestamp -> date/time of GPS fix
    2. location-lat -> geographic position
    3. location-long -> geographic position
    4. individual-local-identifier -> bear ID

To prepare the dataset for visualization, I preprocessed the data using the python script 'process_data.py'

    1. Converted the raw CSV to JSON ('data\bear_points.json')
    2. Only the following keys were kept:
    time, lat, lon, bear_id
    3. Normalized timestamps - converted to YYYY-MM-DD format


VISUALIZATION

Features include:
- Map of Slovenia (Leaflet)
- Bear locations as points
- Monthly time slider (sliding window)
= Bear-specific movement paths
- Hover highlight (point enlargement + other points dim)
- Filter by bear ID
- Municipal borders for reference ('data/slovenia_municipalities.geojson')

