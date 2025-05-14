import uvicorn
from SQLUnificationAPI import app  # Remplacez 'votre_module' par le nom du fichier contenant votre code

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)