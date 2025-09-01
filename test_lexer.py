#!/usr/bin/env python3
import sys
import os
sys.path.append('/home/ethan/Desktop/MonVoisin3000/microlangage')

import SQLUnification1

# Test simple avec JSON
test_json = '{"nom":"test","ville":"Paris"}'
print(f"Test JSON: {test_json}")

try:
    result = SQLUnification1.execute('test', f'INSERT INTO test VALUES_JSON (\'{test_json}\')')
    print(f'Résultat: {result}')
except Exception as e:
    print(f'Erreur: {e}')