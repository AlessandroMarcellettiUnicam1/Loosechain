import json

def clean_json(input_file, output_file):
    with open(input_file, 'r') as f:
        data = json.load(f)

    # Deduplicate using set of json-serialized strings
    unique_objects = []
    seen = set()

    for obj in data:
        # Remove _id if it exists
        obj.pop('_id', None)

        # Transform timestamp field
        if isinstance(obj.get('timestamp'), dict) and '$date' in obj['timestamp']:
            obj['timestamp'] = obj['timestamp']['$date']

        # Convert to string for comparison
        obj_str = json.dumps(obj, sort_keys=True)
        if obj_str not in seen:
            seen.add(obj_str)
            unique_objects.append(obj)

    # Write cleaned data
    with open(output_file, 'w') as f:
        json.dump(unique_objects, f, indent=4)

# Example usage
clean_json('Cryptokitties_6605101-6618097.json', 'output.json')
