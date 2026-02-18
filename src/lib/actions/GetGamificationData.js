/**
 * @typedef {Object} Grade
 * @property {string} criterio
 * @property {number} puntos
 * @property {boolean} es_requisito
 */

/**
 * @typedef {Object} Objective
 * @property {string} id
 * @property {string} nombre
 * @property {string} icono
 * @property {string} descripcion
 * @property {{bronce: Grade, plata: Grade, oro: Grade}} grados
 */

/**
 * @typedef {'kids' | 'adults'} Plan
 */

/**
 * @typedef {Object} Level
 * @property {number} id
 * @property {string} nombre
 * @property {Plan} plan
 * @property {number | null} nivel_anterior
 * @property {number | null} nivel_siguiente
 * @property {number} puntaje_base
 * @property {string} icono
 * @property {string} color
 * @property {string} descripcion
 * @property {string | Objective[]} objetivos - Serialized JSON string or parsed array
 */

/**
 * @typedef {Record<string, 'bronce' | 'plata' | 'oro' | null>} ObjectiveProgress
 */

/**
 * @typedef {Object} MeasurementValues
 * @property {number} weight
 * @property {number} height
 * @property {number} [fat_percentage]
 * @property {number} [muscle_percentage]
 * @property {{waist: number, hip: number, visceral: number}} [biometrics]
 * @property {{tool: 'Bialetas' | 'Monoaleta', mode: 'Velocidad' | 'Fondo'}} [specialty]
 * @property {number} nivel_actual_id
 * @property {ObjectiveProgress} progreso_objetivos
 */

/**
 * @typedef {Object} Measurement
 * @property {number} id
 * @property {string} fecha
 * @property {string} deportista_id
 * @property {string} valores // JSON string
 */

export class GetGamificationData {
	_apiClient;

	/**
	 * @param {import('../infrastructure/APIClient').default} apiClient
	 */
	constructor(apiClient) {
		this._apiClient = apiClient;
	}

	/**
	 * Fetches and parses all levels, filtering by plan.
	 * @param {Plan} plan
	 * @returns {Promise<Level[]>}
	 */
	async getLevels(plan) {
		const remoteLevels = await this._apiClient.get('niveles');
		if (!remoteLevels || !Array.isArray(remoteLevels.niveles)) {
			return [];
		}

		return remoteLevels.niveles
			.filter((level) => level.plan === plan)
			.map((level) => ({
				...level,
				objetivos: this._parseLevelObjectives(level.objetivos)
			}));
	}

	/**
	 * Fetches the latest measurement for a given athlete and parses its values.
	 * @param {string} athleteId
	 * @returns {Promise<MeasurementValues|null>}
	 */
	async getMeasurements(athleteId) {
		const remoteMeasurements = await this._apiClient.get('mediciones', { deportista: athleteId });

		if (
			!remoteMeasurements ||
			!Array.isArray(remoteMeasurements.mediciones) ||
			remoteMeasurements.mediciones.length === 0
		) {
			return null;
		}

		// Assuming the last one is the most recent
		const latestMeasurement =
			remoteMeasurements.mediciones[remoteMeasurements.mediciones.length - 1];

		return this._parseMeasurementValues(latestMeasurement.valores);
	}

	/**
	 * Fetches leaderboard data filtered by level ID.
	 * @param {number} id_nivel - The level ID to filter by.
	 * @returns {Promise<any[]>}
	 */
	async getLeaderboardData(id_nivel) {
		const remoteData = await this._apiClient.get('clasificacion', { id_nivel: id_nivel });
		if (!remoteData || !Array.isArray(remoteData.clasificacion)) {
			return [];
		}
		// Assuming the data is already in the correct format
		return remoteData.clasificacion;
	}

	/**
	 * Safely parses the JSON string for level objectives.
	 * @param {string} jsonString
	 * @returns {Objective[]}
	 * @private
	 */
	_parseLevelObjectives(jsonString) {
		if (!jsonString || typeof jsonString !== 'string') {
			return [];
		}
		try {
			const objectives = JSON.parse(jsonString);
			return Array.isArray(objectives) ? objectives : [];
		} catch (e) {
			console.error('Failed to parse level objectives JSON:', e);
			return [];
		}
	}

	/**
	 * Safely parses the JSON string for measurement values.
	 * @param {string} jsonString
	 * @returns {MeasurementValues|null}
	 * @private
	 */
	_parseMeasurementValues(jsonString) {
		if (!jsonString || typeof jsonString !== 'string') {
			return null;
		}
		try {
			// It is expected that the JSON is a valid MeasurementValues object.
			return JSON.parse(jsonString);
		} catch (e) {
			console.error('Failed to parse measurement values JSON:', e);
			return null;
		}
	}
}
