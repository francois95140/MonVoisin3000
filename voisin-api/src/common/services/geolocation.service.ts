import { Injectable, Logger } from '@nestjs/common';

export interface GeolocationResult {
  quartier: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);

  /**
   * Calcule un quartier basé sur une grille géographique
   * @param address - L'adresse complète à géolocaliser
   * @returns Promise<GeolocationResult>
   */
  async getNeighborhoodFromAddress(address: string): Promise<GeolocationResult> {
    try {
      // Récupérer les coordonnées avec l'API Adresse française
      const coordinates = await this.getCoordinatesFromFrenchAPI(address);
      if (!coordinates) {
        throw new Error('Impossible de récupérer les coordonnées');
      }

      // Générer l'ID de quartier basé sur la grille géographique
      const quartierId = this.generateGridNeighborhoodId(coordinates.lat, coordinates.lon);

      return {
        quartier: quartierId,
        coordinates
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul de quartier pour l'adresse: ${address}`, error.message);
      throw new Error('Impossible de calculer le quartier sans coordonnées géographiques');
    }
  }

  /**
   * Récupère les coordonnées GPS depuis l'API Adresse française
   */
  private async getCoordinatesFromFrenchAPI(address: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        return { lat, lon };
      }

      return null;
    } catch (error) {
      this.logger.error(`Erreur API Adresse française pour: ${address}`, error.message);
      return null;
    }
  }

  /**
   * Génère un identifiant de quartier basé uniquement sur une grille géographique
   * Les coordonnées sont arrondies pour créer des zones (cellules de grille)
   * Toutes les adresses dans la même cellule ont le même quartier
   */
  private generateGridNeighborhoodId(lat: number, lon: number): string {
    // Arrondir à 3 décimales = précision ~100m
    // Cela crée des cellules géographiques où les adresses proches partagent le même quartier
    const latGrid = Math.round(lat * 1000) / 1000;
    const lonGrid = Math.round(lon * 1000) / 1000;
    
    return `${latGrid.toFixed(3)}_${lonGrid.toFixed(3)}`;
  }
}