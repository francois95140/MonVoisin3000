#!/usr/bin/env python3

import base64
import json

# Test de notre logique de décodage Base64
test_json = {"news": {"paris": [{"title": "Test News", "description": "Test description"}]}}
json_string = json.dumps(test_json)
encoded = base64.b64encode(json_string.encode('utf-8')).decode('utf-8')

print("JSON original:", json_string)
print("Base64 encodé:", encoded)

# Simulation du décodage comme dans notre code
try:
    decoded_bytes = base64.b64decode(encoded)
    decoded_json = decoded_bytes.decode('utf-8')
    document = json.loads(decoded_json)
    
    print("JSON décodé:", decoded_json)
    print("Document type:", type(document))
    print("Document:", document)
    
    print("SUCCESS: Le décodage Base64 fonctionne correctement!")
    
except Exception as e:
    print("ERROR:", e)