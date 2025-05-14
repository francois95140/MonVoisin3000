import sys
import ply.lex as lex
import ply.yacc as yacc
from pymongo import MongoClient
import py2neo
import psycopg2
import os
import dotenv
from genereTreeGraphviz2 import printTreeGraph
import fastapi
from fastapi.responses import JSONResponse

# Chargement des variables d'environnement
dotenv.load_dotenv()

# Les mots clés avec les variantes courantes
reserved = {
    'SELECT': 'SELECT',
    'FROM': 'FROM',
    'WHERE': 'WHERE',
    'INSERT': 'INSERT',
    'INCERT': 'INSERT',  # Ajout de la variante d'orthographe courante
    'INTO': 'INTO',
    'VALUES': 'VALUES',
    'UPDATE': 'UPDATE',
    'SET': 'SET',
    'DELETE': 'DELETE',
    'CREATE': 'CREATE',
    'DROP': 'DROP',
    'TABLE': 'TABLE',
    'DATABASE': 'DATABASE',
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
] + list(set(reserved.values()))  # Utiliser set pour éviter les doublons

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

# Ignorer les espaces et tabulations
t_ignore = ' \t\n'

# Traitement des mots
def t_NAME(t):
    r'[a-zA-Z_][a-zA-Z0-9_]*'
    t.type = reserved.get(t.value.upper(), 'NAME')
    return t

# Valeurs sous forme de chaînes
def t_STRING(t):
    r"'[^']*'"
    t.value = t.value[1:-1]  # Enlever les guillemets
    return t

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

# Fonctions d'évaluation pour les requêtes SQL
def execute_sql_statement(stmt, db_type):
    """Exécute une requête SQL selon le type de base de données"""
    print('Exécution de la requête:', stmt)
    
    if db_type.lower() == 'postgres' or db_type.lower() == 'sql':
        return execute_postgresql(stmt)
    elif db_type.lower() == 'mongo':
        return execute_mongodb(stmt)
    elif db_type.lower() == 'neo' or db_type.lower() == 'neo4j':
        return execute_neo4j(stmt)
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
    printTreeGraph(p[0])  # Affiche l'arbre syntaxique comme dans le second exemple

def p_select_commande(p):
    """select_commande : SELECT column_list FROM table_name
                       | SELECT column_list FROM table_name WHERE condition"""
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

def p_condition(p):
    """condition : NAME comp_op value"""
    p[0] = {'field': p[1], 'operator': p[2], 'value': p[3]}

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
             | NUMBER"""
    p[0] = p[1]

def p_insert_commande(p):
    """insert_commande : INSERT INTO table_name VALUES LPAREN value_list RPAREN
                       | INSERT INTO table_name LPAREN column_list RPAREN VALUES LPAREN value_list RPAREN"""
    if len(p) == 8:  # Sans liste de colonnes
        p[0] = {'type': 'INSERT', 'table': p[3], 'columns': None, 'values': p[6]}
    else:  # Avec liste de colonnes
        p[0] = {'type': 'INSERT', 'table': p[3], 'columns': p[5], 'values': p[9]}

def p_value_list(p):
    """value_list : value
                  | value COMMA value_list"""
    if len(p) == 2:
        p[0] = [p[1]]
    else:
        p[0] = [p[1]] + p[3]

def p_update_commande(p):
    """update_commande : UPDATE table_name SET assignment_list
                       | UPDATE table_name SET assignment_list WHERE condition"""
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
                       | DELETE FROM table_name WHERE condition"""
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

# Fonctions d'exécution pour chaque type de base de données
def execute_postgresql(stmt):
    conn = connect_postgres()
    if not conn:
        return "Erreur de connexion à PostgreSQL"

    try:
        cur = conn.cursor()
        
        if stmt['type'] == 'SELECT':
            columns = '*' if stmt['columns'] == ['*'] else ', '.join(stmt['columns'])
            query = f"SELECT {columns} FROM {stmt['table']}"
            
            params = []
            if stmt['where']:
                query += f" WHERE {stmt['where']['field']} {stmt['where']['operator']} %s"
                params.append(stmt['where']['value'])
            
            cur.execute(query, params)
            result = cur.fetchall()
            return result
            
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
                query += f" WHERE {stmt['where']['field']} {stmt['where']['operator']} %s"
                params.append(stmt['where']['value'])
            
            cur.execute(query, params)
            conn.commit()
            return f"Mise à jour réussie. Lignes affectées: {cur.rowcount}"
            
        elif stmt['type'] == 'DELETE':
            query = f"DELETE FROM {stmt['table']}"
            params = []
            
            if stmt['where']:
                query += f" WHERE {stmt['where']['field']} {stmt['where']['operator']} %s"
                params.append(stmt['where']['value'])
            
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

def execute_mongodb(stmt):
    client = connect_mongodb()
    if not client:
        return "Erreur de connexion à MongoDB"
    
    try:
        db = client[os.environ.get('MONGO_DB', 'admin')]
        
        if stmt['type'] == 'SELECT':
            collection = db[stmt['table']]
            query = {}
            
            if stmt['where']:
                # Construction de la condition MongoDB
                op_map = {'=': '$eq', '<>': '$ne', '<': '$lt', '>': '$gt', '<=': '$lte', '>=': '$gte'}
                mongo_op = op_map.get(stmt['where']['operator'], '$eq')
                query = {stmt['where']['field']: {mongo_op: stmt['where']['value']}}
            
            projection = None
            if stmt['columns'] != ['*']:
                projection = {col: 1 for col in stmt['columns']}
                if '_id' not in stmt['columns']:
                    projection['_id'] = 0
            
            result = list(collection.find(query, projection))
            return result
            
        elif stmt['type'] == 'INSERT':
            collection = db[stmt['table']]
            
            if stmt['columns']:
                document = dict(zip(stmt['columns'], stmt['values']))
            else:
                # Sans colonnes spécifiées, on suppose que les valeurs forment un document
                document = dict()
                for i, value in enumerate(stmt['values']):
                    document[f'field{i}'] = value
            
            result = collection.insert_one(document)
            return f"Document inséré avec l'ID: {result.inserted_id}"
            
        elif stmt['type'] == 'UPDATE':
            collection = db[stmt['table']]
            
            # Filtre pour la mise à jour
            filter_query = {}
            if stmt['where']:
                op_map = {'=': '$eq', '<>': '$ne', '<': '$lt', '>': '$gt', '<=': '$lte', '>=': '$gte'}
                mongo_op = op_map.get(stmt['where']['operator'], '$eq')
                filter_query = {stmt['where']['field']: {mongo_op: stmt['where']['value']}}
            
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
                op_map = {'=': '$eq', '<>': '$ne', '<': '$lt', '>': '$gt', '<=': '$lte', '>=': '$gte'}
                mongo_op = op_map.get(stmt['where']['operator'], '$eq')
                filter_query = {stmt['where']['field']: {mongo_op: stmt['where']['value']}}
            
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

def execute_neo4j(stmt):
    graph = connect_neo4j()
    if not graph:
        return "Erreur de connexion à Neo4j"
    
    try:
        if stmt['type'] == 'SELECT':
            # Neo4j utilise Cypher, conversion de base
            match_clause = f"MATCH (n:{stmt['table']})"
            
            where_clause = ""
            if stmt['where']:
                # Construction de la condition
                value = stmt['where']['value']
                if isinstance(value, str):
                    value = f"'{value}'"  # Guillemets pour les chaînes
                where_clause = f" WHERE n.{stmt['where']['field']} {stmt['where']['operator']} {value}"
            
            return_clause = " RETURN n"
            if stmt['columns'] != ['*']:
                return_items = [f"n.{col}" for col in stmt['columns']]
                return_clause = f" RETURN {', '.join(return_items)}"
            
            query = match_clause + where_clause + return_clause
            result = list(graph.run(query))
            return result
            
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
            # Mise à jour des nœuds
            match_clause = f"MATCH (n:{stmt['table']})"
            
            where_clause = ""
            if stmt['where']:
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
            # Suppression de nœuds
            match_clause = f"MATCH (n:{stmt['table']})"
            
            where_clause = ""
            if stmt['where']:
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

# Construire le parser
parser = yacc.yacc()

# Fonction principale d'exécution avec correction orthographique
def execute(db_type, sql_command):
    # Analyse lexicale et syntaxique
    try:
        # Correction des erreurs d'orthographe courantes
        sql_command_corrected = sql_command.lower()
        if "incert" in sql_command_corrected:
            print("Correction de 'incert' en 'insert'")
            sql_command = sql_command.lower().replace("incert", "insert")
        
        lexer.input(sql_command)
        result = parser.parse(sql_command, lexer=lexer)
        
        if not result:
            return "Erreur d'analyse: impossible de parser la commande"
        
        # Exécution de la commande
        return execute_sql_statement(result, db_type)
    
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

from fastapi import FastAPI

app = FastAPI()

@app.get("/sql/{db_type}")
async def execute_sql(db_type: str, sql_command: str):
    result = execute(db_type, sql_command)
    return {"result": result}
