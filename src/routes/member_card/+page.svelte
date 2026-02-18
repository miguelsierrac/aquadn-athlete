<script>
	import MemberCardScreen from '$lib/screens/MemberCardScreen.svelte';
	import { onMount, getContext } from 'svelte';
	import { AthleteNotFoundError } from '$lib/actions/GetAthlete';
	import { popup } from '$lib/stores';

	const provider = getContext('provider');
	const redirect = getContext('redirect');
	const athlete = getContext('athlete');
	const lastSync = getContext('lastSync');
	const token = getContext('token');
	const lastMeasurement = getContext('lastMeasurement');

	// Props for TechnicalSheet
	let stats = {};
	let badges = []; // This will be derived from objectives
	let level = null; // This will be the current level from gamification levels
	let isLoading = true;

	// New gamification data holders
	let gamificationLevels = [];
	let userGamificationProgress = null;

	const onLogOut = () => {
		$athlete = null;
		$lastSync = null;
	};

	onMount(async () => {
		try {
			if ($athlete) {
				const [fetchedAthlete, information, allLevels, measurements] = await Promise.all([
					provider.getAthlete.handle($athlete.identification),
					provider.getInformation.handle($athlete.id).catch((error) => {
						console.error('Error fetching information:', error);
						return null; // Gracefully handle if info fails
					}),
					provider.getGamificationData.getLevels($athlete.tier === 'kids' ? 'kids' : 'adults'),
					provider.getGamificationData.getMeasurements($athlete.id)
				]);

				// 1. Update core athlete data
				$athlete = fetchedAthlete;
				if (information) {
					$athlete.total_distance = information.total_distance;
					$athlete.weeklyDistance = information.weeklyDistance;
					$athlete.monthlyRecord = information.monthlyRecord;
					$athlete.monthlyRecordDate = information.monthlyRecordDate;
				}

				// Token sync
				if ($token && $athlete.token !== $token) {
					$athlete.token = $token;
					await provider.saveToken.handle($athlete);
				}
				$lastSync = new Date();

				// 2. Process gamification data
				gamificationLevels = allLevels;
				userGamificationProgress = measurements;

				if (userGamificationProgress) {
					// Find the athlete's current level object
					level =
						gamificationLevels.find((l) => l.id === userGamificationProgress.nivel_actual_id) ||
						null;

					// Derive `badges` from the objectives of the current level
					if (level) {
						badges = level.objetivos.map((obj) => ({
							...obj,
							progress: userGamificationProgress.progreso_objetivos[obj.id] || null
						}));
					}

					// 3. Populate `stats` for the TechnicalSheet
					stats = {
						measurementDate: new Date(), // The new measurement endpoint doesn't bring a date, using current
						height: userGamificationProgress.height || null,
						weight: userGamificationProgress.weight || null
					};

					if ($athlete.tier === 'kids') {
						const totalObjectives = level ? level.objetivos.length : 0;
						const completedObjectives = Object.values(
							userGamificationProgress.progreso_objetivos
						).filter((p) => p !== null).length;

						stats = {
							...stats,
							levelName: level?.nombre,
							levelIcon: level?.icono,
							levelColor: level?.color,
							levelProgress:
								totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0
						};
					} else if (['health', 'performance'].includes($athlete.tier)) {
						const totalObjectives = level ? level.objetivos.length : 0;
						const completedObjectives = Object.values(
							userGamificationProgress.progreso_objetivos
						).filter((p) => p !== null).length;

						stats = {
							...stats,
							fatPercentage: userGamificationProgress.fat_percentage || null,
							musclePercentage: userGamificationProgress.muscle_percentage || null,
							waist: userGamificationProgress.biometrics?.waist || null,
							hip: userGamificationProgress.biometrics?.hip || null,
							visceralFat: userGamificationProgress.biometrics?.visceral || null,
							specialty: userGamificationProgress.specialty || null,
							levelName: level?.nombre,
							levelIcon: level?.icono,
							levelColor: level?.color,
							levelProgress:
								totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0
						};
					}
				}

				if (userGamificationProgress && $lastMeasurement) {
					const newAchievements = [];
					const previousLevelId = $lastMeasurement.nivel_actual_id;
					const currentLevelId = userGamificationProgress.nivel_actual_id;

					// 1. Check for level up
					if (currentLevelId && previousLevelId && currentLevelId !== previousLevelId) {
						const newLevel = gamificationLevels.find((l) => l.id === currentLevelId);
						const oldLevel = gamificationLevels.find((l) => l.id === previousLevelId);
						// Assuming higher ID means higher level
						if (newLevel && oldLevel && newLevel.id > oldLevel.id) {
							newAchievements.push({
								type: 'level',
								name: newLevel.nombre,
								icon: newLevel.icono
							});
						}
					}

					// 2. Check for new/upgraded badges
					const previousProgress = $lastMeasurement.progreso_objetivos || {};
					const currentProgress = userGamificationProgress.progreso_objetivos || {};
					const gradeValues = { bronce: 1, plata: 2, oro: 3 };

					const allObjectives = gamificationLevels.flatMap((l) => l.objetivos);

					for (const objectiveId in currentProgress) {
						const previousGrade = previousProgress[objectiveId];
						const currentGrade = currentProgress[objectiveId];

						if (currentGrade) {
							// Only consider if there is a grade
							const previousValue = previousGrade ? gradeValues[previousGrade] : 0;
							const currentValue = gradeValues[currentGrade];

							if (currentValue > previousValue) {
								const objective = allObjectives.find((o) => o.id === objectiveId);
								if (objective) {
									newAchievements.push({
										type: 'badge',
									name: objective.nombre,
									icon: objective.icono,
									grade: currentGrade
									});
								}
							}
						}
					}

					// 3. Trigger popup
					if (newAchievements.length > 0) {
						popup.set({
							title: '¡Felicidades!',
							message: '¡Has alcanzado nuevos logros!',
							achievements: newAchievements,
							totalDistance: information?.total_distance || null
						});
					}
				}

				// Update last measurement for the next sync
				$lastMeasurement = userGamificationProgress;
			}
		} catch (error) {
			if (error instanceof AthleteNotFoundError) {
				$athlete = null;
				$lastSync = null;
				redirect('/');
				return;
			}
			console.error('Error during initial data fetch:', error);
			// Optionally show a user-facing error message
			popup.set({
				title: 'Error',
				message: 'No se pudieron cargar los datos. Inténtalo de nuevo más tarde.'
			});
		} finally {
			isLoading = false;
		}
	});

	$: {
		if (!$athlete) {
			redirect('/');
		}
	}
</script>

<MemberCardScreen
	bind:athlete={$athlete}
	{onLogOut}
	{badges}
	{level}
	{stats}
	{isLoading}
	{gamificationLevels}
	currentUserID={$athlete?.id}
/>
