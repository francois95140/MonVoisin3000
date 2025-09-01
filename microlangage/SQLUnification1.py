import sys
import ply.lex as lex
import ply.yacc as yacc
from pymongo import MongoClient
import py2neo
import psycopg2
import os
import dotenv
import json
import base64
import binascii
# from libs.genereTreeGraphviz2 import printTreeGraph

# Chargement des variables d'environnement
dotenv.load_dotenv()

# Les mots clés avec les variantes courantes
reserved = {
    'SELECT': 'SELECT',
    'FROM': 'FROM',
    'WHERE': 'WHERE',
    'AND': 'AND',
    'OR': 'OR',
    'IS': 'IS',
    'NULL': 'NULL',
    'NOT': 'NOT',
    'INSERT': 'INSERT',
    'INCERT': 'INSERT',
    'INTO': 'INTO',
    'VALUES': 'VALUES',
    'VALUES_BASE64': 'VALUES_BASE64',
    'VALUES_JSON': 'VALUES_JSON',
    'UPDATE': 'UPDATE',
    'SET': 'SET',
    'DELETE': 'DELETE',
    'CREATE': 'CREATE',
    'DROP': 'DROP',
    'TABLE': 'TABLE',
    'DATABASE': 'DATABASE',
    'TRUE': 'TRUE',
    'FALSE': 'FALSE',
}

# Les tokens
tokens = [
    'NAME',
    'COMMA',
    'LPAREN',
    'RPAREN',
    'EQ',
    'NEQ',
    'LT',
    'GT',
    'LTE',
    'GTE',
    'STRING',
    'NUMBER',
    'STAR',
    'COLON',
    'LBRACKET',
    'RBRACKET',
    'LBRACE',
    'RBRACE',
    'AMPERSAND',
    'SPECIAL_CHAR',
    'DOT',
    'BACKSLASH',
    'JSON_STRING',
] + list(set(reserved.values()))  # Utiliser set pour éviter les doublons

# IMPORTANT: L'ordre des définitions importe pour la priorité dans ply.lex
# Les chaînes doivent être définies EN PREMIER pour avoir la priorité

# JSON complexe - PRIORITÉ ABSOLUE (doit être définie avant t_STRING)
def t_JSON_STRING(t):
    r"'\{[^']*\}'"  # Commence par '{ et finit par }'
    t.value = t.value[1:-1]  # Enlever les guillemets
    return t

# Valeurs sous forme de chaînes - Version simple pour les autres cas
def t_STRING(t):
    r'''('[^']*')|("[^"]*")'''
    t.value = t.value[1:-1]  # Enlever les guillemets (simples ou doubles)
    return t

# Traitement des mots
def t_NAME(t):
    r'[a-zA-Z_][a-zA-Z0-9_]*'
    t.type = reserved.get(t.value.upper(), 'NAME')
    return t

# Règles de syntaxe pour les tokens
t_COMMA = r','
t_LPAREN = r'\('
t_RPAREN = r'\)'
t_EQ = r'='
t_NEQ = r'<>'
t_LT = r'<'
t_GT = r'>'
t_LTE = r'<='
t_GTE = r'>='
t_STAR = r'\*'
t_COLON = r':'
t_LBRACKET = r'\['
t_RBRACKET = r'\]'
t_LBRACE = r'\{'
t_RBRACE = r'\}'
t_AMPERSAND = r'&'
t_DOT = r'\.'
t_BACKSLASH = r'\\'

# Caractères spéciaux - les ignorer silencieusement dans le parsing principal
def t_SPECIAL_CHAR(t):
    r'[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ?%/\-«»]'
    pass  # Ignorer ces caractères

# Ignorer les espaces et tabulations
t_ignore = ' \t\n'

# Valeurs numériques
def t_NUMBER(t):
    r'\d+'
    t.value = int(t.value)
    return t

# Gestion des erreurs
def t_error(t):
    print(f"Caractère illégal: {t.value[0]}")
    t.lexer.skip(1)

# Créer le lexer
lexer = lex.lex()

# Précédence des opérateurs pour éviter les conflits
precedence = (
    ('left', 'OR'),
    ('left', 'AND'),
)
def execute_sql_statement(stmt, db_type, debug=False):
    """Exécute une requête SQL selon le type de base de données"""
    if debug:
        print('Exécution de la requête:', stmt)
    
    if db_type.lower() == 'postgres' or db_type.lower() == 'sql':
        return execute_postgresql(stmt, debug)
    elif db_type.lower() == 'mongo':
        return execute_mongodb(stmt, debug)
    elif db_type.lower() == 'neo' or db_type.lower() == 'neo4j':
        return execute_neo4j(stmt, debug)
    else:
        return f"Type de base de données non supporté: {db_type}"

# Règles de grammaire
def p_commande(p):
    """commande : select_commande
                | insert_commande
                | update_commande
                | delete_commande
                | create_commande
                | drop_commande"""
    p[0] = p[1]
    # printTreeGraph(p[0])  # Affiche l'arbre syntaxique comme dans le second exemple

def p_select_commande(p):
    """select_commande : SELECT column_list FROM table_name
                       | SELECT column_list FROM table_name WHERE condition_expr"""
    if len(p) == 5:
        p[0] = {'type': 'SELECT', 'columns': p[2], 'table': p[4], 'where': None}
    else:
        p[0] = {'type': 'SELECT', 'columns': p[2], 'table': p[4], 'where': p[6]}

def p_column_list(p):
    """column_list : STAR
                   | NAME
                   | NAME COMMA column_list"""
    if p[1] == '*':
        p[0] = ['*']
    elif len(p) == 2:
        p[0] = [p[1]]
    else:
        p[0] = [p[1]] + p[3]

def p_table_name(p):
    """table_name : NAME"""
    p[0] = p[1]

def p_condition_expr(p):
    """condition_expr : condition
                      | condition_expr AND condition_expr
                      | condition_expr OR condition_expr
                      | LPAREN condition_expr RPAREN"""
    if len(p) == 2:
        p[0] = p[1]
    elif len(p) == 4 and p[1] == '(':
        p[0] = p[2]  # Parenthèses
    else:
        p[0] = {'type': 'logical', 'operator': p[2], 'left': p[1], 'right': p[3]}

def p_condition(p):
    """condition : NAME comp_op value
                 | NAME IS NULL
                 | NAME IS NOT NULL"""
    if len(p) == 4 and p[2] != 'IS':
        p[0] = {'type': 'comparison', 'field': p[1], 'operator': p[2], 'value': p[3]}
    elif len(p) == 4 and p[2] == 'IS':  # IS NULL
        p[0] = {'type': 'null_check', 'field': p[1], 'operator': 'IS NULL'}
    else:  # IS NOT NULL
        p[0] = {'type': 'null_check', 'field': p[1], 'operator': 'IS NOT NULL'}

def p_comp_op(p):
    """comp_op : EQ
               | NEQ
               | LT
               | GT
               | LTE
               | GTE"""
    p[0] = p[1]

def p_value(p):
    """value : STRING
             | JSON_STRING
             | NUMBER
             | TRUE
             | FALSE
             | NULL"""
    if p[1] == 'TRUE':
        p[0] = True
    elif p[1] == 'FALSE':
        p[0] = False
    elif p[1] == 'NULL':
        p[0] = None
    else:
        p[0] = p[1]

def p_insert_commande(p):
    """insert_commande : INSERT INTO table_name VALUES LPAREN value_list RPAREN
                       | INSERT INTO table_name LPAREN column_list RPAREN VALUES LPAREN value_list RPAREN
                       | INSERT INTO table_name VALUES_BASE64 LPAREN STRING RPAREN
                       | INSERT INTO table_name VALUES_JSON LPAREN STRING RPAREN
                       | INSERT INTO table_name VALUES_JSON LPAREN JSON_STRING RPAREN"""
    if len(p) == 7 and p[4] in ['VALUES_BASE64', 'VALUES_JSON']:  # VALUES_BASE64 ou VALUES_JSON avec une seule chaîne
        if p[4] == 'VALUES_BASE64':
            p[0] = {'type': 'INSERT', 'table': p[3], 'columns': None, 'values': None, 'base64_data': p[6], 'json_data': None}
        elif p[4] == 'VALUES_JSON':
            p[0] = {'type': 'INSERT', 'table': p[3], 'columns': None, 'values': None, 'base64_data': None, 'json_data': p[6]}
    elif len(p) == 8 and p[4] in ['VALUES_BASE64', 'VALUES_JSON']:  # Gestion quand il y a des parenthèses autour du JSON/Base64
        if p[4] == 'VALUES_BASE64':
            p[0] = {'type': 'INSERT', 'table': p[3], 'columns': None, 'values': None, 'base64_data': p[6], 'json_data': None}
        elif p[4] == 'VALUES_JSON':
            p[0] = {'type': 'INSERT', 'table': p[3], 'columns': None, 'values': None, 'base64_data': None, 'json_data': p[6]}
    elif len(p) == 8 and p[4] == 'VALUES':  # Sans liste de colonnes (VALUES classique)
        p[0] = {'type': 'INSERT', 'table': p[3], 'columns': None, 'values': p[6], 'base64_data': None, 'json_data': None}
    else:  # Avec liste de colonnes (VALUES classique)
        p[0] = {'type': 'INSERT', 'table': p[3], 'columns': p[5], 'values': p[9], 'base64_data': None, 'json_data': None}

def p_value_list(p):
    """value_list : value
                  | value COMMA value_list"""
    if len(p) == 2:
        p[0] = [p[1]]
    else:
        p[0] = [p[1]] + p[3]

def p_update_commande(p):
    """update_commande : UPDATE table_name SET assignment_list
                       | UPDATE table_name SET assignment_list WHERE condition_expr"""
    if len(p) == 5:
        p[0] = {'type': 'UPDATE', 'table': p[2], 'assignments': p[4], 'where': None}
    else:
        p[0] = {'type': 'UPDATE', 'table': p[2], 'assignments': p[4], 'where': p[6]}

def p_assignment_list(p):
    """assignment_list : assignment
                       | assignment COMMA assignment_list"""
    if len(p) == 2:
        p[0] = [p[1]]
    else:
        p[0] = [p[1]] + p[3]

def p_assignment(p):
    """assignment : NAME EQ value"""
    p[0] = {'field': p[1], 'value': p[3]}

def p_delete_commande(p):
    """delete_commande : DELETE FROM table_name
                       | DELETE FROM table_name WHERE condition_expr"""
    if len(p) == 4:
        p[0] = {'type': 'DELETE', 'table': p[3], 'where': None}
    else:
        p[0] = {'type': 'DELETE', 'table': p[3], 'where': p[5]}

def p_create_commande(p):
    """create_commande : CREATE TABLE table_name LPAREN field_defs RPAREN
                       | CREATE DATABASE NAME"""
    if len(p) == 7:  # CREATE TABLE
        p[0] = {'type': 'CREATE', 'object_type': 'TABLE', 'name': p[3], 'fields': p[5]}
    else:  # CREATE DATABASE
        p[0] = {'type': 'CREATE', 'object_type': 'DATABASE', 'name': p[3]}

def p_field_defs(p):
    """field_defs : field_def
                  | field_def COMMA field_defs"""
    if len(p) == 2:
        p[0] = [p[1]]
    else:
        p[0] = [p[1]] + p[3]

def p_field_def(p):
    """field_def : NAME NAME"""
    p[0] = {'name': p[1], 'type': p[2]}

def p_drop_commande(p):
    """drop_commande : DROP TABLE NAME
                     | DROP DATABASE NAME"""
    p[0] = {'type': 'DROP', 'object_type': p[2], 'name': p[3]}

def p_error(p):
    if p:
        print(f"Erreur de syntaxe à '{p.value}'")
    else:
        print("Erreur de syntaxe à la fin de l'entrée")

# Connexion aux bases de données
# Connexion PostgreSQL
def connect_postgres():
    try:
        return psycopg2.connect(
            host=os.environ.get('POSTGRES_HOST', 'localhost'),
            port=int(os.environ.get('POSTGRES_PORT', 5432)),
            user=os.environ.get('POSTGRES_USER', 'postgres'),
            password=os.environ.get('POSTGRES_PASSWORD', ''),
            dbname=os.environ.get('POSTGRES_DB', 'postgres')
        )
    except Exception as e:
        print(f"Erreur de connexion PostgreSQL: {e}")
        return None

# Connexion MongoDB   
def connect_mongodb():
    try:
        uri = f"mongodb://{os.environ.get('MONGO_USER', '')}:{os.environ.get('MONGO_PASSWORD', '')}@{os.environ.get('MONGO_HOST', 'localhost')}:{os.environ.get('MONGO_PORT', 27017)}/{os.environ.get('MONGO_DB', 'conversations_db')}?authSource=admin"
        client = MongoClient(uri)
        client.admin.command('ping')
        # Suppression de la ligne qui pose problème
        print("Connexion MongoDB réussie ! 😈")
        return client
    except Exception as e:
        print(f"Erreur de connexion MongoDB: {e}")
        return None

# Connexion Neo4j
def connect_neo4j():
    try:
        return py2neo.Graph(
            host=os.environ.get('NEO4J_HOST', 'localhost'),
            port=int(os.environ.get('NEO4J_BOLT_PORT', 7687)),
            user=os.environ.get('NEO4J_USER', 'neo4j'),
            password=os.environ.get('NEO4J_PASSWORD', '')
        )
    except Exception as e:
        print(f"Erreur de connexion Neo4j: {e}")
        return None

def build_where_clause_postgres(condition, params):
    """Construit une clause WHERE pour PostgreSQL à partir d'une condition"""
    if condition['type'] == 'comparison':
        params.append(condition['value'])
        # Préserver la casse avec des guillemets doubles
        field_name = f'"{condition["field"]}"'
        return f"{field_name} {condition['operator']} %s"
    elif condition['type'] == 'null_check':
        # Préserver la casse avec des guillemets doubles
        field_name = f'"{condition["field"]}"'
        return f"{field_name} {condition['operator']}"
    elif condition['type'] == 'logical':
        left_clause = build_where_clause_postgres(condition['left'], params)
        right_clause = build_where_clause_postgres(condition['right'], params)
        return f"({left_clause} {condition['operator']} {right_clause})"
    
def build_mongo_query(condition):
    """Construit une requête MongoDB à partir d'une condition"""
    if condition['type'] == 'comparison':
        op_map = {'=': '$eq', '<>': '$ne', '<': '$lt', '>': '$gt', '<=': '$lte', '>=': '$gte'}
        mongo_op = op_map.get(condition['operator'], '$eq')
        return {condition['field']: {mongo_op: condition['value']}}
    elif condition['type'] == 'null_check':
        if condition['operator'] == 'IS NULL':
            return {condition['field']: None}
        else:  # IS NOT NULL
            return {condition['field']: {'$ne': None}}
    elif condition['type'] == 'logical':
        left_query = build_mongo_query(condition['left'])
        right_query = build_mongo_query(condition['right'])
        if condition['operator'] == 'AND':
            return {'$and': [left_query, right_query]}
        else:  # OR
            return {'$or': [left_query, right_query]}

# Fonctions d'exécution pour chaque type de base de données
def execute_postgresql(stmt, debug=False):
    conn = connect_postgres()
    if not conn:
        return "Erreur de connexion à PostgreSQL"

    try:
        cur = conn.cursor()
        
        if stmt['type'] == 'SELECT':
            # Préserver la casse pour PostgreSQL avec guillemets doubles
            if stmt['columns'] == ['*']:
                columns = '*'
            else:
                columns = ', '.join([f'"{col}"' for col in stmt['columns']])
            
            # Nom de table avec guillemets pour préserver la casse
            table_name = f'"{stmt["table"]}"'
            query = f"SELECT {columns} FROM {table_name}"
            
            params = []
            if stmt['where']:
                where_clause = build_where_clause_postgres(stmt['where'], params)
                query += f" WHERE {where_clause}"
            
            if debug:
                print(f"Requête SQL générée: {query}")
                print(f"Paramètres: {params}")
            
            cur.execute(query, params)
            result = cur.fetchall()
            
            # Récupérer les noms des colonnes
            col_names = [desc[0] for desc in cur.description]
            
            # Convertir en liste de dictionnaires pour un format JSON
            json_result = []
            for row in result:
                row_dict = {}
                for i, value in enumerate(row):
                    row_dict[col_names[i]] = value
                json_result.append(row_dict)
            
            return json.dumps(json_result, default=str, indent=2)
            
        elif stmt['type'] == 'INSERT':
            if stmt['columns']:
                columns = ', '.join(stmt['columns'])
                placeholders = ', '.join(['%s'] * len(stmt['values']))
                query = f"INSERT INTO {stmt['table']} ({columns}) VALUES ({placeholders})"
            else:
                placeholders = ', '.join(['%s'] * len(stmt['values']))
                query = f"INSERT INTO {stmt['table']} VALUES ({placeholders})"
            
            cur.execute(query, stmt['values'])
            conn.commit()
            return f"Insertion réussie. Lignes affectées: {cur.rowcount}"
            
        elif stmt['type'] == 'UPDATE':
            set_clause = ', '.join([f"{a['field']} = %s" for a in stmt['assignments']])
            params = [a['value'] for a in stmt['assignments']]
            
            query = f"UPDATE {stmt['table']} SET {set_clause}"
            if stmt['where']:
                where_clause = build_where_clause_postgres(stmt['where'], params)
                query += f" WHERE {where_clause}"
            
            cur.execute(query, params)
            conn.commit()
            return f"Mise à jour réussie. Lignes affectées: {cur.rowcount}"
            
        elif stmt['type'] == 'DELETE':
            query = f"DELETE FROM {stmt['table']}"
            params = []
            
            if stmt['where']:
                where_clause = build_where_clause_postgres(stmt['where'], params)
                query += f" WHERE {where_clause}"
            
            cur.execute(query, params)
            conn.commit()
            return f"Suppression réussie. Lignes affectées: {cur.rowcount}"
            
        elif stmt['type'] == 'CREATE':
            if stmt['object_type'] == 'TABLE':
                fields = ', '.join([f"{f['name']} {f['type']}" for f in stmt['fields']])
                query = f"CREATE TABLE {stmt['name']} ({fields})"
                cur.execute(query)
                conn.commit()
                return f"Table {stmt['name']} créée avec succès"
            elif stmt['object_type'] == 'DATABASE':
                query = f"CREATE DATABASE {stmt['name']}"
                cur.execute(query)
                conn.commit()
                return f"Base de données {stmt['name']} créée avec succès"
                
        elif stmt['type'] == 'DROP':
            if stmt['object_type'] == 'TABLE':
                query = f"DROP TABLE {stmt['name']}"
                cur.execute(query)
                conn.commit()
                return f"Table {stmt['name']} supprimée avec succès"
            elif stmt['object_type'] == 'DATABASE':
                query = f"DROP DATABASE {stmt['name']}"
                cur.execute(query)
                conn.commit()
                return f"Base de données {stmt['name']} supprimée avec succès"
        
        return "Commande non reconnue"
        
    except Exception as e:
        conn.rollback()
        return f"Erreur PostgreSQL: {e}"
    finally:
        if 'cur' in locals() and cur:
            cur.close()
        conn.close()

def execute_mongodb(stmt, debug=False):
    client = connect_mongodb()
    if not client:
        return "Erreur de connexion à MongoDB"
    
    try:
        db = client[os.environ.get('MONGO_DB', 'admin')]
        
        if stmt['type'] == 'SELECT':
            collection = db[stmt['table']]
            query = {}
            
            if stmt['where']:
                query = build_mongo_query(stmt['where'])
            
            projection = None
            if stmt['columns'] != ['*']:
                projection = {col: 1 for col in stmt['columns']}
                if '_id' not in stmt['columns']:
                    projection['_id'] = 0
            
            result = list(collection.find(query, projection))
            return json.dumps(result, default=str, indent=2)
            
        elif stmt['type'] == 'INSERT':
            collection = db[stmt['table']]
            
            # Vérifier si c'est des données Base64
            if stmt.get('base64_data'):
                try:
                    # Décoder les données Base64
                    decoded_bytes = base64.b64decode(stmt['base64_data'])
                    decoded_json = decoded_bytes.decode('utf-8')
                    
                    # Parser le JSON décodé
                    document = json.loads(decoded_json)
                    
                    if debug:
                        print(f"Données Base64 décodées: {decoded_json[:200]}...")
                        print(f"Document parsé type: {type(document)}")
                    
                    # Gérer les tableaux JSON pour Base64 aussi
                    if isinstance(document, list):
                        if debug:
                            print(f"Base64 contient un tableau de {len(document)} éléments")
                        
                        # Insérer tous les documents du tableau
                        result = collection.insert_many(document)
                        return f"Documents insérés: {len(result.inserted_ids)} documents avec les IDs: {result.inserted_ids}"
                    
                except binascii.Error as e:
                    return f"Erreur de décodage Base64: {e}"
                except json.JSONDecodeError as e:
                    return f"Erreur de parsing JSON après décodage Base64: {e}"
                except UnicodeDecodeError as e:
                    return f"Erreur d'encodage UTF-8 après décodage Base64: {e}"
            elif stmt.get('json_data'):
                try:
                    # Nettoyer les échappements invalides avant de parser le JSON
                    json_data = stmt['json_data']
                    if debug:
                        print(f"JSON brut reçu: {json_data[:200]}...")
                    
                    # Nettoyer les échappements Java qui ne sont pas valides en JSON
                    json_data = json_data.replace("\\'", "'")  # L'échappement \' n'est pas valide en JSON
                    json_data = json_data.replace("\\\\", "\\")  # Double échappement des backslashes
                    
                    if debug:
                        print(f"JSON nettoyé: {json_data[:200]}...")
                    
                    # Parser le JSON direct
                    parsed_json = json.loads(json_data)
                    
                    if debug:
                        print(f"JSON direct reçu: {stmt['json_data'][:200]}...")
                        print(f"Document parsé type: {type(parsed_json)}")
                    
                    # Gérer les tableaux JSON - insérer chaque élément comme document séparé
                    if isinstance(parsed_json, list):
                        if debug:
                            print(f"JSON est un tableau de {len(parsed_json)} éléments")
                        
                        # Insérer tous les documents du tableau
                        result = collection.insert_many(parsed_json)
                        return f"Documents insérés: {len(result.inserted_ids)} documents avec les IDs: {result.inserted_ids}"
                    else:
                        # Un seul document
                        document = parsed_json
                    
                except json.JSONDecodeError as e:
                    return f"Erreur de parsing JSON: {e}"
            else:
                # Mode classique avec colonnes et valeurs
                if stmt['columns']:
                    document = dict(zip(stmt['columns'], stmt['values']))
                else:
                    # Sans colonnes spécifiées, on suppose que les valeurs forment un document
                    document = dict()
                    for i, value in enumerate(stmt['values']):
                        document[f'field{i}'] = value
            
            # Cette section ne s'exécute que si on n'est pas dans le cas des tableaux JSON/Base64
            if isinstance(document, dict):
                result = collection.insert_one(document)
                return f"Document inséré avec l'ID: {result.inserted_id}"
            else:
                # Gérer le cas où document n'est ni dict ni list (ne devrait pas arriver)
                return f"Erreur: Type de document non supporté: {type(document)}"
            
        elif stmt['type'] == 'UPDATE':
            collection = db[stmt['table']]
            
            # Filtre pour la mise à jour
            filter_query = {}
            if stmt['where']:
                filter_query = build_mongo_query(stmt['where'])
            
            # Document de mise à jour
            update_doc = {'$set': {}}
            for assignment in stmt['assignments']:
                update_doc['$set'][assignment['field']] = assignment['value']
            
            result = collection.update_many(filter_query, update_doc)
            return f"Mise à jour réussie. Documents correspondants: {result.matched_count}, Documents modifiés: {result.modified_count}"
            
        elif stmt['type'] == 'DELETE':
            collection = db[stmt['table']]
            
            filter_query = {}
            if stmt['where']:
                filter_query = build_mongo_query(stmt['where'])
            
            result = collection.delete_many(filter_query)
            return f"Suppression réussie. Documents supprimés: {result.deleted_count}"
            
        elif stmt['type'] == 'CREATE':
            if stmt['object_type'] == 'TABLE':
                db.create_collection(stmt['name'])
                return f"Collection {stmt['name']} créée avec succès"
            elif stmt['object_type'] == 'DATABASE':
                client[stmt['name']]
                return f"Base de données {stmt['name']} créée avec succès"
                
        elif stmt['type'] == 'DROP':
            if stmt['object_type'] == 'TABLE':
                db.drop_collection(stmt['name'])
                return f"Collection {stmt['name']} supprimée avec succès"
            elif stmt['object_type'] == 'DATABASE':
                client.drop_database(stmt['name'])
                return f"Base de données {stmt['name']} supprimée avec succès"
        
        return "Commande non reconnue"
        
    except Exception as e:
        return f"Erreur MongoDB: {e}"
    finally:
        client.close()

def execute_neo4j(stmt, debug=False):
    graph = connect_neo4j()
    if not graph:
        return "Erreur de connexion à Neo4j"
    
    try:
        if stmt['type'] == 'SELECT':
            # Neo4j utilise Cypher, conversion de base
            match_clause = f"MATCH (n:{stmt['table']})"
            
            where_clause = ""
            if stmt['where']:
                # Construction de la condition (simplifiée pour Neo4j)
                if stmt['where']['type'] == 'comparison':
                    value = stmt['where']['value']
                    if isinstance(value, str):
                        value = f"'{value}'"  # Guillemets pour les chaînes
                    where_clause = f" WHERE n.{stmt['where']['field']} {stmt['where']['operator']} {value}"
                elif stmt['where']['type'] == 'null_check':
                    if stmt['where']['operator'] == 'IS NULL':
                        where_clause = f" WHERE n.{stmt['where']['field']} IS NULL"
                    else:
                        where_clause = f" WHERE n.{stmt['where']['field']} IS NOT NULL"
            
            return_clause = " RETURN n"
            if stmt['columns'] != ['*']:
                return_items = [f"n.{col}" for col in stmt['columns']]
                return_clause = f" RETURN {', '.join(return_items)}"
            
            query = match_clause + where_clause + return_clause
            result = list(graph.run(query))
            return json.dumps([dict(record) for record in result], default=str, indent=2)
            
        elif stmt['type'] == 'INSERT':
            # Pour Neo4j, création d'un nœud
            props = {}
            if stmt['columns']:
                props = dict(zip(stmt['columns'], stmt['values']))
            else:
                # Sans colonnes spécifiées
                for i, value in enumerate(stmt['values']):
                    props[f'prop{i}'] = value
            
            # Conversion en format Cypher pour les propriétés
            props_string = "{"
            for key, value in props.items():
                if isinstance(value, str):
                    props_string += f"{key}: '{value}', "
                else:
                    props_string += f"{key}: {value}, "
            props_string = props_string.rstrip(', ') + "}"
            
            query = f"CREATE (n:{stmt['table']} {props_string}) RETURN n"
            result = list(graph.run(query))
            return f"Nœud créé avec succès"
            
        elif stmt['type'] == 'UPDATE':
            # Mise à jour des nœuds (simplifiée)
            match_clause = f"MATCH (n:{stmt['table']})"
            
            where_clause = ""
            if stmt['where'] and stmt['where']['type'] == 'comparison':
                value = stmt['where']['value']
                if isinstance(value, str):
                    value = f"'{value}'"
                where_clause = f" WHERE n.{stmt['where']['field']} {stmt['where']['operator']} {value}"
            
            # Construction de la clause SET
            set_items = []
            for assignment in stmt['assignments']:
                value = assignment['value']
                if isinstance(value, str):
                    value = f"'{value}'"
                set_items.append(f"n.{assignment['field']} = {value}")
            
            set_clause = f" SET {', '.join(set_items)}"
            query = match_clause + where_clause + set_clause
            result = graph.run(query)
            return f"Mise à jour réussie"
            
        elif stmt['type'] == 'DELETE':
            # Suppression de nœuds (simplifiée)
            match_clause = f"MATCH (n:{stmt['table']})"
            
            where_clause = ""
            if stmt['where'] and stmt['where']['type'] == 'comparison':
                value = stmt['where']['value']
                if isinstance(value, str):
                    value = f"'{value}'"
                where_clause = f" WHERE n.{stmt['where']['field']} {stmt['where']['operator']} {value}"
            
            query = match_clause + where_clause + " DELETE n"
            result = graph.run(query)
            return f"Suppression réussie"
            
        elif stmt['type'] == 'CREATE':
            if stmt['object_type'] == 'TABLE':
                return "Neo4j ne supporte pas la création explicite de tables"
            elif stmt['object_type'] == 'DATABASE':
                return "La création de base de données Neo4j nécessite l'API d'administration"
                
        elif stmt['type'] == 'DROP':
            if stmt['object_type'] == 'TABLE':
                query = f"MATCH (n:{stmt['name']}) DELETE n"
                result = graph.run(query)
                return f"Tous les nœuds avec le label {stmt['name']} ont été supprimés"
            elif stmt['object_type'] == 'DATABASE':
                return "La suppression de base de données Neo4j nécessite l'API d'administration"
        
        return "Commande non reconnue"
        
    except Exception as e:
        return f"Erreur Neo4j: {e}"

# Construire le parser avec gestion des conflits
parser = yacc.yacc(debug=True)

# Préprocesseur pour gérer les gros blocs JSON
json_placeholders = {}
json_counter = 0

def preprocess_json_blocks(sql_command):
    """Remplace les gros blocs JSON par des placeholders simples"""
    global json_placeholders, json_counter
    json_placeholders = {}
    json_counter = 0
    
    # Chercher manuellement VALUES_JSON ('...') et extraire tout entre les quotes
    import re
    
    result = sql_command
    values_json_pos = result.find("VALUES_JSON")
    
    if values_json_pos != -1:
        # Trouver le début du JSON (après la première quote)
        start_quote = result.find("'", values_json_pos)
        if start_quote != -1:
            # Trouver la fin du JSON (dernière quote avant la parenthèse fermante)
            # Chercher depuis la fin
            end_paren = result.rfind(")")
            if end_paren != -1:
                # Chercher la dernière quote avant la parenthèse
                end_quote = result.rfind("'", start_quote + 1, end_paren)
                if end_quote != -1 and end_quote > start_quote:
                    # Extraire le contenu JSON
                    json_content = result[start_quote + 1:end_quote]
                    placeholder = f"JSON_PLACEHOLDER_{json_counter}"
                    json_placeholders[placeholder] = json_content
                    json_counter += 1
                    
                    # Remplacer dans la commande
                    result = (result[:start_quote + 1] + 
                             placeholder + 
                             result[end_quote:])
    
    return result

def restore_json_blocks(parsed_result):
    """Restaure les blocs JSON dans le résultat parsé"""
    if isinstance(parsed_result, dict):
        for key, value in parsed_result.items():
            if key == 'json_data' and value in json_placeholders:
                parsed_result[key] = json_placeholders[value]
            elif isinstance(value, (dict, list)):
                restore_json_blocks(value)
    elif isinstance(parsed_result, list):
        for item in parsed_result:
            restore_json_blocks(item)

# Fonction principale d'exécution avec correction orthographique
def execute(db_type, sql_command, debug=False):
    # Préprocessing des blocs JSON
    try:
        processed_command = preprocess_json_blocks(sql_command)
        if debug and processed_command != sql_command:
            print(f"Commande préprocessée: {processed_command[:200]}...")
        
        # Correction des erreurs d'orthographe courantes
        sql_command_corrected = processed_command.lower()
        if "incert" in sql_command_corrected:
            if debug:
                print("Correction de 'incert' en 'insert'")
            processed_command = processed_command.lower().replace("incert", "insert")
        
        lexer.input(processed_command)
        result = parser.parse(processed_command, lexer=lexer)
        
        if not result:
            return "Erreur d'analyse: impossible de parser la commande"
        
        # Restaurer les blocs JSON
        restore_json_blocks(result)
        
        # Exécution de la commande
        return execute_sql_statement(result, db_type, debug)
    
    except Exception as e:
        return f"Erreur d'exécution: {e}"

# Exemples de test
def run_tests():
    print("Test 1: Requête SELECT simple")
    print(execute("postgres", "SELECT * FROM users"))
    
    print("\nTest 2: Requête INSERT")
    print(execute("postgres", "INSERT INTO users VALUES (1, 'John')"))
    
    print("\nTest 3: Requête avec faute d'orthographe")
    print(execute("mongo", "INCERT INTO users VALUES (1, 'John')"))
    
    print("\nTest 4: Requête MongoDB")
    print(execute("mongo", "SELECT name, age FROM users WHERE age > 25"))

if __name__ == '__main__':
    debug_mode = '--debug' in sys.argv
    if debug_mode:
        sys.argv.remove('--debug')
    
    if len(sys.argv) == 3:
        # Mode avec type de base de données et commande SQL
        db_type = sys.argv[1]
        sql_command = sys.argv[2]
        result = execute(db_type, sql_command, debug_mode)
        print(result)
    elif len(sys.argv) == 2:
        # Mode avec fichier contenant les commandes SQL
        try:
            with open(sys.argv[1], 'r') as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines):
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                
                parts = line.split(' ', 1)
                if len(parts) != 2:
                    print(f"Ligne {i+1}: format incorrect. Attendu: <type_bdd> <commande>")
                    continue
                
                db_type, sql_command = parts
                result = execute(db_type, sql_command, debug_mode)
                print(f"Ligne {i+1}:")
                print(result)
                print("-" * 50)
        
        except FileNotFoundError:
            print(f"Fichier non trouvé: {sys.argv[1]}")
        except Exception as e:
            print(f"Erreur lors de la lecture du fichier: {e}")
    else:
        print("Erreur: arguments incorrects")
        print("Usage 1: python SQLUnification.py [--debug] <type_bdd> \"<commande_sql>\"")
        print("Usage 2: python SQLUnification.py [--debug] <fichier>")
        print("Où <fichier> est le nom du fichier contenant les requêtes SQL")
        print("Le flag --debug affiche les informations de débogage")
        sys.exit(1)