import json

with open('frontend/src/assets/sit_campus_buildings.geojson', 'r', encoding='utf-8') as f:
    fc = json.load(f)

print(f"Total features: {len(fc['features'])}")
for feat in fc['features']:
    props = feat['properties']
    name = props.get('name')
    if name and name not in ('yes', 'Building'):
        coords = feat['geometry']['coordinates'][0]
        avg_lon = sum(p[0] for p in coords) / len(coords)
        avg_lat = sum(p[1] for p in coords) / len(coords)
        print(f"Name: {name} | Lat: {avg_lat:.6f} | Lng: {avg_lon:.6f} | Levels: {props.get('levels')}")
