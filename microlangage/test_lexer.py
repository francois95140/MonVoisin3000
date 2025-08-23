import ply.lex as lex

# Test simple pour vérifier les tokens
reserved = {
    'SELECT': 'SELECT',
    'FROM': 'FROM', 
    'WHERE': 'WHERE',
    'AND': 'AND',
    'OR': 'OR',
    'IS': 'IS',
    'NULL': 'NULL',
    'TRUE': 'TRUE',
    'FALSE': 'FALSE',
}

tokens = [
    'NAME',
    'EQ',
    'STRING',
] + list(reserved.values())

t_EQ = r'='

def t_NAME(t):
    r'[a-zA-Z_][a-zA-Z0-9_]*'
    t.type = reserved.get(t.value.upper(), 'NAME')
    return t

def t_STRING(t):
    r"'[^']*'"
    t.value = t.value[1:-1]
    return t

t_ignore = ' \t\n'

def t_error(t):
    print(f"Caractère illégal: {t.value[0]}")
    t.lexer.skip(1)

lexer = lex.lex()

# Test
test_sql = "SELECT * FROM users WHERE email = 'test@test.com' AND isActive = TRUE AND deletedAt IS NULL"
lexer.input(test_sql)

print("Tokens détectés:")
while True:
    tok = lexer.token()
    if not tok:
        break
    print(f"{tok.type}: {tok.value}")